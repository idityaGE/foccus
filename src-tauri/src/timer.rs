use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use tokio::sync::{mpsc, Mutex};
use tokio::time::{interval, Duration};
use std::thread;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Segment {
    pub label: String,
    pub duration_secs: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum TimerStatus {
    Running,
    Paused,
    Stopped,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TimerState {
    pub status: TimerStatus,
    pub remaining_secs: u32,
    pub current_segment: usize,
    pub total_segments: usize,
    pub segment_label: String,
    pub segment_duration: u32,
}

#[derive(Debug)]
pub enum TimerCommand {
    Start(Vec<Segment>),
    Pause,
    Resume,
    Stop,
    Skip,
}

// Event payloads
#[derive(Clone, Serialize)]
pub struct TickPayload {
    pub remaining_secs: u32,
    pub segment_index: usize,
    pub segment_label: String,
    pub total_segments: usize,
    pub segment_duration: u32,
}

#[derive(Clone, Serialize)]
pub struct SegmentEndPayload {
    pub completed_label: String,
    pub completed_index: usize,
    pub next_label: Option<String>,
    pub next_index: Option<usize>,
}

#[derive(Clone, Serialize)]
pub struct StateChangePayload {
    pub status: TimerStatus,
}

pub struct TimerEngine {
    cmd_tx: mpsc::Sender<TimerCommand>,
    state: Arc<Mutex<TimerState>>,
}

impl TimerEngine {
    pub fn new(app_handle: AppHandle) -> Self {
        let (cmd_tx, cmd_rx) = mpsc::channel::<TimerCommand>(32);
        let state = Arc::new(Mutex::new(TimerState {
            status: TimerStatus::Stopped,
            remaining_secs: 0,
            current_segment: 0,
            total_segments: 0,
            segment_label: String::new(),
            segment_duration: 0,
        }));

        let state_clone = state.clone();

        // Spawn a dedicated Tokio runtime on its own thread
        // (Tauri doesn't run a Tokio runtime by default)
        thread::spawn(move || {
            let rt = tokio::runtime::Builder::new_current_thread()
                .enable_all()
                .build()
                .expect("Failed to build tokio runtime for timer");
            rt.block_on(Self::run_loop(app_handle, cmd_rx, state_clone));
        });

        Self { cmd_tx, state }
    }

    pub fn send_blocking(&self, cmd: TimerCommand) {
        let _ = self.cmd_tx.blocking_send(cmd);
    }

    pub fn get_state_blocking(&self) -> TimerState {
        self.state.blocking_lock().clone()
    }

    async fn run_loop(
        app: AppHandle,
        mut cmd_rx: mpsc::Receiver<TimerCommand>,
        state: Arc<Mutex<TimerState>>,
    ) {
        let mut segments: Vec<Segment> = Vec::new();
        let mut current_idx: usize = 0;
        let mut remaining: u32 = 0;
        let mut running = false;
        let mut ticker = interval(Duration::from_secs(1));

        loop {
            tokio::select! {
                Some(cmd) = cmd_rx.recv() => {
                    match cmd {
                        TimerCommand::Start(segs) => {
                            if segs.is_empty() {
                                continue;
                            }
                            segments = segs;
                            current_idx = 0;
                            remaining = segments[0].duration_secs;
                            running = true;

                            {
                                let mut s = state.lock().await;
                                s.status = TimerStatus::Running;
                                s.remaining_secs = remaining;
                                s.current_segment = current_idx;
                                s.total_segments = segments.len();
                                s.segment_label = segments[0].label.clone();
                                s.segment_duration = segments[0].duration_secs;
                            }

                            let _ = app.emit("timer:state-change", StateChangePayload {
                                status: TimerStatus::Running,
                            });
                            let _ = app.emit("timer:tick", TickPayload {
                                remaining_secs: remaining,
                                segment_index: current_idx,
                                segment_label: segments[0].label.clone(),
                                total_segments: segments.len(),
                                segment_duration: segments[0].duration_secs,
                            });

                            ticker = interval(Duration::from_secs(1));
                            ticker.tick().await; // consume first immediate tick
                        }
                        TimerCommand::Pause => {
                            if running {
                                running = false;
                                let mut s = state.lock().await;
                                s.status = TimerStatus::Paused;
                                let _ = app.emit("timer:state-change", StateChangePayload {
                                    status: TimerStatus::Paused,
                                });
                            }
                        }
                        TimerCommand::Resume => {
                            if !running && !segments.is_empty() {
                                let s = state.lock().await;
                                if s.status == TimerStatus::Paused {
                                    drop(s);
                                    running = true;
                                    let mut s = state.lock().await;
                                    s.status = TimerStatus::Running;
                                    let _ = app.emit("timer:state-change", StateChangePayload {
                                        status: TimerStatus::Running,
                                    });
                                    ticker = interval(Duration::from_secs(1));
                                    ticker.tick().await;
                                }
                            }
                        }
                        TimerCommand::Stop => {
                            running = false;
                            segments.clear();
                            current_idx = 0;
                            remaining = 0;

                            {
                                let mut s = state.lock().await;
                                s.status = TimerStatus::Stopped;
                                s.remaining_secs = 0;
                                s.current_segment = 0;
                                s.total_segments = 0;
                                s.segment_label = String::new();
                                s.segment_duration = 0;
                            }

                            let _ = app.emit("timer:state-change", StateChangePayload {
                                status: TimerStatus::Stopped,
                            });
                        }
                        TimerCommand::Skip => {
                            if segments.is_empty() {
                                continue;
                            }

                            let completed_label = segments[current_idx].label.clone();

                            if current_idx + 1 < segments.len() {
                                current_idx += 1;
                                remaining = segments[current_idx].duration_secs;

                                let _ = app.emit("timer:segment-end", SegmentEndPayload {
                                    completed_label,
                                    completed_index: current_idx - 1,
                                    next_label: Some(segments[current_idx].label.clone()),
                                    next_index: Some(current_idx),
                                });

                                {
                                    let mut s = state.lock().await;
                                    s.remaining_secs = remaining;
                                    s.current_segment = current_idx;
                                    s.segment_label = segments[current_idx].label.clone();
                                    s.segment_duration = segments[current_idx].duration_secs;
                                }

                                let _ = app.emit("timer:tick", TickPayload {
                                    remaining_secs: remaining,
                                    segment_index: current_idx,
                                    segment_label: segments[current_idx].label.clone(),
                                    total_segments: segments.len(),
                                    segment_duration: segments[current_idx].duration_secs,
                                });

                                ticker = interval(Duration::from_secs(1));
                                ticker.tick().await;
                            } else {
                                // Last segment - session complete
                                let _ = app.emit("timer:segment-end", SegmentEndPayload {
                                    completed_label,
                                    completed_index: current_idx,
                                    next_label: None,
                                    next_index: None,
                                });
                                let _ = app.emit("timer:session-complete", ());

                                running = false;
                                segments.clear();
                                current_idx = 0;
                                remaining = 0;

                                {
                                    let mut s = state.lock().await;
                                    s.status = TimerStatus::Stopped;
                                    s.remaining_secs = 0;
                                    s.current_segment = 0;
                                    s.total_segments = 0;
                                    s.segment_label = String::new();
                                    s.segment_duration = 0;
                                }

                                let _ = app.emit("timer:state-change", StateChangePayload {
                                    status: TimerStatus::Stopped,
                                });
                            }
                        }
                    }
                }
                _ = ticker.tick(), if running => {
                    if remaining > 0 {
                        remaining -= 1;
                        {
                            let mut s = state.lock().await;
                            s.remaining_secs = remaining;
                        }
                        let _ = app.emit("timer:tick", TickPayload {
                            remaining_secs: remaining,
                            segment_index: current_idx,
                            segment_label: segments[current_idx].label.clone(),
                            total_segments: segments.len(),
                            segment_duration: segments[current_idx].duration_secs,
                        });
                    }

                    if remaining == 0 && running {
                        let completed_label = segments[current_idx].label.clone();

                        if current_idx + 1 < segments.len() {
                            let _ = app.emit("timer:segment-end", SegmentEndPayload {
                                completed_label,
                                completed_index: current_idx,
                                next_label: Some(segments[current_idx + 1].label.clone()),
                                next_index: Some(current_idx + 1),
                            });

                            current_idx += 1;
                            remaining = segments[current_idx].duration_secs;

                            {
                                let mut s = state.lock().await;
                                s.remaining_secs = remaining;
                                s.current_segment = current_idx;
                                s.segment_label = segments[current_idx].label.clone();
                                s.segment_duration = segments[current_idx].duration_secs;
                            }

                            // Check auto_start_next from config
                            // For now, pause and wait for user. The frontend
                            // handles auto_start_next via the setting.
                            running = false;
                            {
                                let mut s = state.lock().await;
                                s.status = TimerStatus::Paused;
                            }
                            let _ = app.emit("timer:state-change", StateChangePayload {
                                status: TimerStatus::Paused,
                            });

                            let _ = app.emit("timer:tick", TickPayload {
                                remaining_secs: remaining,
                                segment_index: current_idx,
                                segment_label: segments[current_idx].label.clone(),
                                total_segments: segments.len(),
                                segment_duration: segments[current_idx].duration_secs,
                            });
                        } else {
                            // Session complete
                            let _ = app.emit("timer:segment-end", SegmentEndPayload {
                                completed_label,
                                completed_index: current_idx,
                                next_label: None,
                                next_index: None,
                            });
                            let _ = app.emit("timer:session-complete", ());

                            running = false;
                            segments.clear();
                            current_idx = 0;

                            {
                                let mut s = state.lock().await;
                                s.status = TimerStatus::Stopped;
                                s.remaining_secs = 0;
                                s.current_segment = 0;
                                s.total_segments = 0;
                                s.segment_label = String::new();
                                s.segment_duration = 0;
                            }

                            let _ = app.emit("timer:state-change", StateChangePayload {
                                status: TimerStatus::Stopped,
                            });
                        }
                    }
                }
            }
        }
    }
}
