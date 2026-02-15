use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

use crate::timer::Segment;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Settings {
    pub notification_enabled: bool,
    pub sound_enabled: bool,
    pub sound_name: String,
    pub volume: f32,
    pub auto_start_next: bool,
    pub always_on_top: bool,
    pub show_clock: bool,
    #[serde(default)]
    pub visible_on_all_workspaces: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            notification_enabled: true,
            sound_enabled: true,
            sound_name: "bell".to_string(),
            volume: 0.7,
            auto_start_next: false,
            always_on_top: false,
            show_clock: false,
            visible_on_all_workspaces: false,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Session {
    pub name: String,
    pub segments: Vec<Segment>,
    pub is_preset: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    pub settings: Settings,
    pub sessions: Vec<Session>,
    pub active_session_index: usize,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            settings: Settings::default(),
            sessions: default_presets(),
            active_session_index: 0,
        }
    }
}

pub fn default_presets() -> Vec<Session> {
    vec![
        Session {
            name: "Classic Pomodoro".to_string(),
            segments: vec![
                Segment {
                    label: "Study".into(),
                    duration_secs: 1500,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 300,
                },
                Segment {
                    label: "Study".into(),
                    duration_secs: 1500,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 300,
                },
                Segment {
                    label: "Study".into(),
                    duration_secs: 1500,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 300,
                },
                Segment {
                    label: "Study".into(),
                    duration_secs: 1500,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 1200,
                },
            ],
            is_preset: true,
        },
        Session {
            name: "Short Focus".to_string(),
            segments: vec![
                Segment {
                    label: "Study".into(),
                    duration_secs: 900,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 180,
                },
                Segment {
                    label: "Study".into(),
                    duration_secs: 900,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 600,
                },
            ],
            is_preset: true,
        },
        Session {
            name: "Deep Work".to_string(),
            segments: vec![
                Segment {
                    label: "Study".into(),
                    duration_secs: 3000,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 600,
                },
                Segment {
                    label: "Study".into(),
                    duration_secs: 3000,
                },
                Segment {
                    label: "Break".into(),
                    duration_secs: 1200,
                },
            ],
            is_preset: true,
        },
    ]
}

fn config_path() -> PathBuf {
    let config_dir = dirs::config_dir()
        .unwrap_or_else(|| PathBuf::from("."))
        .join("foccus");
    fs::create_dir_all(&config_dir).ok();
    config_dir.join("config.json")
}

pub fn load_config() -> AppConfig {
    let path = config_path();
    if path.exists() {
        if let Ok(data) = fs::read_to_string(&path) {
            if let Ok(config) = serde_json::from_str::<AppConfig>(&data) {
                return config;
            }
        }
    }
    let config = AppConfig::default();
    save_config(&config);
    config
}

pub fn save_config(config: &AppConfig) {
    let path = config_path();
    if let Ok(data) = serde_json::to_string_pretty(config) {
        let _ = fs::write(path, data);
    }
}
