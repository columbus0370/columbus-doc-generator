# Columbus AI バックエンド起動スクリプト
# このスクリプトを使うことでvenvが確実に有効化された状態で起動されます

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$VenvUvicorn = Join-Path $ScriptDir "venv\Scripts\uvicorn.exe"

if (-not (Test-Path $VenvUvicorn)) {
    Write-Host "ERROR: venv が見つかりません。先に以下を実行してください:" -ForegroundColor Red
    Write-Host "  cd backend" -ForegroundColor Yellow
    Write-Host "  python -m venv venv" -ForegroundColor Yellow
    Write-Host "  venv\Scripts\activate" -ForegroundColor Yellow
    Write-Host "  pip install -r requirements.txt" -ForegroundColor Yellow
    exit 1
}

Write-Host "Starting Columbus AI Backend on port 8081..." -ForegroundColor Cyan
Set-Location $ScriptDir
& $VenvUvicorn main:app --reload --host 127.0.0.1 --port 8081
