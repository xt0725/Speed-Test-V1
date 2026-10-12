Unicode true
!include "MUI2.nsh"
Name "Speed Test V1"
OutFile "../dist/Speed-Test-V1-Setup-1.0.0.exe"
InstallDir "$LOCALAPPDATA\Programs\Speed Test V1"
InstallDirRegKey HKCU "Software\XT07\SpeedTestV1" "InstallDir"
RequestExecutionLevel user
SetCompressor /SOLID zlib
BrandingText "Speed Test V1 · By XT.07"
Icon "icon.ico"
UninstallIcon "icon.ico"
!define MUI_ABORTWARNING
!define MUI_WELCOMEFINISHPAGE_BITMAP "sidebar.bmp"
!define MUI_UNWELCOMEFINISHPAGE_BITMAP "sidebar.bmp"
!define MUI_WELCOMEPAGE_TITLE "Bienvenue dans Speed Test V1"
!define MUI_WELCOMEPAGE_TEXT "Votre connexion, en clair.$\r$\n$\r$\nMesurez votre débit de téléchargement, votre débit montant et votre ping HTTP.$\r$\n$\r$\nVotre adresse IP reste masquée jusqu'à votre confirmation.$\r$\n$\r$\nFermez Speed Test V1 avant une réinstallation.$\r$\n$\r$\nBy XT.07"
!define MUI_FINISHPAGE_RUN "$INSTDIR\Speed Test V1.exe"
!define MUI_FINISHPAGE_RUN_TEXT "Ouvrir Speed Test V1"
!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH
!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES
!insertmacro MUI_LANGUAGE "French"
Section "Speed Test V1"
  SetShellVarContext current
  SetOutPath "$INSTDIR"
  File /r "../dist/win-unpacked/*"
  WriteUninstaller "$INSTDIR\Uninstall.exe"
  CreateDirectory "$SMPROGRAMS\Speed Test V1"
  CreateShortcut "$SMPROGRAMS\Speed Test V1\Speed Test V1.lnk" "$INSTDIR\Speed Test V1.exe"
  CreateShortcut "$DESKTOP\Speed Test V1.lnk" "$INSTDIR\Speed Test V1.exe"
  WriteRegStr HKCU "Software\XT07\SpeedTestV1" "InstallDir" "$INSTDIR"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "DisplayName" "Speed Test V1"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "DisplayVersion" "1.0.0"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "Publisher" "XT.07"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "DisplayIcon" "$INSTDIR\Speed Test V1.exe"
  WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "UninstallString" '$\"$INSTDIR\Uninstall.exe$\"'
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "NoModify" 1
  WriteRegDWORD HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1" "NoRepair" 1
SectionEnd
Section "Uninstall"
  SetShellVarContext current
  Delete "$DESKTOP\Speed Test V1.lnk"
  Delete "$SMPROGRAMS\Speed Test V1\Speed Test V1.lnk"
  RMDir "$SMPROGRAMS\Speed Test V1"
  ; Explicitly remove only files installed by the application.
  !include "installed-files.nsh"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"
  DeleteRegKey HKCU "Software\Microsoft\Windows\CurrentVersion\Uninstall\SpeedTestV1"
  DeleteRegKey HKCU "Software\XT07\SpeedTestV1"
SectionEnd
