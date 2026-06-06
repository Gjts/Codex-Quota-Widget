# ---------------------------------------------------------------------------
# MSVC build environment for this machine.
#
# The newer Visual Studio installs here (VS 2022 / VS 18 Insiders) are
# incomplete (missing MSVC headers + desktop CRT libs) and their vcvarsall.bat
# is broken (vswhere not found). VS 2019 BuildTools (MSVC 14.29.30133) IS
# complete, so we point the toolchain straight at it + the Windows 10 SDK.
#
# Usage (dot-source into the current PowerShell session):
#     . .\scripts\vsenv.ps1
#     pnpm tauri dev
# ---------------------------------------------------------------------------
$MSVC = "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Tools\MSVC\14.29.30133"
$SDK = "C:\Program Files (x86)\Windows Kits\10"
$VER = "10.0.19041.0"

$env:VCINSTALLDIR = "C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\"
$env:INCLUDE = "$MSVC\include;$SDK\Include\$VER\ucrt;$SDK\Include\$VER\um;$SDK\Include\$VER\shared;$SDK\Include\$VER\winrt;$SDK\Include\$VER\cppwinrt"
$env:LIB = "$MSVC\lib\x64;$SDK\Lib\$VER\ucrt\x64;$SDK\Lib\$VER\um\x64"
$env:PATH = "$MSVC\bin\Hostx64\x64;$SDK\bin\$VER\x64;$env:USERPROFILE\.cargo\bin;$env:PATH"

Write-Host "VS2019 BuildTools env ready (MSVC 14.29.30133 + Windows SDK $VER)" -ForegroundColor Green
