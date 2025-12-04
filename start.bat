@echo off
REM Script de démarrage pour Invoice Renamer (Windows)

echo ╔══════════════════════════════════════════════════════════════╗
echo ║       Invoice Renamer - Démarrage de l'interface web        ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Vérifier Node.js
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur: Node.js n'est pas installé
    echo    Installez Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Vérifier npm
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Erreur: npm n'est pas installé
    pause
    exit /b 1
)

for /f "delims=" %%i in ('node --version') do set NODE_VERSION=%%i
for /f "delims=" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ Node.js %NODE_VERSION% détecté
echo ✓ npm %NPM_VERSION% détecté
echo.

REM Installer dépendances si nécessaire
if not exist "node_modules\" (
    echo 📦 Installation des dépendances...
    call npm install
    echo ✓ Dépendances installées
    echo.
)

REM Compiler si nécessaire
if not exist "dist\" (
    echo 🔨 Compilation du projet...
    call npm run build
    echo ✓ Projet compilé
    echo.
)

REM Vérifier la clé API
if "%OPENROUTER_API_KEY%"=="" (
    echo ⚠️  ATTENTION: La variable OPENROUTER_API_KEY n'est pas définie
    echo.
    echo    Pour utiliser OpenRouter ^(recommandé^):
    echo    1. Obtenez une clé API sur https://openrouter.ai/
    echo    2. Exportez-la: set OPENROUTER_API_KEY=votre-clé
    echo.
    echo    Ou créez un fichier .env avec:
    echo    OPENROUTER_API_KEY=votre-clé-api
    echo.
    echo    Alternative: Utilisez LM Studio en local ^(pas besoin de clé^)
    echo.
    pause
    echo.
)

REM Charger .env si présent
if exist ".env" (
    echo ✓ Chargement des variables depuis .env
    for /f "usebackq tokens=*" %%a in (".env") do (
        set "%%a"
    )
    echo.
)

REM Créer répertoire temporaire
if not exist ".temp\uploads\" mkdir .temp\uploads

echo 🚀 Démarrage du serveur web...
echo.
echo    Interface web: http://localhost:3000
echo    Page settings: http://localhost:3000/settings.html
echo.
echo    Ctrl+C pour arrêter le serveur
echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

REM Lancer le serveur
call npm run web
