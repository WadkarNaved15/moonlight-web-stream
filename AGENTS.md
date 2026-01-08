# AGENTS.md

## Build Commands
- `cargo build` - Build web-server and streamer (default members)
- `cargo build --release` - Release build
- `cargo test` - Run all tests
- `cargo test test_name` - Run single test
- `cargo test --package streamer` - Run tests for a specific crate
- `cross build --release --target x86_64-pc-windows-gnu` - Cross-compile

## Frontend (moonlight-web/web-server/)
- `npm install` && `npm run build` - Build frontend (output in dist/, copy to static/)
- `npm run dev` - Watch mode with auto-rebuild

## Architecture
- **moonlight-common**: Core Moonlight protocol library (Rust)
- **moonlight-common-sys**: FFI bindings to C++ moonlight-common-c via bindgen/cmake
- **moonlight-web/web-server**: Actix-web server, spawns streamer subprocesses
- **moonlight-web/streamer**: WebRTC streaming subprocess, communicates via stdin/stdout
- **moonlight-web/common**: Shared types, config, IPC, ts-rs API bindings

## Code Style
- Rust nightly required (resolver = "3", profile-rustflags)
- Error handling: `anyhow::Result`, `thiserror` for custom errors
- Async: tokio runtime, async-trait for trait async methods
- Lints: `clippy::unwrap_used = "warn"`, `too_many_arguments = "allow"`
- Serialization: serde with derive, serde_json for JSON
- Use `log` crate for logging (simplelog backend)
