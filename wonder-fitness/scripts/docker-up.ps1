# Tự dò IPv4 của Wi-Fi/Ethernet đang hoạt động trên Windows,
# truyền vào container qua LAN_IP và in đúng địa chỉ để mở trên điện thoại.
$ErrorActionPreference = "Stop"

function Get-LanIp {
  $wifi = @(
    Get-NetIPConfiguration -ErrorAction SilentlyContinue |
      Where-Object { $_.InterfaceAlias -match "Wi-?Fi|WLAN" -and $_.IPv4DefaultGateway -ne $null } |
      ForEach-Object { $_.IPv4Address.IPAddress }
  )
  $wifi = @($wifi | Where-Object { $_ -and $_ -notlike "127.*" -and $_ -notlike "169.254.*" })
  if ($wifi.Count -gt 0) { return $wifi[0] }

  $active = @(
    Get-NetIPConfiguration -ErrorAction SilentlyContinue |
      Where-Object { $_.NetAdapter.Status -eq "Up" -and $_.IPv4DefaultGateway -ne $null } |
      ForEach-Object { $_.IPv4Address.IPAddress }
  )
  $active = @($active | Where-Object { $_ -and $_ -notlike "127.*" -and $_ -notlike "169.254.*" })
  if ($active.Count -gt 0) { return $active[0] }

  $fallback = @(
    Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
      Where-Object {
        $_.IPAddress -notlike "127.*" -and
        $_.IPAddress -notlike "169.254.*" -and
        $_.PrefixOrigin -ne "WellKnown"
      } |
      Select-Object -ExpandProperty IPAddress
  )
  if ($fallback.Count -gt 0) { return $fallback[0] }

  return $null
}

$ip = Get-LanIp
if (-not $ip) {
  Write-Host "Không dò được IP Wi-Fi, dùng localhost." -ForegroundColor Yellow
  $ip = "localhost"
}

$env:LAN_IP = $ip
Write-Host "▸ IP Wi-Fi/Ethernet hiện tại: $ip" -ForegroundColor Cyan

docker compose up -d --build
if ($LASTEXITCODE -ne 0) {
  Write-Host "Docker compose thất bại." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "▸ Trên máy này:       http://localhost:3000"
Write-Host "▸ Trên điện thoại:    http://${ip}:3000" -ForegroundColor Green
Write-Host "▸ HTTPS (quét QR):    https://${ip}:3443" -ForegroundColor Green
Write-Host ""
Write-Host "Lưu ý: dòng 'Network: http://172.x.x.x:3000' do Next.js in ra là IP nội bộ"
Write-Host "của container, không phải IP Wi-Fi. Dùng địa chỉ in ở trên để mở từ điện thoại."
Write-Host ""
Write-Host "Quét QR bằng camera trên điện thoại: mở https://${ip}:3443" -ForegroundColor Cyan
Write-Host "  - Chứng chỉ là tự ký nên trình duyệt sẽ cảnh báo lần đầu:"
Write-Host "    bấm 'Nâng cao' → 'Tiếp tục truy cập' (Chrome) hoặc 'Truy cập trang web' (Safari)."
Write-Host "  - Sau khi vào bằng https, nút 'Quét QR' sẽ mở được camera."
Write-Host "  - Nếu đổi Wi-Fi/đổi IP: chạy lại script này để cấp lại chứng chỉ."
