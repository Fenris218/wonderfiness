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
exec npm start
