#!/bin/bash
# 检测 www.jktac.top DNS 生效后自动扩展 SSL 证书
set -e

echo "等待 www.jktac.top DNS 解析..."
for i in $(seq 1 30); do
  IP=$(dig +short www.jktac.top A @8.8.8.8 | head -1)
  if [ -n "$IP" ]; then
    echo "DNS 已生效: www.jktac.top -> $IP"
    certbot certonly --nginx -d jktac.top -d www.jktac.top --expand --non-interactive --agree-tos
    cp /root/dev-showcase/deploy/nginx.conf /etc/nginx/sites-available/dev-showcase
    nginx -t && systemctl reload nginx
    echo "SSL 证书已扩展，www.jktac.top HTTPS 已启用"
    exit 0
  fi
  sleep 10
done
echo "DNS 仍未生效，请在 Cloudflare 添加 www CNAME 记录后重试"
exit 1
