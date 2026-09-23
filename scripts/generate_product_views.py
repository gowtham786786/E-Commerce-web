import os
import sys
import json
import urllib.request
from PIL import Image

def process_product(img_url, out_dir):
    """
    Downloads a product packshot and generates 4 distinct photographic views:
    view-1.webp: Full balanced packshot on clean white studio background
    view-2.webp: Focal detail / top-end zoom (applicator, dial, wand, collar, head)
    view-3.webp: Core body & branding / texture zoom (center body, label, stitching)
    view-4.webp: Base / angle / packaging detail
    """
    norm = out_dir.replace('\\', '/')
    idx = norm.find('/images/products/')
    if idx != -1:
        rel_dir = norm[idx:]
    else:
        rel_dir = norm.replace('public/', '').replace('public', '')
    if not rel_dir.startswith('/'):
        rel_dir = '/' + rel_dir

    os.makedirs(out_dir, exist_ok=True)
    temp_path = os.path.join(out_dir, "temp_source.png")
    
    # Download source image
    try:
        req = urllib.request.Request(img_url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=15) as resp:
            with open(temp_path, 'wb') as f:
                f.write(resp.read())
    except Exception as e:
        print(f"Error downloading {img_url}: {e}", file=sys.stderr)
        return None

    try:
        raw = Image.open(temp_path).convert('RGBA')
        w, h = raw.size

        # Create clean white background for transparency
        bg_white = Image.new('RGBA', (w, h), (255, 255, 255, 255))
        img = Image.alpha_composite(bg_white, raw).convert('RGB')

        # View 1: Full balanced packshot centered in an 800x800 square canvas
        max_dim = int(max(w, h) * 1.1)
        canvas1 = Image.new('RGB', (max_dim, max_dim), (255, 255, 255))
        px1 = (max_dim - w) // 2
        py1 = (max_dim - h) // 2
        canvas1.paste(img, (px1, py1))
        canvas1 = canvas1.resize((800, 800), Image.Resampling.LANCZOS)
        out1 = os.path.join(out_dir, "view-1.webp")
        canvas1.save(out1, 'WEBP', quality=88)

        # View 2: Focal detail (top-to-upper-center 50%)
        top_crop = img.crop((int(w * 0.1), int(h * 0.02), int(w * 0.9), int(h * 0.55)))
        tw, th = top_crop.size
        tmax = int(max(tw, th) * 1.1)
        canvas2 = Image.new('RGB', (tmax, tmax), (255, 255, 255))
        canvas2.paste(top_crop, ((tmax - tw) // 2, (tmax - th) // 2))
        canvas2 = canvas2.resize((800, 800), Image.Resampling.LANCZOS)
        out2 = os.path.join(out_dir, "view-2.webp")
        canvas2.save(out2, 'WEBP', quality=88)

        # View 3: Core branding / texture (center 55%)
        center_crop = img.crop((int(w * 0.1), int(h * 0.25), int(w * 0.9), int(h * 0.80)))
        cw, ch = center_crop.size
        cmax = int(max(cw, ch) * 1.1)
        canvas3 = Image.new('RGB', (cmax, cmax), (255, 255, 255))
        canvas3.paste(center_crop, ((cmax - cw) // 2, (cmax - ch) // 2))
        canvas3 = canvas3.resize((800, 800), Image.Resampling.LANCZOS)
        out3 = os.path.join(out_dir, "view-3.webp")
        canvas3.save(out3, 'WEBP', quality=88)

        # View 4: Base / packaging / lower half angle
        bottom_crop = img.crop((int(w * 0.1), int(h * 0.45), int(w * 0.9), int(h * 0.98)))
        bw, bh = bottom_crop.size
        bmax = int(max(bw, bh) * 1.1)
        canvas4 = Image.new('RGB', (bmax, bmax), (255, 255, 255))
        canvas4.paste(bottom_crop, ((bmax - bw) // 2, (bmax - bh) // 2))
        canvas4 = canvas4.resize((800, 800), Image.Resampling.LANCZOS)
        out4 = os.path.join(out_dir, "view-4.webp")
        canvas4.save(out4, 'WEBP', quality=88)

        if os.path.exists(temp_path):
            os.remove(temp_path)

        # Convert backslashes for web paths
        rel_dir = out_dir.replace('\\', '/').replace('public/', '').replace('public', '')
        if not rel_dir.startswith('/'):
            rel_dir = '/' + rel_dir

        return [
            f"{rel_dir}/view-1.webp",
            f"{rel_dir}/view-2.webp",
            f"{rel_dir}/view-3.webp",
            f"{rel_dir}/view-4.webp"
        ]
    except Exception as e:
        print(f"Error processing {img_url}: {e}", file=sys.stderr)
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return None

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python generate_product_views.py <image_url> <output_dir>")
        sys.exit(1)
    url = sys.argv[1]
    out = sys.argv[2]
    views = process_product(url, out)
    if views:
        print(json.dumps(views))
    else:
        sys.exit(1)
