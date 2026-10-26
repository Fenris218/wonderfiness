#!/bin/sh
set -e

echo "▸ Wonder Fitness — container start"

# Chờ database sẵn sàng và đồng bộ schema (demo dùng db push thay cho migrate)
ATTEMPTS=0
until npx prisma db push --skip-generate --accept-data-loss >/tmp/dbpush.log 2>&1; do
  ATTEMPTS=$((ATTEMPTS + 1))
  if [ "$ATTEMPTS" -ge 30 ]; then
    echo "✖ Không kết nối được database sau 30 lần thử:"
    cat /tmp/dbpush.log
    exit 1
  fi
  echo "  … chờ database (lần $ATTEMPTS/30)"
  sleep 2
done
echo "✔ Schema đã đồng bộ"

# Seed dữ liệu demo nếu database còn trống
if [ "${SEED_DB:-true}" = "true" ]; then
  if node scripts/db-has-data.mjs; then
    echo "→ Database đã có dữ liệu, bỏ qua seed"
  else
    echo "→ Đang seed dữ liệu demo..."
    npx tsx prisma/seed.ts
  fi
fi

echo "▸ Khởi động web tại cổng ${PORT:-3000}"
if [ -n "${LAN_IP:-}" ]; then
  echo "▸ Truy cập từ điện thoại (cùng Wi-Fi): http://${LAN_IP}:3000"
else
  echo "▸ Dòng 'Network: http://172.x.x.x:3000' của Next.js là IP nội bộ container."
  echo "  Chạy scripts/docker-up.ps1 để tự dò IP Wi-Fi và in đúng địa chỉ truy cập."
fi
exec npm start
