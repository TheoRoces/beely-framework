#!/bin/bash
# Deploy site-system to a target defined in .deploy.env
#
# Usage:
#   ./deploy.sh prod              Deploy to production
#   ./deploy.sh preprod           Deploy to pre-production
#   ./deploy.sh prod --dry-run    Simulate (no files transferred)
#
# Targets (prod/preprod) are configured in .deploy.env

LOCAL_PATH="$(cd "$(dirname "$0")" && pwd)/"
DEPLOY_ENV="${LOCAL_PATH}.deploy.env"
EXCLUDE_FILE="${LOCAL_PATH}.rsync-exclude"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# ---------- Parse arguments ----------

TARGET=""
DRY_RUN=""

for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN="--dry-run" ;;
    prod|preprod) TARGET="$arg" ;;
    *)
      echo -e "${RED}Argument inconnu : $arg${NC}"
      echo "Usage : ./deploy.sh <prod|preprod> [--dry-run]"
      exit 1
      ;;
  esac
done

if [ -z "$TARGET" ]; then
  echo -e "${RED}Cible manquante.${NC}"
  echo "Usage : ./deploy.sh <prod|preprod> [--dry-run]"
  exit 1
fi

# ---------- Read config from .deploy.env ----------

if [ ! -f "$DEPLOY_ENV" ]; then
  echo -e "${RED}Fichier .deploy.env introuvable.${NC}"
  echo "Copiez .deploy.env.example en .deploy.env et remplissez vos valeurs SSH."
  exit 1
fi

# shellcheck source=/dev/null
source "$DEPLOY_ENV"

# Map variables based on target
if [ "$TARGET" = "prod" ]; then
  REMOTE_HOST="$PROD_HOST"
  REMOTE_PORT="${PROD_PORT:-22}"
  REMOTE_USER="$PROD_USER"
  REMOTE_PATH="$PROD_PATH"
  REMOTE_URL="$PROD_URL"
elif [ "$TARGET" = "preprod" ]; then
  REMOTE_HOST="$PREPROD_HOST"
  REMOTE_PORT="${PREPROD_PORT:-22}"
  REMOTE_USER="$PREPROD_USER"
  REMOTE_PATH="$PREPROD_PATH"
  REMOTE_URL="$PREPROD_URL"
fi

# Validate required fields
if [ -z "$REMOTE_HOST" ] || [ -z "$REMOTE_USER" ] || [ -z "$REMOTE_PATH" ]; then
  echo -e "${RED}Configuration incomplète pour '$TARGET'. Vérifiez les variables dans .deploy.env${NC}"
  exit 1
fi

# ---------- Generate sitemap ----------

if [ -n "$REMOTE_URL" ] && [ -f "${LOCAL_PATH}generate-sitemap.js" ]; then
  echo -e "${CYAN}Génération du sitemap...${NC}"
  node "${LOCAL_PATH}generate-sitemap.js" "$REMOTE_URL"
  if [ $? -eq 0 ]; then
    echo -e "${GREEN}Sitemap généré.${NC}"
  else
    echo -e "${YELLOW}Sitemap : échec (déploiement continue)${NC}"
  fi
fi

# ---------- Deploy ----------

echo ""
echo -e "${CYAN}━━━ Déploiement [$TARGET] ━━━${NC}"
echo -e "  Cible : ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PORT}"
echo -e "  Path  : ${REMOTE_PATH}"
[ -n "$REMOTE_URL" ] && echo -e "  URL   : ${REMOTE_URL}"
[ -n "$DRY_RUN" ] && echo -e "  ${YELLOW}Mode dry-run : aucun fichier ne sera modifié${NC}"
echo ""

rsync -avz --delete \
  --exclude-from="$EXCLUDE_FILE" \
  -e "ssh -p ${REMOTE_PORT}" \
  $DRY_RUN \
  "$LOCAL_PATH" \
  "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}"

if [ $? -eq 0 ]; then
  echo ""
  echo -e "${GREEN}Déploiement $TARGET terminé !${NC}"
  [ -n "$REMOTE_URL" ] && echo -e "${GREEN}→ ${REMOTE_URL}${NC}"
else
  echo -e "${RED}Erreur lors du déploiement.${NC}"
  exit 1
fi
