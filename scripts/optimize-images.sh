#!/bin/bash
# ============================================
# Image Optimization for byHAVA Portfolio
#
# Creates web-optimized versions:
#   - Grid thumbnails: 600px, quality 80, stripped EXIF
#   - Lightbox images: 1200px, quality 82, stripped EXIF
#   - WebP versions of both sizes
#
# Directory structure:
#   images/portfolio-originals/  ← full-res backups (gitignored)
#   images/portfolio/            ← grid thumbnails (600px JPG)
#   images/portfolio-webp/       ← grid thumbnails (600px WebP)
#   images/portfolio-lg/         ← lightbox images (1200px JPG)
#   images/portfolio-lg-webp/    ← lightbox images (1200px WebP)
# ============================================

set -e
cd "$(dirname "$0")/.."

THUMB_SIZE=600
LARGE_SIZE=1200
THUMB_QUALITY=80
LARGE_QUALITY=82
WEBP_QUALITY=80

SRC="images/portfolio"
ORIGINALS="images/portfolio-originals"
WEBP_DIR="images/portfolio-webp"
LARGE_DIR="images/portfolio-lg"
LARGE_WEBP_DIR="images/portfolio-lg-webp"

echo "=== byHAVA Image Optimization ==="
echo ""

# Step 1: Back up originals if not already done
if [ ! -d "$ORIGINALS" ]; then
  echo "📦 Backing up originals to $ORIGINALS..."
  cp -r "$SRC" "$ORIGINALS"
  echo "   Done. $(find "$ORIGINALS" -name '*.jpg' | wc -l) files backed up."
else
  echo "📦 Originals already backed up."
fi

# Step 2: Create output directories
for topic in "$SRC"/*/; do
  topic_name=$(basename "$topic")
  mkdir -p "$WEBP_DIR/$topic_name"
  mkdir -p "$LARGE_DIR/$topic_name"
  mkdir -p "$LARGE_WEBP_DIR/$topic_name"
done

# Step 3: Process each image
total=$(find "$ORIGINALS" -name '*.jpg' | wc -l)
count=0

find "$ORIGINALS" -name '*.jpg' | sort | while read -r original; do
  count=$((count + 1))

  # Get relative path: topic/filename.jpg
  rel="${original#$ORIGINALS/}"
  topic_name=$(dirname "$rel")
  filename=$(basename "$rel")
  basename_noext="${filename%.*}"

  # Output paths
  thumb_jpg="$SRC/$rel"
  thumb_webp="$WEBP_DIR/$topic_name/${basename_noext}.webp"
  large_jpg="$LARGE_DIR/$rel"
  large_webp="$LARGE_WEBP_DIR/$topic_name/${basename_noext}.webp"

  printf "\r[%d/%d] %s" "$count" "$total" "$rel"

  # Grid thumbnail (600px, JPEG)
  convert "$original" \
    -resize "${THUMB_SIZE}x${THUMB_SIZE}>" \
    -quality "$THUMB_QUALITY" \
    -strip \
    -sampling-factor 4:2:0 \
    -interlace Plane \
    "$thumb_jpg"

  # Grid thumbnail (600px, WebP)
  convert "$original" \
    -resize "${THUMB_SIZE}x${THUMB_SIZE}>" \
    -quality "$WEBP_QUALITY" \
    -strip \
    -define webp:method=6 \
    "$thumb_webp"

  # Lightbox image (1200px, JPEG)
  convert "$original" \
    -resize "${LARGE_SIZE}x${LARGE_SIZE}>" \
    -quality "$LARGE_QUALITY" \
    -strip \
    -sampling-factor 4:2:0 \
    -interlace Plane \
    "$large_jpg"

  # Lightbox image (1200px, WebP)
  convert "$original" \
    -resize "${LARGE_SIZE}x${LARGE_SIZE}>" \
    -quality "$WEBP_QUALITY" \
    -strip \
    -define webp:method=6 \
    "$large_webp"
done

echo ""
echo ""

# Step 4: Report
orig_size=$(du -sm "$ORIGINALS" | cut -f1)
thumb_jpg_size=$(du -sm "$SRC" | cut -f1)
thumb_webp_size=$(du -sm "$WEBP_DIR" | cut -f1)
large_jpg_size=$(du -sm "$LARGE_DIR" | cut -f1)
large_webp_size=$(du -sm "$LARGE_WEBP_DIR" | cut -f1)

echo "=== Results ==="
echo "Originals:          ${orig_size} MB (backed up, gitignored)"
echo "Grid JPG (${THUMB_SIZE}px):    ${thumb_jpg_size} MB"
echo "Grid WebP (${THUMB_SIZE}px):   ${thumb_webp_size} MB"
echo "Lightbox JPG (${LARGE_SIZE}px): ${large_jpg_size} MB"
echo "Lightbox WebP (${LARGE_SIZE}px):${large_webp_size} MB"
echo ""
echo "Web serving (WebP grid + WebP lightbox): $((thumb_webp_size + large_webp_size)) MB"
echo "Fallback (JPG grid + JPG lightbox): $((thumb_jpg_size + large_jpg_size)) MB"
echo "Savings: ${orig_size} MB → ~$((thumb_webp_size + large_webp_size)) MB"
echo ""
echo "✅ Done! Update .gitignore and HTML as needed."
