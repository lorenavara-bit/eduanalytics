# Script de Deploy Automatico - EduAnalytics
# Genera build de produccion y crea ZIP listo para Hostinger

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   EDUANALYTICS - DEPLOY AUTOMATICO    " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Paso 1: Limpiar build anterior
Write-Host "[1/4] Limpiando build anterior..." -ForegroundColor Yellow
if (Test-Path "build") {
    Remove-Item -Recurse -Force "build"
    Write-Host "      OK Build anterior eliminado" -ForegroundColor Green
}
else {
    Write-Host "      - No habia build anterior" -ForegroundColor Gray
}

# Paso 2: Generar nuevo build
Write-Host ""
Write-Host "[2/4] Generando build de produccion..." -ForegroundColor Yellow
Write-Host "      (Esto puede tardar 1-2 minutos)" -ForegroundColor Gray
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERROR: El build fallo" -ForegroundColor Red
    Write-Host "Revisa los errores arriba y corrigelos." -ForegroundColor Red
    Read-Host "Presiona Enter para salir"
    exit 1
}

Write-Host "      OK Build generado exitosamente" -ForegroundColor Green

# Paso 3: Crear ZIP
Write-Host ""
Write-Host "[3/4] Creando archivo ZIP..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyy-MM-dd_HHmm"
$zipName = "eduanalytics-build-$timestamp.zip"
$zipPath = Join-Path $PSScriptRoot $zipName

# Comprimir carpeta build
Compress-Archive -Path "build\*" -DestinationPath $zipPath -Force

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "      OK ZIP creado: $zipName" -ForegroundColor Green
Write-Host "      OK Tamanio: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Green

# Paso 4: Instrucciones finales
Write-Host ""
Write-Host "[4/4] Listo para desplegar!" -ForegroundColor Yellow
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "         INSTRUCCIONES DE DEPLOY        " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Accede a Hostinger File Manager" -ForegroundColor White
Write-Host "   https://hpanel.hostinger.com" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Ve a la carpeta: public_html/" -ForegroundColor White
Write-Host ""
Write-Host "3. ELIMINA todo el contenido anterior de public_html/" -ForegroundColor Yellow
Write-Host "   (Excepto .htaccess si ya lo tenias)" -ForegroundColor Gray
Write-Host ""
Write-Host "4. Sube el archivo ZIP:" -ForegroundColor White
Write-Host "   $zipName" -ForegroundColor Cyan
Write-Host ""
Write-Host "5. Descomprime el ZIP en public_html/" -ForegroundColor White
Write-Host "   (Click derecho -> Extract)" -ForegroundColor Gray
Write-Host ""
Write-Host "6. Verifica que .htaccess exista:" -ForegroundColor White
Write-Host "   Si NO existe, crealo con el contenido de DEPLOYMENT_GUIDE.md" -ForegroundColor Gray
Write-Host ""
Write-Host "7. Accede a tu sitio!" -ForegroundColor Green
Write-Host "   https://tudominio.com" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Abrir carpeta con el ZIP
Write-Host "Abriendo carpeta con el ZIP..." -ForegroundColor Yellow
Start-Process explorer.exe -ArgumentList "/select,$zipPath"

Write-Host ""
Write-Host "PROCESO COMPLETADO" -ForegroundColor Green
Write-Host ""
Read-Host "Presiona Enter para salir"
