"""Copies trailer frames, optionally cropping (a camera push-in on real footage).
Usage: python3 tools/trailer/frames.py <plan.json>  — [{src, dst, crop: [x, y, w, h] | null}]
"""
import json, sys
from PIL import Image

W, H = 1080, 1920
for it in json.load(open(sys.argv[1])):
    im = Image.open(it['src'])
    if it.get('crop'):
        x, y, w, h = it['crop']
        im = im.crop((round(x), round(y), round(x + w), round(y + h))).resize((W, H), Image.LANCZOS)
    elif im.size != (W, H):
        im = im.resize((W, H), Image.LANCZOS)
    im.save(it['dst'], quality=93)
