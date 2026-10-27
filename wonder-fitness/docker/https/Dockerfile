# Reverse proxy HTTPS cho app Wonder Fitness.
# Sinh chứng chỉ tự ký (self-signed) ngay khi container khởi động, dùng đúng
# IP LAN hiện tại trong SAN để camera QR hoạt động trên điện thoại.
FROM nginx:1.27-alpine

RUN apk add --no-cache openssl

COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY 40-selfsigned-cert.sh /docker-entrypoint.d/40-selfsigned-cert.sh
RUN chmod +x /docker-entrypoint.d/40-selfsigned-cert.sh
