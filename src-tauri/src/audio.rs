use rodio::{Decoder, OutputStream, Sink};
use std::io::Cursor;
use std::sync::mpsc;
use std::thread;

const BELL_SOUND: &[u8] = include_bytes!("../sounds/bell.wav");

enum AudioCommand {
    Play(String),
    SetVolume(f32),
}

/// Thread-safe audio handle. The actual OutputStream lives
/// on a dedicated thread (since it's not Send/Sync).
#[derive(Clone)]
pub struct AudioHandle {
    tx: mpsc::Sender<AudioCommand>,
}

impl AudioHandle {
    pub fn new() -> Option<Self> {
        let (tx, rx) = mpsc::channel::<AudioCommand>();

        thread::spawn(move || {
            let Ok((_stream, handle)) = OutputStream::try_default() else {
                eprintln!("Failed to open audio output stream");
                return;
            };
            let mut volume = 0.7_f32;

            while let Ok(cmd) = rx.recv() {
                match cmd {
                    AudioCommand::Play(_sound_name) => {
                        let cursor = Cursor::new(BELL_SOUND);
                        if let Ok(source) = Decoder::new(cursor) {
                            if let Ok(sink) = Sink::try_new(&handle) {
                                sink.set_volume(volume);
                                sink.append(source);
                                sink.detach();
                            }
                        }
                    }
                    AudioCommand::SetVolume(level) => {
                        volume = level.clamp(0.0, 1.0);
                    }
                }
            }
        });

        Some(Self { tx })
    }

    pub fn play_sound(&self, sound_name: &str) {
        let _ = self.tx.send(AudioCommand::Play(sound_name.to_string()));
    }

    pub fn set_volume(&self, level: f32) {
        let _ = self.tx.send(AudioCommand::SetVolume(level));
    }
}
