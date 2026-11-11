#!/usr/bin/env bash
# Publish the trained adapters as assets of one GitHub release (files over 100 MB cannot go in git itself).
# Run after the repo is pushed:  bash scripts/release_adapters.sh [tag]
set -euo pipefail
cd "$(dirname "$0")/.."
TAG="${1:-c0mpiled-18}"
mkdir -p .cache/release
declare -A RUN=([garry]="20261111-1935")   # the run the README reports where it is not the active one
for v in garry sam pg; do
  rid="${RUN[$v]:-$(python3 -c "import json;print(json.load(open('runs/$v/active.json'))['run'])")}"
  src="runs/$v/runs/$rid"
  out=".cache/release/buntai-adapter-$v.zip"
  rm -f "$out"
  (cd "$src" && zip -q -r "../../../../$out" adapter/adapter_config.json adapter/adapter_model.safetensors metrics.json info.json)
  echo "$v: run $rid -> $out ($(du -h "$out" | cut -f1))"
done
gh release create "$TAG" .cache/release/buntai-adapter-*.zip \
  --title "Buntai adapters, c0mpiled-18" \
  --notes "LoRA adapters (rank 16, 33M parameters) for Qwen/Qwen3-VL-4B-Instruct: Garry Tan, Sam Altman, Paul Graham. Each zip holds adapter/ (load with PeftModel.from_pretrained), metrics.json and info.json. Trained from the authors' public posts; shared as a research artifact and taken down on an author's request."
echo "https://github.com/mo-haggag/buntai/releases/tag/$TAG"
