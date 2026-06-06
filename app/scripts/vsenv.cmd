@echo off
rem MSVC build environment for this machine (see vsenv.ps1 for the why).
rem VS 2019 BuildTools is the only complete MSVC toolchain installed here.
set "MSVC=C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\Tools\MSVC\14.29.30133"
set "SDK=C:\Program Files (x86)\Windows Kits\10"
set "VER=10.0.19041.0"
set "VCINSTALLDIR=C:\Program Files (x86)\Microsoft Visual Studio\2019\BuildTools\VC\"
set "INCLUDE=%MSVC%\include;%SDK%\Include\%VER%\ucrt;%SDK%\Include\%VER%\um;%SDK%\Include\%VER%\shared;%SDK%\Include\%VER%\winrt;%SDK%\Include\%VER%\cppwinrt"
set "LIB=%MSVC%\lib\x64;%SDK%\Lib\%VER%\ucrt\x64;%SDK%\Lib\%VER%\um\x64"
set "PATH=%MSVC%\bin\Hostx64\x64;%SDK%\bin\%VER%\x64;%USERPROFILE%\.cargo\bin;%PATH%"
