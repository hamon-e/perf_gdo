# Déploiement sur perf-gdo (gdo.bot.nu)

La box fait tourner `deploy/compose.prod.yaml` depuis un clone du dépôt dans
`/opt/gdo`. Les images viennent de GHCR, buildées par `.github/workflows/deploy.yml`
qui se connecte en SSH à la box pour tirer et relancer les services.

## Provisioning one-time (déjà fait)

```sh
ssh root@gdo.bot.nu
apt-get update && apt-get install -y git
git clone https://github.com/hamon-e/perf_gdo.git /opt/gdo
cd /opt/gdo
openssl rand -hex 24  # POSTGRES_PASSWORD
openssl rand -hex 32  # JWT_SECRET_KEY
cat > .env <<'EOF'
POSTGRES_PASSWORD=<...>
JWT_SECRET_KEY=<...>
ACCESS_TOKEN_EXPIRE_MINUTES=43200
EOF
docker compose -f deploy/compose.prod.yaml --project-directory /opt/gdo up -d
```

`.env` n'est jamais committé. Le certificat TLS est émis automatiquement par
Caddy (Let's Encrypt) pour `gdo.bot.nu`.

## Déploiement

À chaque push sur `main` : tests → build des images → push GHCR (tags
`sha-<ref>` + `latest`) → SSH sur la box → `docker compose pull && up -d`.

## Rollback

Sur la box :

```sh
cd /opt/gdo
IMAGE_TAG=sha-<ref-antérieure> docker compose -f deploy/compose.prod.yaml \
  --project-directory /opt/gdo up -d
```
