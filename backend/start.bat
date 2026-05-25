@echo off
cd /d "%~dp0"
if not exist "venv\Scripts\uvicorn.exe" (
    echo ERROR: venv が見つかりません
    echo 先に以下を実行してください:
    echo   python -m venv venv
    echo   venv\Scripts\activate
    echo   pip install -r requirements.txt
    pause
    exit /b 1
)
echo Starting Columbus AI Backend on port 8081...
venv\Scripts\uvicorn.exe main:app --reload --host 127.0.0.1 --port 8081
