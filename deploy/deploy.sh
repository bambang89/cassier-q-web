#!/usr/bin/env bash
# Deploy blue-green tanpa downtime (dijalankan Jenkins): deploy.sh <image-tag>
#   1. jalankan warna yang sedang idle di samping yang live
#   2. tunggu health check-nya lolos
#   3. arahkan nginx-upstream.conf ke warna baru (systemd path unit di host
#      menjalankan `nginx -t && systemctl reload nginx`, lalu menyalin file ke
#      .nginx-applied sebagai tanda nginx sudah pindah)
#   4. matikan warna lama
set -euo pipefail
cd "$(dirname "$0")"

TAG="${1:?usage: deploy.sh <image-tag>}"
UPSTREAM=nginx-upstream.conf
APPLIED=.nginx-applied

ACTIVE_PORT=$(grep -oE '127\.0\.0\.1:[0-9]+' "$UPSTREAM" 2>/dev/null | head -1 | cut -d: -f2 || true)
if [ "$ACTIVE_PORT" = "3102" ]; then
  NEW=blue;  NEW_PORT=3101; OLD_PORT=3102
else
  NEW=green; NEW_PORT=3102; OLD_PORT=3101
fi
NEW_CONTAINER="cassier-q-web-$NEW"

echo ">> Live: 127.0.0.1:${ACTIVE_PORT:-none}. Deploying $TAG as $NEW on 127.0.0.1:$NEW_PORT"
export IMAGE_TAG="$TAG" COLOR="$NEW" HOST_PORT="$NEW_PORT"
docker compose -p "$NEW_CONTAINER" up -d --force-recreate

echo ">> Waiting for $NEW_CONTAINER to become healthy..."
STATUS=starting
for _ in $(seq 1 40); do
  STATUS=$(docker inspect -f '{{.State.Health.Status}}' "$NEW_CONTAINER" 2>/dev/null || echo missing)
  case "$STATUS" in healthy|unhealthy|missing) break ;; esac
  sleep 3
done
if [ "$STATUS" != "healthy" ]; then
  echo "!! $NEW_CONTAINER is $STATUS. Live version left untouched."
  docker logs --tail 150 "$NEW_CONTAINER" || true
  docker compose -p "$NEW_CONTAINER" down || true
  exit 1
fi

echo ">> Switching nginx to 127.0.0.1:$NEW_PORT"
NEW_UPSTREAM="upstream cassier_q_web { server 127.0.0.1:$NEW_PORT; keepalive 16; }"
echo "$NEW_UPSTREAM" > "$UPSTREAM"
for _ in $(seq 1 30); do
  [ "$(cat "$APPLIED" 2>/dev/null)" = "$NEW_UPSTREAM" ] && break
  sleep 1
done
if [ "$(cat "$APPLIED" 2>/dev/null)" != "$NEW_UPSTREAM" ]; then
  echo "!! nginx did not pick up the new upstream. Rolling back."
  [ -n "$ACTIVE_PORT" ] && echo "upstream cassier_q_web { server 127.0.0.1:$ACTIVE_PORT; keepalive 16; }" > "$UPSTREAM"
  docker compose -p "$NEW_CONTAINER" down || true
  exit 1
fi

# Worker nginx lama masih menyelesaikan request yang sedang berjalan
sleep 5
OLD=$(docker ps -q --filter "publish=$OLD_PORT")
if [ -n "$OLD" ]; then
  echo ">> Stopping old version on 127.0.0.1:$OLD_PORT"
  docker stop -t 20 $OLD >/dev/null
  docker rm $OLD >/dev/null
fi

echo ">> Done: $TAG live as $NEW on 127.0.0.1:$NEW_PORT"
