use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .setup(|app| {
            #[cfg(desktop)]
            {
                let _ = app.handle().plugin(tauri_plugin_window_state::Builder::default().build());
            }
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![host_info])
        .run(tauri::generate_context!())
        .expect("error while running Kali-webOS");
}

#[tauri::command]
fn host_info() -> serde_json::Value {
    serde_json::json!({
        "platform": std::env::consts::OS,
        "arch": std::env::consts::ARCH,
        "family": std::env::consts::FAMILY,
        "tauri": env!("CARGO_PKG_VERSION"),
    })
}
