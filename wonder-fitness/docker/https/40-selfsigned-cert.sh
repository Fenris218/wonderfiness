#!/bin/sh
# Sinh chứng chỉ tự ký (self-signed) cho HTTPS nội bộ.
# Cấp lại khi chưa có chứng chỉ hoặc khi IP LAN hiện tại chưa nằm trong SAN
# (đổi Wi-Fi / đổi mạng thì chỉ cần restart container là xong).
set -e

CERT_DIR=/etc/nginx/certs
CERT="$CERT_DIR/server.crt"
KEY="$CERT_DIR/server.key"

mkdir -p "$CERT_DIR"

IP="${LAN_IP:-}"
[ -z "$IP" ] && IP="127.0.0.1"

need=0
if [ ! -s "$CERT" ] || [ ! -s "$KEY" ]; then
  need=1
elif ! openssl x509 -in "$CERT" -noout -checkip "$IP" >/dev/null 2>&1; then
  need=1
fi

if [ "$need" = "1" ]; then
  echo "▸ Tạo chứng chỉ tự ký cho IP $IP"
  SAN="DNS:localhost,IP:127.0.0.1"
  case "$IP" in
    *[!0-9.]*) SAN="$SAN,DNS:$IP" ;;
    *)         SAN="$SAN,IP:$IP" ;;
  esac

  openssl req -x509 -nodes -newkey rsa:2048 -days 825 \
    -keyout "$KEY" -out "$CERT" \
    -subj "/C=VN/O=Wonder Fitness/CN=$IP" \
    -addext "subjectAltName=$SAN" >/dev/null 2>&1

  echo "▸ Đã tạo chứng chỉ:"
  openssl x509 -in "$CERT" -noout -subject -enddate -ext subjectAltName
else
  echo "▸ Dùng lại chứng chỉ đã có cho IP $IP"
fi
