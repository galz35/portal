#!/usr/bin/env bash
# =========================================================
# PORTAL STACK — DEPLOY SEGURO SIN TOCAR EF
# - NO toca /opt/apps/EF ni PM2 de EF
# - Despliega:
#   /portal/
#   /portal/planer/
#   /portal/vacante/
#   /portal/clinica/
#   /portal/inventario/
# - Crea .env backend y .env.production frontend
# - Levanta PM2 por módulo
# - Agrega rutas nginx al MISMO server de rhclaroni.com
# =========================================================
set -Eeuo pipefail

# =========================
# CONFIG BÁSICA
# =========================
REPO_URL="https://github.com/galz35/portal.git"
REPO_BRANCH="main"
APP_DIR="/opt/apps/portalstack"
WEB_ROOT="/var/www"
DOMINIO="www.rhclaroni.com"
MODO="${1:-update}"   # fresh | update

# Si ya sabes el archivo exacto de nginx, puedes fijarlo aquí.
# Si lo dejas vacío, el script lo detecta buscando rhclaroni.com
NGINX_MAIN_FILE="/etc/nginx/sites-available/planer"
NGINX_SNIPPET="/etc/nginx/snippets/portal_stack_routes.conf"

# =========================
# PUERTOS INTERNOS NUEVOS
# =========================
PORT_PORTAL="3020"
PORT_PLANER="3021"
PORT_CLINICA="3022"
PORT_INVENTARIO="3023"
PORT_VACANTE="3024"

# =========================
# URLS PUBLICAS
# =========================
URL_PORTAL="https://$DOMINIO/portal"
URL_PLANER="https://$DOMINIO/portal/planer"
URL_CLINICA="https://$DOMINIO/portal/clinica"
URL_INVENTARIO="https://$DOMINIO/portal/inventario"
URL_VACANTE="https://$DOMINIO/portal/vacante"

API_PUBLIC_PORTAL="https://$DOMINIO/api-portal"
API_PUBLIC_PLANER="https://$DOMINIO/api-portal-planer"
API_PUBLIC_CLINICA="https://$DOMINIO/api-portal-clinica"
API_PUBLIC_INVENTARIO="https://$DOMINIO/api-portal-inventario"
API_PUBLIC_VACANTE="https://$DOMINIO/api-portal-vacante"

# =========================
# SECRETOS / CONFIG
# =========================
JWT_SECRET='fnS8JHYuYjgyKZzHDXvfzwmK0LVcE0S3jq6HFB14wu/rG+In7Lmv24K4KndjDoyRPZLKhPn7j9PAkk/rcWZq7w=='
JWT_SSO_SECRET='ClaroSSO_Shared_Secret_2026_!#'
COOKIE_SECRET_PORTAL='core-dev-secret-2026'
COOKIE_SECRET_VACANTE='vacantes-dev-secret-2026'

# =========================
# SQL SERVER
# =========================
MSSQL_HOST="190.56.16.85"
MSSQL_PORT="1433"
MSSQL_USER="sa"
MSSQL_PASSWORD='TuPasswordFuerte!2026'
MSSQL_ENCRYPT="false"
MSSQL_TRUST_CERT="true"

# =========================
# SMTP
# =========================
SMTP_HOST="smtp.gmail.com"
SMTP_PORT_TLS="587"
SMTP_PORT_SSL="465"
SMTP_USER="rrrhh1930@gmail.com"
SMTP_PASSWORD='cqvekscikoptijvq'

# Vacante usa otro correo en tu env original:
VACANTE_SMTP_USER="tu-correo@gmail.com"
VACANTE_SMTP_PASSWORD="tu-app-password"
VACANTE_SMTP_FROM='Claro Vacantes <tu-correo@gmail.com>'

# =========================
# BASES POR MODULO
# =========================
DB_PORTAL="PortalCore"
DB_PLANER="Bdplaner"
DB_CLINICA="medicoBD"
DB_INVENTARIO="Inventario_RRHH"
DB_VACANTE="PortalVacantes"

# =========================
# FIREBASE PLANER
# =========================
PLANER_FIREBASE_CREDENTIALS_PATH="./planner-ef-4772a-firebase-adminsdk-fbsvc-9439db0939.json"

# =========================
# STORAGE VACANTE
# OJO: En Linux no uses D:\...
# Ajusta a una ruta real del servidor.
# =========================
VACANTE_CV_STORAGE_ROOT="/opt/portal_storage/candidatos/cv"

# =========================
# ESTRUCTURA MONOREPO
# AJUSTADA CON TUS RUTAS REALES (core/portal-web, etc.)
# nombre|frontend_rel|backend_rel|web_dir|base_publica|api_publica|api_path|pm2_name|port
# =========================
MODULOS=(
  "portal|core/portal-web|core/portal-api-nest|portal|/portal/|$API_PUBLIC_PORTAL|/api-portal/|portal-api|$PORT_PORTAL"
  "planer|planer/v2frontend|planer/v2backend|portal-planer|/portal/planer/|$API_PUBLIC_PLANER|/api-portal-planer/|portal-planer-api|$PORT_PLANER"
  "clinica|clinica/web|clinica/api-nest|portal-clinica|/portal/clinica/|$API_PUBLIC_CLINICA|/api-portal-clinica/|portal-clinica-api|$PORT_CLINICA"
  "inventario|inventario/web|inventario/api-nest|portal-inventario|/portal/inventario/|$API_PUBLIC_INVENTARIO|/api-portal-inventario/|portal-inventario-api|$PORT_INVENTARIO"
  "vacante|vacantes/vacantes-web|vacantes/vacantes-api-nest|portal-vacante|/portal/vacante/|$API_PUBLIC_VACANTE|/api-portal-vacante/|portal-vacante-api|$PORT_VACANTE"
)

log() {
  echo
  echo "===================================================="
  echo "$1"
  echo "===================================================="
}

fail() {
  echo
  echo "❌ ERROR: $1"
  exit 1
}

validar_comando() {
  command -v "$1" >/dev/null 2>&1 || fail "Falta comando: $1"
}

validar_directorio() {
  [ -d "$1" ] || fail "No existe carpeta: $1"
}

backup_nginx() {
  sudo mkdir -p /root/backup_chatgpt_nginx
  sudo cp -a /etc/nginx "/root/backup_chatgpt_nginx/nginx_$(date +%F_%H%M%S)"
}

detectar_nginx_main_file() {
  if [ -n "$NGINX_MAIN_FILE" ]; then
    [ -f "$NGINX_MAIN_FILE" ] || fail "No existe NGINX_MAIN_FILE: $NGINX_MAIN_FILE"
    return 0
  fi

  local resultados
  resultados="$(grep -R "server_name .*rhclaroni\.com" -n /etc/nginx 2>/dev/null | cut -d: -f1 | sort -u || true)"

  local total
  total="$(echo "$resultados" | sed '/^$/d' | wc -l | tr -d ' ')"

  if [ "$total" = "0" ]; then
    fail "No encontré archivo nginx para rhclaroni.com"
  fi

  if [ "$total" != "1" ]; then
    echo "Se encontraron varios archivos posibles:"
    echo "$resultados"
    fail "Define NGINX_MAIN_FILE manualmente arriba del script"
  fi

  NGINX_MAIN_FILE="$(echo "$resultados" | head -n1)"
  echo "NGINX_MAIN_FILE detectado: $NGINX_MAIN_FILE"
}

prechecks() {
  log "PRECHECKS"

  validar_comando git
  validar_comando npm
  validar_comando pm2
  validar_comando nginx
  validar_comando sudo
  validar_comando grep
  validar_comando sed
  validar_comando awk

  sudo mkdir -p "$WEB_ROOT"
  sudo mkdir -p /etc/nginx/snippets

  detectar_nginx_main_file

  echo "PM2 actual:"
  pm2 status || true

  echo
  echo "Nginx test:"
  sudo nginx -t
}

preparar_repo() {
  log "PREPARANDO REPO"

  if [ "$MODO" = "fresh" ]; then
    sudo rm -rf "$APP_DIR"
  fi

  if [ ! -d "$APP_DIR/.git" ]; then
    sudo mkdir -p "$APP_DIR"
    sudo git clone -b "$REPO_BRANCH" "$REPO_URL" "$APP_DIR"
    sudo chown -R "$USER":"$USER" "$APP_DIR"
  else
    cd "$APP_DIR"
    git reset --hard
    git clean -fd
    git fetch origin
    git checkout "$REPO_BRANCH"
    git pull origin "$REPO_BRANCH"
  fi
}

crear_env_frontend() {
  local nombre="$1"
  local frontend_dir="$2"
  local base_publica="$3"
  local api_publica="$4"

  # Variables genéricas para Vite/React.
  cat > "$frontend_dir/.env.production" <<EOF
VITE_APP_BASE=$base_publica
VITE_BASE_PATH=$base_publica
VITE_API_URL=$api_publica
VITE_PORTAL_API_URL=$API_PUBLIC_PORTAL
VITE_PUBLIC_URL=https://$DOMINIO
EOF

  echo "Creado $frontend_dir/.env.production"
}

crear_env_backend() {
  local nombre="$1"
  local backend_dir="$2"
  local port="$3"

  mkdir -p "$backend_dir"

  case "$nombre" in
    portal)
      cat > "$backend_dir/.env" <<EOF
PORT=$port
MSSQL_HOST=$MSSQL_HOST
MSSQL_PORT=$MSSQL_PORT
MSSQL_DATABASE=$DB_PORTAL
MSSQL_USER=$MSSQL_USER
MSSQL_PASSWORD=$MSSQL_PASSWORD
MSSQL_TRUST_CERT=$MSSQL_TRUST_CERT
MSSQL_ENCRYPT=$MSSQL_ENCRYPT
COOKIE_SECRET=$COOKIE_SECRET_PORTAL
COOKIE_SECURE=true
CORS_ORIGIN=https://$DOMINIO
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=1 minute
MAIL_HOST=$SMTP_HOST
MAIL_PORT=$SMTP_PORT_SSL
MAIL_USER=$SMTP_USER
MAIL_PASSWORD=$SMTP_PASSWORD
MAIL_FROM=Portal Central <${SMTP_USER}>
JWT_SECRET=$JWT_SECRET
EOF
      ;;
    vacante)
      cat > "$backend_dir/.env" <<EOF
PORT=$port
MSSQL_HOST=$MSSQL_HOST
MSSQL_PORT=$MSSQL_PORT
MSSQL_DATABASE=$DB_VACANTE
MSSQL_USER=$MSSQL_USER
MSSQL_PASSWORD=$MSSQL_PASSWORD
MSSQL_TRUST_CERT=$MSSQL_TRUST_CERT
MSSQL_ENCRYPT=$MSSQL_ENCRYPT
COOKIE_SECRET=$COOKIE_SECRET_VACANTE
COOKIE_SECURE=true
CORS_ORIGIN=https://$DOMINIO
RATE_LIMIT_MAX=1000
RATE_LIMIT_WINDOW=1 minute
CANDIDATE_CV_STORAGE_ROOT=$VACANTE_CV_STORAGE_ROOT
SMTP_HOST=$SMTP_HOST
SMTP_PORT=$SMTP_PORT_TLS
SMTP_USER=$VACANTE_SMTP_USER
SMTP_PASSWORD=$VACANTE_SMTP_PASSWORD
SMTP_FROM=$VACANTE_SMTP_FROM
CANDIDATE_PASSWORD_RESET_BASE_URL=$URL_VACANTE
PORTAL_API_URL=$API_PUBLIC_PORTAL
JWT_SECRET=$JWT_SECRET
EOF
      ;;
    planer)
      cat > "$backend_dir/.env" <<EOF
DB_TYPE=mssql
MSSQL_HOST=$MSSQL_HOST
MSSQL_PORT=$MSSQL_PORT
MSSQL_USER=$MSSQL_USER
MSSQL_PASSWORD=$MSSQL_PASSWORD
MSSQL_DATABASE=$DB_PLANER
MSSQL_ENCRYPT=$MSSQL_ENCRYPT
MSSQL_TRUST_CERT=$MSSQL_TRUST_CERT
JWT_SECRET=$JWT_SECRET
PORT=$port
MAIL_HOST=$SMTP_HOST
MAIL_PORT=$SMTP_PORT_SSL
MAIL_USER=$SMTP_USER
MAIL_PASSWORD=$SMTP_PASSWORD
MAIL_FROM=Planner-EF <${SMTP_USER}>
FIREBASE_CREDENTIALS_PATH=$PLANER_FIREBASE_CREDENTIALS_PATH
FRONTEND_URL=$URL_PLANER
EOF
      ;;
    clinica)
      cat > "$backend_dir/.env" <<EOF
DB_TYPE=mssql
MSSQL_HOST=$MSSQL_HOST
MSSQL_PORT=$MSSQL_PORT
MSSQL_USER=$MSSQL_USER
MSSQL_PASSWORD=$MSSQL_PASSWORD
MSSQL_DATABASE=$DB_CLINICA
MSSQL_ENCRYPT=$MSSQL_ENCRYPT
MSSQL_TRUST_CERT=$MSSQL_TRUST_CERT
JWT_SECRET=$JWT_SECRET
PORT=$port
PORTAL_API_URL=$API_PUBLIC_PORTAL
CORS_ORIGIN=https://$DOMINIO
MAIL_HOST=$SMTP_HOST
MAIL_PORT=$SMTP_PORT_SSL
MAIL_USER=$SMTP_USER
MAIL_PASSWORD=$SMTP_PASSWORD
MAIL_FROM=Clinica Claroni <${SMTP_USER}>
EOF
      ;;
    inventario)
      cat > "$backend_dir/.env" <<EOF
MSSQL_HOST=$MSSQL_HOST
MSSQL_PORT=$MSSQL_PORT
MSSQL_USER=$MSSQL_USER
MSSQL_PASSWORD=$MSSQL_PASSWORD
MSSQL_DATABASE=$DB_INVENTARIO
MSSQL_ENCRYPT=$MSSQL_ENCRYPT
MSSQL_TRUST_CERT=$MSSQL_TRUST_CERT
SERVER_PORT=$port
LOG_LEVEL=info
JWT_SSO_SECRET=$JWT_SSO_SECRET
JWT_SECRET=$JWT_SECRET
PORTAL_API_URL=$API_PUBLIC_PORTAL
CORS_ORIGIN=https://$DOMINIO
EOF
      ;;
    *)
      fail "Módulo no soportado: $nombre"
      ;;
  esac

  echo "Creado $backend_dir/.env"
}

limpiar_dependencias() {
  local dir="$1"
  cd "$dir"
  rm -rf node_modules
  rm -f package-lock.json
}

build_frontend() {
  local nombre="$1"
  local frontend_rel="$2"
  local web_dir_name="$3"
  local base_publica="$4"
  local api_publica="$5"

  local frontend_dir="$APP_DIR/$frontend_rel"
  local web_dir="$WEB_ROOT/$web_dir_name"

  validar_directorio "$frontend_dir"
  crear_env_frontend "$nombre" "$frontend_dir" "$base_publica" "$api_publica"
  limpiar_dependencias "$frontend_dir"

  log "FRONTEND: $nombre"

  cd "$frontend_dir"
  npm install --legacy-peer-deps
  npm run build

  [ -d "$frontend_dir/dist" ] || fail "No existe dist en $frontend_dir"

  sudo mkdir -p "$web_dir"
  sudo rm -rf "${web_dir:?}"/*
  sudo cp -a "$frontend_dir/dist"/. "$web_dir"/
  sudo chown -R www-data:www-data "$web_dir"

  echo "Publicado frontend: $web_dir"
}

build_backend() {
  local nombre="$1"
  local backend_rel="$2"
  local pm2_name="$3"
  local port="$4"

  local backend_dir="$APP_DIR/$backend_rel"
  local entry=""

  validar_directorio "$backend_dir"
  crear_env_backend "$nombre" "$backend_dir" "$port"
  limpiar_dependencias "$backend_dir"

  log "BACKEND: $nombre"

  cd "$backend_dir"
  npm install --legacy-peer-deps
  npm run build

  if [ -f "dist/src/main.js" ]; then
    entry="dist/src/main.js"
  elif [ -f "dist/main.js" ]; then
    entry="dist/main.js"
  else
    fail "No encontré entrypoint en $backend_dir"
  fi

  if pm2 describe "$pm2_name" >/dev/null 2>&1; then
    pm2 restart "$pm2_name" --update-env
  else
    pm2 start "$entry" --name "$pm2_name"
  fi
}

generar_snippet_nginx() {
  log "GENERANDO SNIPPET NGINX"

  sudo tee "$NGINX_SNIPPET" >/dev/null <<'EOF'
# =========================================================
# PORTAL STACK
# ESTE INCLUDE VA DENTRO DEL MISMO server {} DE rhclaroni.com
# NO TOCAR /app/ NI RUTAS DE EF
# =========================================================
EOF

  for item in "${MODULOS[@]}"; do
    IFS='|' read -r nombre frontend_rel backend_rel web_dir_name base_publica api_publica api_path pm2_name port <<< "$item"
    local local_front_path="$WEB_ROOT/$web_dir_name"

    sudo tee -a "$NGINX_SNIPPET" >/dev/null <<EOF

# ---------- $nombre ----------
location $base_publica {
    alias $local_front_path/;
    index index.html;
    try_files \$uri \$uri/ ${base_publica}index.html;
}

location $api_path {
    proxy_pass http://127.0.0.1:$port/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
    proxy_set_header Upgrade \$http_upgrade;
    proxy_set_header Connection "upgrade";
}
EOF
  done
}

agregar_include_nginx() {
  log "AGREGANDO INCLUDE A NGINX"

  if grep -q "include $NGINX_SNIPPET;" "$NGINX_MAIN_FILE"; then
    echo "El include ya existía en $NGINX_MAIN_FILE"
    return 0
  fi

  sudo cp "$NGINX_MAIN_FILE" "${NGINX_MAIN_FILE}.bak_$(date +%F_%H%M%S)"

  # Inserta el include debajo de server_name del bloque actual
  sudo sed -i "/server_name .*rhclaroni\.com/a\\
    include $NGINX_SNIPPET;
" "$NGINX_MAIN_FILE"

  echo "Include agregado en $NGINX_MAIN_FILE"
}

validar_final() {
  log "VALIDACIÓN FINAL"

  pm2 save
  sudo nginx -t
  sudo systemctl reload nginx

  echo
  echo "PM2:"
  pm2 status

  echo
  echo "Pruebas:"
  echo "curl -I $URL_PORTAL/"
  echo "curl -I $URL_PLANER/"
  echo "curl -I $URL_CLINICA/"
  echo "curl -I $URL_INVENTARIO/"
  echo "curl -I $URL_VACANTE/"
  echo
  echo "curl -I $API_PUBLIC_PORTAL/"
  echo "curl -I $API_PUBLIC_PLANER/"
  echo "curl -I $API_PUBLIC_CLINICA/"
  echo "curl -I $API_PUBLIC_INVENTARIO/"
  echo "curl -I $API_PUBLIC_VACANTE/"
}

# =========================
# MAIN
# =========================
prechecks
backup_nginx
preparar_repo

for item in "${MODULOS[@]}"; do
  IFS='|' read -r nombre frontend_rel backend_rel web_dir_name base_publica api_publica api_path pm2_name port <<< "$item"

  build_frontend "$nombre" "$frontend_rel" "$web_dir_name" "$base_publica" "$api_publica"
  build_backend "$nombre" "$backend_rel" "$pm2_name" "$port"
done

generar_snippet_nginx
agregar_include_nginx
validar_final

echo
echo "✅ Portal stack desplegado sin tocar EF."
echo "✅ EF sigue intacto en /opt/apps/EF"
echo "✅ Portal queda en /opt/apps/portalstack"
