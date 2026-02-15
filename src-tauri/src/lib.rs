mod audio;
mod config;
mod timer;

use audio::AudioHandle;
use config::{AppConfig, Session, Settings};
use timer::{Segment, TimerCommand, TimerEngine, TimerState};

use std::sync::{Arc, Mutex};
use tauri::{
    menu::{Menu, MenuItem, PredefinedMenuItem},
    tray::TrayIconBuilder,
    Emitter, Manager, Runtime, WindowEvent,
};

struct AppState {
    timer: Arc<TimerEngine>,
    audio: Option<AudioHandle>,
    config: Arc<Mutex<AppConfig>>,
}

// ── Tauri Commands ──────────────────────────────────────────────

#[tauri::command]
fn start_timer(
    state: tauri::State<'_, AppState>,
    segments: Vec<Segment>,
) -> Result<(), String> {
    state.timer.send_blocking(TimerCommand::Start(segments));
    Ok(())
}

#[tauri::command]
fn pause_timer(state: tauri::State<'_, AppState>) -> Result<(), String> {
    state.timer.send_blocking(TimerCommand::Pause);
    Ok(())
}

#[tauri::command]
fn resume_timer(state: tauri::State<'_, AppState>) -> Result<(), String> {
    state.timer.send_blocking(TimerCommand::Resume);
    Ok(())
}

#[tauri::command]
fn stop_timer(state: tauri::State<'_, AppState>) -> Result<(), String> {
    state.timer.send_blocking(TimerCommand::Stop);
    Ok(())
}

#[tauri::command]
fn skip_segment(state: tauri::State<'_, AppState>) -> Result<(), String> {
    state.timer.send_blocking(TimerCommand::Skip);
    Ok(())
}

#[tauri::command]
fn get_timer_state(state: tauri::State<'_, AppState>) -> Result<TimerState, String> {
    Ok(state.timer.get_state_blocking())
}

#[tauri::command]
fn play_sound(state: tauri::State<'_, AppState>, sound_name: String) {
    if let Some(ref audio) = state.audio {
        audio.play_sound(&sound_name);
    }
}

#[tauri::command]
fn set_volume(state: tauri::State<'_, AppState>, level: f32) {
    if let Some(ref audio) = state.audio {
        audio.set_volume(level);
    }
}

#[tauri::command]
fn load_settings(state: tauri::State<'_, AppState>) -> Result<Settings, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(config.settings.clone())
}

#[tauri::command]
fn save_settings(
    state: tauri::State<'_, AppState>,
    settings: Settings,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.settings = settings;
    config::save_config(&config);
    Ok(())
}

#[tauri::command]
fn load_sessions(state: tauri::State<'_, AppState>) -> Result<Vec<Session>, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(config.sessions.clone())
}

#[tauri::command]
fn save_sessions(
    state: tauri::State<'_, AppState>,
    sessions: Vec<Session>,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.sessions = sessions;
    config::save_config(&config);
    Ok(())
}

#[tauri::command]
fn get_active_session_index(state: tauri::State<'_, AppState>) -> Result<usize, String> {
    let config = state.config.lock().map_err(|e| e.to_string())?;
    Ok(config.active_session_index)
}

#[tauri::command]
fn set_active_session_index(
    state: tauri::State<'_, AppState>,
    index: usize,
) -> Result<(), String> {
    let mut config = state.config.lock().map_err(|e| e.to_string())?;
    config.active_session_index = index;
    config::save_config(&config);
    Ok(())
}

// ── Tray Setup ──────────────────────────────────────────────────

fn setup_tray<R: Runtime>(app: &tauri::App<R>) -> Result<(), Box<dyn std::error::Error>> {
    let show = MenuItem::with_id(app, "show", "Show Foccus", true, None::<&str>)?;
    let separator1 = PredefinedMenuItem::separator(app)?;
    let start_pause = MenuItem::with_id(app, "start_pause", "Start / Pause", true, None::<&str>)?;
    let skip = MenuItem::with_id(app, "skip", "Skip", true, None::<&str>)?;
    let stop = MenuItem::with_id(app, "stop", "Stop", true, None::<&str>)?;
    let separator2 = PredefinedMenuItem::separator(app)?;
    let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;

    let menu = Menu::with_items(
        app,
        &[
            &show,
            &separator1,
            &start_pause,
            &skip,
            &stop,
            &separator2,
            &quit,
        ],
    )?;

    let _tray = TrayIconBuilder::new()
        .icon(app.default_window_icon().unwrap().clone())
        .menu(&menu)
        .show_menu_on_left_click(false)
        .tooltip("Foccus - Pomodoro Timer")
        .on_menu_event(move |app, event| {
            let id = event.id.as_ref();
            match id {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "start_pause" => {
                    let _ = app.emit("tray:start-pause", ());
                }
                "skip" => {
                    let _ = app.emit("tray:skip", ());
                }
                "stop" => {
                    let _ = app.emit("tray:stop", ());
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        })
        .build(app)?;

    Ok(())
}

// ── App Entry ───────────────────────────────────────────────────

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let config = config::load_config();

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_single_instance::init(|app, _args, _cwd| {
            // Close splashscreen if still open
            if let Some(splashscreen) = app.get_webview_window("splashscreen") {
                let _ = splashscreen.close();
            }
            
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }))
        .setup(move |app| {
            let handle = app.handle().clone();

            let timer = Arc::new(TimerEngine::new(handle.clone()));
            let audio = AudioHandle::new();
            let config = Arc::new(Mutex::new(config.clone()));

            app.manage(AppState {
                timer,
                audio,
                config,
            });

            setup_tray(app)?;

            // Handle splashscreen
            let splashscreen_window = app.get_webview_window("splashscreen");
            let main_window = app.get_webview_window("main");

            if let (Some(splashscreen), Some(main)) = (splashscreen_window, main_window.clone()) {
                // Show main window after a delay and close splashscreen
                tauri::async_runtime::spawn(async move {
                    // Wait for main window to be ready (simulate loading time)
                    std::thread::sleep(std::time::Duration::from_millis(1500));
                    
                    // Show main window
                    let _ = main.show();
                    let _ = main.set_focus();
                    
                    // Close splashscreen
                    let _ = splashscreen.close();
                });
            }

            // Handle window close -> hide to tray instead of quit
            let window = app.get_webview_window("main").unwrap();
            window.on_window_event(move |event| {
                if let WindowEvent::CloseRequested { api, .. } = event {
                    api.prevent_close();
                    if let Some(win) = handle.get_webview_window("main") {
                        let _ = win.hide();
                    }
                }
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            start_timer,
            pause_timer,
            resume_timer,
            stop_timer,
            skip_segment,
            get_timer_state,
            play_sound,
            set_volume,
            load_settings,
            save_settings,
            load_sessions,
            save_sessions,
            get_active_session_index,
            set_active_session_index,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
