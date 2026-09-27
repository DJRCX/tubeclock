#!/usr/bin/env bash
set -e

# package_release.sh - Creates a clean distribution ZIP for GitHub Releases using Python's built-in zipfile
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

python3 - << 'EOF'
import os
import json
import zipfile

script_dir = os.path.dirname(os.path.abspath(__file__)) if '__file__' in globals() else os.getcwd()
manifest_path = os.path.join(script_dir, "manifest.json")

with open(manifest_path, "r", encoding="utf-8") as f:
    manifest = json.load(f)

version = manifest.get("version", "1.0.0")
name = "tubeclock"
output_zip = os.path.join(script_dir, f"{name}-v{version}.zip")

includes = ["manifest.json", "icons", "content", "popup", "LICENSE", "README.md"]
ignore_exts = {".DS_Store", ".pyc"}
ignore_dirs = {"__pycache__"}

print(f"📦 Packaging {name} v{version} into {output_zip}...")

with zipfile.ZipFile(output_zip, "w", zipfile.ZIP_DEFLATED) as zf:
    for item in includes:
        full_path = os.path.join(script_dir, item)
        if os.path.isfile(full_path):
            zf.write(full_path, arcname=item)
            print(f"  + {item}")
        elif os.path.isdir(full_path):
            for root, dirs, files in os.walk(full_path):
                dirs[:] = [d for d in dirs if d not in ignore_dirs]
                for file in files:
                    if any(file.endswith(ext) for ext in ignore_exts):
                        continue
                    file_full = os.path.join(root, file)
                    arcname = os.path.relpath(file_full, script_dir)
                    zf.write(file_full, arcname=arcname)
                    print(f"  + {arcname}")

size_kb = os.path.getsize(output_zip) / 1024
print(f"✅ Package created successfully: {output_zip} ({size_kb:.1f} KB)")
print("🚀 You can attach this zip file to your GitHub Releases page!")
EOF
