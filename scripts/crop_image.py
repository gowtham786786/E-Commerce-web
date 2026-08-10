import cv2
import os

img_path = r"C:\Users\Admin\OneDrive\Desktop\CERTIFICATES\project\ecommance-web-main\E-Commerce-web\public\images\products\Electronics\Luminous 850VA Inverter\original.png"
output_dir = r"C:\Users\Admin\OneDrive\Desktop\CERTIFICATES\project\ecommance-web-main\E-Commerce-web\public\images\products\Electronics\Luminous 850VA Inverter"

image = cv2.imread(img_path)
if image is None:
    print("Could not read image")
    exit(1)

h, w, _ = image.shape
print(f"Image shape: {w}x{h}")

# The image has 3 items in the top row, and 2 items in the bottom row.
# Let's crop them based on fixed regions.
# We will do some basic trimming of white borders to make them look nice.

def trim_white_border(img):
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, thresh = cv2.threshold(gray, 240, 255, cv2.THRESH_BINARY_INV)
    coords = cv2.findNonZero(thresh)
    if coords is None:
        return img
    x, y, w, h = cv2.boundingRect(coords)
    # Add a little padding
    pad = 10
    x1 = max(0, x - pad)
    y1 = max(0, y - pad)
    x2 = min(img.shape[1], x + w + pad)
    y2 = min(img.shape[0], y + h + pad)
    return img[y1:y2, x1:x2]

crops = []
# Top row (3 items)
h_half = h // 2
w_third = w // 3
crops.append(image[0:h_half, 0:w_third]) # Front
crops.append(image[0:h_half, w_third:2*w_third]) # Right Side
crops.append(image[0:h_half, 2*w_third:w]) # Left Side

# Bottom row (2 items)
w_half = w // 2
crops.append(image[h_half:h, 0:w_half]) # Top View
crops.append(image[h_half:h, w_half:w]) # Back View

names = ["front_view.jpg", "right_side_view.jpg", "left_side_view.jpg", "top_view.jpg", "back_view.jpg"]

for i, crop in enumerate(crops):
    trimmed = trim_white_border(crop)
    out_path = os.path.join(output_dir, names[i])
    cv2.imwrite(out_path, trimmed)
    print(f"Saved {names[i]}")

print("Done cropping.")
