#!/usr/bin/env bash
# Install/configure host nginx + Let's Encrypt for zarva.rmhosseini.ir
# Intended to run ON the VPS (self-hosted runner or SSH).
set -euo pipefail

DOMAIN="${DOMAIN:-zarva.rmhosseini.ir}"
EMAIL="${CERTBOT_EMAIL:-admin@rmhosseini.ir}"
SITE_SRC="$(cd "$(dirname "$0")" && pwd)/host-nginx/${DOMAIN}.conf"
SITE_AVAIL="/etc/nginx/sites-available/${DOMAIN}"
SITE_ENABLED="/etc/nginx/sites-enabled/${DOMAIN}"
WEBROOT="/var/www/certbot"
ZARVA_ENV="${ZARVA_ENV:-/opt/zarva/.env}"

if [ ! -f "$SITE_SRC" ]; then
  echo "::error::Missing nginx template: $SITE_SRC"
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y nginx certbot python3-certbot-nginx curl

mkdir -p "$WEBROOT"
chown -R www-data:www-data "$WEBROOT" 2>/dev/null || true

# Disable default site if it steals server_name _
if [ -L /etc/nginx/sites-enabled/default ]; then
  rm -f /etc/nginx/sites-enabled/default
fi

cp "$SITE_SRC" "$SITE_AVAIL"
ln -sfn "$SITE_AVAIL" "$SITE_ENABLED"

nginx -t
systemctl enable nginx
systemctl reload nginx

echo "--> Requesting/renewing Let's Encrypt cert for ${DOMAIN}..."
# Cloudflare orange-cloud: HTTP-01 hits origin :80 via CF proxy — keep port 80 open in panel.
certbot --nginx \
  -d "$DOMAIN" \
  --non-interactive \
  --agree-tos \
  --email "$EMAIL" \
  --redirect \
  --keep-until-expiring \
  || certbot --nginx -d "$DOMAIN" --non-interactive --agree-tos --email "$EMAIL" --redirect

nginx -t
systemctl reload nginx

# Point Zarva public URLs at the domain (no :1032) for next compose/bootstrap.
if [ -f "$ZARVA_ENV" ]; then
  touch "$ZARVA_ENV"
  for kv in \
    "NEXT_PUBLIC_API_URL=https://${DOMAIN}/api/v1" \
    "NEXT_PUBLIC_APP_URL=https://${DOMAIN}" \
    "APP_URL=https://${DOMAIN}" \
    "CORS_ORIGIN=https://${DOMAIN}"; do
    key=${kv%%=*}
    val=${kv#*=}
    if grep -q "^${key}=" "$ZARVA_ENV"; then
      sed -i "s|^${key}=.*|${key}=${val}|" "$ZARVA_ENV"
    else
      echo "${key}=${val}" >> "$ZARVA_ENV"
    fi
  done
  echo "--> Updated ${ZARVA_ENV} public URLs to https://${DOMAIN}"
fi

echo "--> Local health via host nginx..."
curl -fsS -H "Host: ${DOMAIN}" "http://127.0.0.1/api/v1/health" || \
  curl -kfsS "https://127.0.0.1/api/v1/health" || true

echo "--> Public check (may go via Cloudflare):"
curl -fsSI "https://${DOMAIN}/api/v1/health" | head -15 || \
  echo "WARN: public HTTPS check failed — set Cloudflare SSL mode to Full (strict) and ensure 80/443 are open to Cloudflare."

echo "HOST_DOMAIN_OK domain=${DOMAIN}"
