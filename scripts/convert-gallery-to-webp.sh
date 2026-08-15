#!/usr/bin/env bash
#
# Converts all JPGs from gallery-original/ into resized, sequentially named
# WebP files in assets/images/gallery/.
#
# Usage:
#   ./scripts/convert-gallery-to-webp.sh
#
# Requirements:
#   - cwebp (Google's WebP encoder). Install via: brew install webp
#
# Options (override via environment variables):
#   SRC_DIR    Source folder with original JPGs   (default: gallery-original)
#   DEST_DIR   Output folder for WebP files        (default: assets/images/gallery)
#   WIDTH      Target width in px, height auto     (default: 1200)
#   QUALITY    WebP quality 0-100                  (default: 82)
#   PREFIX     Output filename prefix              (default: gallery)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

SRC_DIR="${SRC_DIR:-${PROJECT_ROOT}/gallery-original}"
DEST_DIR="${DEST_DIR:-${PROJECT_ROOT}/assets/images/gallery}"
WIDTH="${WIDTH:-1200}"
QUALITY="${QUALITY:-82}"
PREFIX="${PREFIX:-gallery}"

if ! command -v cwebp >/dev/null 2>&1; then
  echo "Error: cwebp is not installed. Install it with: brew install webp" >&2
  exit 1
fi

if [[ ! -d "${SRC_DIR}" ]]; then
  echo "Error: source folder not found: ${SRC_DIR}" >&2
  exit 1
fi

mkdir -p "${DEST_DIR}"

# Collect JPGs (case-insensitive extension), sorted naturally for stable numbering.
shopt -s nullglob nocaseglob
files=("${SRC_DIR}"/*.jpg "${SRC_DIR}"/*.jpeg)
shopt -u nocaseglob nullglob

if [[ ${#files[@]} -eq 0 ]]; then
  echo "No JPG files found in ${SRC_DIR}" >&2
  exit 1
fi

IFS=$'\n' files=($(sort <<<"${files[*]}")); unset IFS

count=0
total=${#files[@]}
digits=${#total}
[[ ${digits} -lt 2 ]] && digits=2

for src in "${files[@]}"; do
  count=$((count + 1))
  index=$(printf "%0${digits}d" "${count}")
  dest="${DEST_DIR}/${PREFIX}-${index}.webp"

  echo "[${count}/${total}] $(basename "${src}") -> $(basename "${dest}")"
  cwebp -quiet -q "${QUALITY}" -resize "${WIDTH}" 0 "${src}" -o "${dest}"
done

echo "Done: ${count} image(s) converted to ${DEST_DIR}"
