@echo off
set cmake_home=F:\"Program Files"\cmake-3.22.0-windows-x86_64
set vs_root=F:\"Program Files (x86)"
set vs_release_version=Professional
:: %vs_release_version%
set vs_home=%vs_root%\Microsoft Visual Studio\2017\%vs_release_version%
set msbuild_home=%vs_home%\MSBuild\15.0\Bin
set csharp_home=%msbuild_home%\Roslyn
set vc_home=%vs_home%\VC\Tools\MSVC\14.16.27023\bin\Hostx86\x86
set tools_home=C:\Program Files (x86)\Microsoft SDKs\Windows\v10.0A\bin\NETFX 4.6.1 Tools
set dotnet_version=v4.0
set dotnet=C:\Windows\Microsoft.NET\Framework\v4.0.30319
echo -- Dir MSBuild = %msbuild_home% 
echo -- Dir C#      = %csharp_home%
echo -- Dir VC      = %vc_home%
:: Make environment support msbuild
set path=%cmake_home%;%path%
set path=%msbuild_home%;%path%
set path=%csharp_home%;%path%
set path=%vc_home%;%path%
set path=%tools_home%;%path%
rem set path=%dotnet%;%path%
set include=C:\Program Files (x86)\Microsoft Visual Studio\2017\%vs_release_version%\VC\Tools\MSVC\14.16.27023\ATLMFC\include;C:\Program Files (x86)\Microsoft Visual Studio\2017\%vs_release_version%\VC\Tools\MSVC\14.16.27023\include;C:\Program Files (x86)\Windows Kits\10\include\10.0.17763.0\ucrt;C:\Program Files (x86)\Windows Kits\10\include\10.0.17763.0\shared;C:\Program Files (x86)\Windows Kits\10\include\10.0.17763.0\um;C:\Program Files (x86)\Windows Kits\10\include\10.0.17763.0\winrt;C:\Program Files (x86)\Windows Kits\10\include\10.0.17763.0\cppwinrt
set lib=C:\Program Files (x86)\Microsoft Visual Studio\2017\%vs_release_version%\VC\Tools\MSVC\14.16.27023\ATLMFC\lib\x86;C:\Program Files (x86)\Microsoft Visual Studio\2017\%vs_release_version%\VC\Tools\MSVC\14.16.27023\lib\x86;C:\Program Files (x86)\Windows Kits\10\lib\10.0.17763.0\ucrt\x86;C:\Program Files (x86)\Windows Kits\10\lib\10.0.17763.0\um\x86

set include=%include%
set lib=%lib%
set path=%path%

echo -- Prepared [[1;32mmsbuild[0m] environment for you.
echo -- Prepared [[1;32m csharp[0m] environment for you.
echo -- Prepared [[1;32m     vc[0m] environment for you.
pause