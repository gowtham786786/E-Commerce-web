import cv2
import numpy as np
import os
import sys

if len(sys.argv) < 2:
    print("Usage: python crop_collage.py <image_path>")
    sys.exit(1)

img_path = sys.argv[1]
if not os.path.exists(img_path):
    print("File not found:", img_path)
    sys.exit(1)

output_dir = os.path.dirname(img_path)

img = cv2.imread(img_path)
if img is None:
    print("Could not load image")
    sys.exit(1)

h, w = img.shape[:2]
gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
_, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)

contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

bboxes = []
min_area = (h * w) * 0.02

for cnt in contours:
    x, y, bw, bh = cv2.boundingRect(cnt)
    if bw * bh > min_area:
        bboxes.append((x, y, bw, bh))

print(f"Found {len(bboxes)} bounding boxes")

if len(bboxes) == 5:
    row1 = [b for b in bboxes if b[1] + b[3]/2 < h/2]
    row2 = [b for b in bboxes if b[1] + b[3]/2 >= h/2]
    row1.sort(key=lambda b: b[0])
    row2.sort(key=lambda b: b[0])
    bboxes = row1 + row2
else:
    print("Warning: Did not find exactly 5 images. Falling back to hardcoded grid.")
    bboxes = [
        (0, 0, w//3, h//2),
        (w//3, 0, int(w*0.66), h//2),
        (0, h//2, w//3, h//2),
        (w//3, h//2, w//3, h//2),
        (int(w*0.66), h//2, w//3, h//2)
    ]

for i, (x, y, bw, bh) in enumerate(bboxes[:5]):
    pad = 15
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(w, x + bw + pad)
    y2 = min(h, y + bh + pad)
    
    crop = img[y1:y2, x1:x2]
    out_path = os.path.join(output_dir, f"{i+1}.png")
    cv2.imwrite(out_path, crop)
    print(f"Saved {out_path}")

try:
    os.remove(img_path)
    print("Deleted original collage")
except:
    pass

print("Done")
