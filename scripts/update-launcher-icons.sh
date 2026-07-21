#!/bin/bash
set -e

# Caminho da imagem de origem gerada (ícone)
ICON_SRC="/home/lswitch/.gemini/antigravity-ide/brain/d6f9e4ee-80dd-482f-a43d-92029d3b33de/garage_ai_scan_icon_1783738526341.png"
RES_DIR="/home/lswitch/car-parts-marketplce/android/app/src/main/res"

echo "=== ATUALIZANDO ÍCONES DO ANDROID COM IMAGEMAGICK ==="

# mdpi (48x48)
echo "Redimensionando para mdpi (48x48)..."
convert "$ICON_SRC" -resize 48x48 "$RES_DIR/mipmap-mdpi/ic_launcher.png"
convert "$ICON_SRC" -resize 48x48 "$RES_DIR/mipmap-mdpi/ic_launcher_round.png"
convert "$ICON_SRC" -resize 48x48 "$RES_DIR/mipmap-mdpi/ic_launcher_foreground.png"

# hdpi (72x72)
echo "Redimensionando para hdpi (72x72)..."
convert "$ICON_SRC" -resize 72x72 "$RES_DIR/mipmap-hdpi/ic_launcher.png"
convert "$ICON_SRC" -resize 72x72 "$RES_DIR/mipmap-hdpi/ic_launcher_round.png"
convert "$ICON_SRC" -resize 72x72 "$RES_DIR/mipmap-hdpi/ic_launcher_foreground.png"

# xhdpi (96x96)
echo "Redimensionando para xhdpi (96x96)..."
convert "$ICON_SRC" -resize 96x96 "$RES_DIR/mipmap-xhdpi/ic_launcher.png"
convert "$ICON_SRC" -resize 96x96 "$RES_DIR/mipmap-xhdpi/ic_launcher_round.png"
convert "$ICON_SRC" -resize 96x96 "$RES_DIR/mipmap-xhdpi/ic_launcher_foreground.png"

# xxhdpi (144x144)
echo "Redimensionando para xxhdpi (144x144)..."
convert "$ICON_SRC" -resize 144x144 "$RES_DIR/mipmap-xxhdpi/ic_launcher.png"
convert "$ICON_SRC" -resize 144x144 "$RES_DIR/mipmap-xxhdpi/ic_launcher_round.png"
convert "$ICON_SRC" -resize 144x144 "$RES_DIR/mipmap-xxhdpi/ic_launcher_foreground.png"

# xxxhdpi (192x192)
echo "Redimensionando para xxxhdpi (192x192)..."
convert "$ICON_SRC" -resize 192x192 "$RES_DIR/mipmap-xxxhdpi/ic_launcher.png"
convert "$ICON_SRC" -resize 192x192 "$RES_DIR/mipmap-xxxhdpi/ic_launcher_round.png"
convert "$ICON_SRC" -resize 192x192 "$RES_DIR/mipmap-xxxhdpi/ic_launcher_foreground.png"

echo "=== ÍCONES ATUALIZADOS COM SUCESSO ==="
