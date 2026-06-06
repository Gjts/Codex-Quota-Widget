@echo off
rem Build the Tauri installers with the correct MSVC environment.
call "%~dp0vsenv.cmd"
pushd "%~dp0.."
pnpm tauri build %*
popd
