@echo off
rem Launch the Tauri dev app with the correct MSVC environment.
call "%~dp0vsenv.cmd"
pushd "%~dp0.."
pnpm tauri dev %*
popd
