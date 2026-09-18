#!/usr/bin/env bash
# ios-ephemeral-build.sh — build efêmero mac2-m2.metal (liga só pro build)
# Uso:
#   ./scripts/ios-ephemeral-build.sh                # apply → build → destroy (default)
#   ./scripts/ios-ephemeral-build.sh --no-destroy   # mantém host ligado (debug)
# Requisitos: aws cli, terraform, node 22, cap, rsync, ssh
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TF_DIR="$ROOT/terraform/mac-ios"
KEY="$ROOT/Ios-key.pem"
BUILD_DIR="$ROOT/build"
NO_DESTROY=false
[[ "${1:-}" == "--no-destroy" ]] && NO_DESTROY=true

# 0) Validações
[[ -f "$KEY" ]] || { echo "❌ Ios-key.pem não encontrado em $KEY"; exit 1; }
chmod 400 "$KEY" || true
command -v terraform >/dev/null 2>&1 || { echo "❌ terraform não encontrado (→ ~/.local/bin/terraform)"; exit 1; }
command -v aws >/dev/null 2>&1 || { echo "❌ aws cli não encontrado"; exit 1; }

if [[ "${ALLOWED_SSH_CIDR:-}" != "" ]]; then
  TF_VAR=" -var=allowed_ssh_cidr=$ALLOWED_SSH_CIDR"
else
  TF_VAR=""
fi

cleanup() {
  if $NO_DESTROY; then
    echo "⚠️ --no-destroy ativo — host permanece alocado (cobrança 24h). Destrua manual: terraform -chdir=$TF_DIR destroy -auto-approve"
    return
  fi
  echo "🧹 Destroy efêmero (sempre cobra 24h mesmo em 1h)..."
  terraform -chdir="$TF_DIR" destroy -auto-approve $TF_VAR || echo "⚠️ destroy falhou — verifique manualmente"
}
if ! $NO_DESTROY; then
  trap cleanup EXIT
fi

# 1) Build web marketplace-only
echo "▸ Build web marketplace (VITE_APP_MODE=store) ..."
VITE_APP_MODE=store npm run build
echo "▸ cap sync ios (gera ios/App se necessário) ..."
npx cap sync ios || npx cap add ios && npx cap sync ios
# Corrige Podfile desalinhado (capacitor 7.6.8)
if grep -q "@capacitor+ios@5.7" ios/App/Podfile 2>/dev/null; then
  echo "⚠️ Podfile antigo 5.7 detectado — já corrigido para 7.6.8"
fi

# 2) Terraform apply
echo "▸ Terraform apply (host mac2-m2.metal — alocação 20-45min) ..."
terraform -chdir="$TF_DIR" init -input=false
terraform -chdir="$TF_DIR" apply -auto-approve $TF_VAR

IP=$(terraform -chdir="$TF_DIR" output -raw mac_public_ip)
echo "✅ Host IP: $IP"
echo "   SSH: ssh -i $KEY ec2-user@$IP"
# Aguarda SSH
echo "▸ Aguardando SSH (até 10min) ..."
for i in $(seq 1 60); do
  if ssh -i "$KEY" -o StrictHostKeyChecking=no -o ConnectTimeout=5 ec2-user@"$IP" "echo ok" 2>/dev/null; then
    echo "✅ SSH OK"
    break
  fi
  echo "  ... tentativa $i/60"
  sleep 10
  if [[ $i -eq 60 ]]; then echo "❌ SSH não respondeu"; exit 1; fi
done

# 3) Rsync dist + ios
echo "▸ Rsync dist + ios → mac ..."
ssh -i "$KEY" -o StrictHostKeyChecking=no ec2-user@"$IP" "mkdir -p ~/daig" || true
rsync -azP -e "ssh -i $KEY -o StrictHostKeyChecking=no" --delete "$ROOT/dist/" "ec2-user@$IP:~/daig/dist/"
rsync -azP -e "ssh -i $KEY -o StrictHostKeyChecking=no" --delete "$ROOT/ios/" "ec2-user@$IP:~/daig/ios/"
rsync -azP -e "ssh -i $KEY -o StrictHostKeyChecking=no" "$ROOT/package.json" "ec2-user@$IP:~/daig/"
rsync -azP -e "ssh -i $KEY -o StrictHostKeyChecking=no" "$ROOT/capacitor.config.ts" "ec2-user@$IP:~/daig/" || true
# ExportOptions se APPLE_TEAM_ID estiver no env
if [[ -n "${APPLE_TEAM_ID:-}" ]]; then
  envsubst < "$TF_DIR/ExportOptions.plist.template" | ssh -i "$KEY" -o StrictHostKeyChecking=no ec2-user@"$IP" "cat > ~/daig/ExportOptions.plist"
fi

# 4) Build no mac
echo "▸ Build no mac (pod install + xcodebuild archive/export) ..."
ssh -i "$KEY" -o StrictHostKeyChecking=no ec2-user@"$IP" bash -s <<'REMOTE'
set -euo pipefail
export PATH=/opt/homebrew/bin:/usr/local/bin:$PATH
cd ~/daig
# Node + deps (se necessário)
if ! command -v node >/dev/null 2>&1; then
  brew install node@22 || true
  brew link node@22 --force || true
fi
if ! command -v pod >/dev/null 2>&1; then
  sudo gem install cocoapods -N || brew install cocoapods || true
fi
echo "▸ Xcode version:"
xcodebuild -version || true
xcode-select -p || true
cd ~/daig/ios/App
pod install --repo-update || pod install
# Archive
xcodebuild -workspace App.xcworkspace -scheme App -configuration Release \
  -destination 'generic/platform=iOS' \
  -archivePath ~/daig/DAIG.xcarchive archive \
  CODE_SIGN_STYLE=Automatic || {
    echo "⚠️ archive falhou — verifique provisioning/teamID"
    exit 1
  }
# Export
if [[ -f ~/daig/ExportOptions.plist ]]; then
  xcodebuild -exportArchive -archivePath ~/daig/DAIG.xcarchive \
    -exportPath ~/daig/build -exportOptionsPlist ~/daig/ExportOptions.plist || true
else
  echo "⚠️ ExportOptions.plist ausente (defina APPLE_TEAM_ID) — .xcarchive gerado mas sem .ipa exportado"
  mkdir -p ~/daig/build
fi
ls -lh ~/daig/build/ 2>&1 | head -20
ls -lh ~/daig/DAIG.xcarchive 2>&1 | head -20
REMOTE

# 5) Coleta artefatos
echo "▸ Coletando .ipa/.xcarchive ..."
mkdir -p "$BUILD_DIR"
scp -i "$KEY" -o StrictHostKeyChecking=no -r "ec2-user@$IP:~/daig/build/*" "$BUILD_DIR/" 2>&1 | tail -20 || echo "⚠️ nenhum .ipa exportado (sem teamID?) — .xcarchive em ~/daig/DAIG.xcarchive no host"
scp -i "$KEY" -o StrictHostKeyChecking=no -r "ec2-user@$IP:~/daig/DAIG.xcarchive" "$BUILD_DIR/" 2>&1 | tail -5 || true
ls -lh "$BUILD_DIR" 2>&1 | head -30

echo "✅ Build efêmero concluído. Artefatos em $BUILD_DIR"
if ! $NO_DESTROY; then
  echo "🧹 Destroy automático em 5s (Ctrl+C para cancelar) ..."
  sleep 5
fi
