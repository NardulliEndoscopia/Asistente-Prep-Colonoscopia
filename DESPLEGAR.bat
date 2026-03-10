@echo off
chcp 65001 > nul
echo.
echo ================================================
echo   DESPLIEGUE - Dr. Nardulli - Google Cloud Run
echo ================================================
echo.
echo Necesitas tener instalado Google Cloud CLI (gcloud).
echo Si no lo tienes: https://cloud.google.com/sdk/docs/install
echo.

set /p API_KEY="AIzaSyD4Bi2vZbLJ-qsEOquTGAZVPIoo2WJdDBs"
if "%API_KEY%"=="" (
    echo ERROR: La clave no puede estar vacia.
    pause & exit /b 1
)

set /p PROJECT_ID="gen-lang-client-0796205805"
if "%PROJECT_ID%"=="" (
    echo ERROR: El Project ID no puede estar vacio.
    pause & exit /b 1
)

echo.
echo Configurando proyecto en Google Cloud...
call gcloud config set project %PROJECT_ID%
if errorlevel 1 ( echo ERROR configurando proyecto. & pause & exit /b 1 )

echo.
echo Iniciando despliegue (tardara 5-8 minutos, no cierres esta ventana)...
echo.

call gcloud run deploy asistente-prep-colonoscopia ^
  --source . ^
  --platform managed ^
  --region europe-west1 ^
  --allow-unauthenticated ^
  --build-arg GEMINI_API_KEY=%API_KEY% ^
  --set-env-vars GEMINI_API_KEY=%API_KEY% ^
  --port 8080

if errorlevel 1 (
    echo.
    echo ERROR en el despliegue. Revisa los mensajes de arriba.
) else (
    echo.
    echo ================================================
    echo  Despliegue completado. Copia la "Service URL"
    echo  que aparece arriba y abrela en tu navegador.
    echo ================================================
)
echo.
pause
