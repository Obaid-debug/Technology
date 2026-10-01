# Minimal static file server for local preview (no Node/Python needed).
# Usage:  powershell -ExecutionPolicy Bypass -File .\serve.ps1 [-Port 8080]
param([int]$Port = 8080)
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$mime = @{ '.html'='text/html; charset=utf-8'; '.css'='text/css; charset=utf-8'; '.js'='application/javascript; charset=utf-8'; '.svg'='image/svg+xml'; '.json'='application/json'; '.png'='image/png'; '.jpg'='image/jpeg'; '.ico'='image/x-icon'; '.md'='text/plain; charset=utf-8'; '.woff2'='font/woff2' }
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Host "Najm Insights preview: http://localhost:$Port/  (Ctrl+C to stop)"
try {
  while ($listener.IsListening) {
    $ctx = $listener.GetContext()
    $path = [uri]::UnescapeDataString($ctx.Request.Url.AbsolutePath)
    if ($path -eq '/' -or $path -eq '') { $path = '/index.html' }
    $file = Join-Path $root ($path -replace '/', '\')
    if (-not (Test-Path $file -PathType Leaf)) { $file = Join-Path $root 'index.html' }
    try {
      $bytes = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $ctx.Response.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
      $ctx.Response.Headers.Add('Cache-Control', 'no-cache')
      $ctx.Response.ContentLength64 = $bytes.Length
      $ctx.Response.OutputStream.Write($bytes, 0, $bytes.Length)
    } catch { $ctx.Response.StatusCode = 500 }
    $ctx.Response.OutputStream.Close()
  }
} finally { $listener.Stop() }
