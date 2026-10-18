"""Store screenshots (1080x1920): a short caption over a real captured game frame.
Usage: python3 tools/release/screens.py   (frames picked in SHOTS from .cache/takes)
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = 'out/release/screenshots'
FONT = {'ko': 'art/fonts/Jua-Regular.ttf', 'en': 'art/fonts/Fredoka-SemiBold.ttf'}
# (file, take frame, caption) — frames are 1080x1920 captures of real play
SHOTS = {
    'ko': [('01-wash', 'first/00369', '멈추면 물줄기 발사!\n끈적이를 시원하게 씻어요'),
           ('02-rescue', 'first/00792', '갇힌 동물을 구하면\n졸졸 따라와요'),
           ('03-boss', 'boss/02640', '물총을 키워서\n대장 끈적이까지!'),
           ('04-shelter', 'shelter/00120', '구한 친구들이 뛰노는\n나만의 보호소')],
    'en': [('01-wash', 'firstEn/00369', 'Stop to spray!\nWash the goo away'),
           ('02-rescue', 'firstEn/00792', 'Free trapped animals\nand they follow you'),
           ('03-boss', 'bossEn/02640', 'Grow your water gun\nand wash the boss away'),
           ('04-shelter', 'shelterEn/00120', 'A shelter full of\nthe friends you saved')],
}
W, H, CAP = 1080, 1920, 360


def compose(frame, caption, lang, dst):
    bg = Image.new('RGB', (W, H))
    d = ImageDraw.Draw(bg)
    for y in range(H):  # sky gradient
        k = y / H
        d.line([(0, y), (W, y)], fill=(int(92 + 120 * k), int(196 + 45 * k), 255))
    shot = Image.open(frame).convert('RGB')
    s = (H - CAP - 40) / shot.height
    sw, sh = int(shot.width * s), int(shot.height * s)
    shot = shot.resize((sw, sh), Image.LANCZOS)
    x, y = (W - sw) // 2, CAP
    mask = Image.new('L', (sw, sh), 0); ImageDraw.Draw(mask).rounded_rectangle([0, 0, sw - 1, sh - 1], 44, fill=255)
    shadow = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(shadow).rounded_rectangle([x - 6, y + 4, x + sw + 6, y + sh + 14], 50, fill=(30, 40, 80, 110))
    bg.paste(shadow.filter(ImageFilter.GaussianBlur(12)), (0, 0), shadow.filter(ImageFilter.GaussianBlur(12)))
    border = Image.new('RGB', (sw + 16, sh + 16), (58, 36, 22)); bm = Image.new('L', border.size, 0); ImageDraw.Draw(bm).rounded_rectangle([0, 0, sw + 15, sh + 15], 52, fill=255)
    bg.paste(border, (x - 8, y - 8), bm)
    bg.paste(shot, (x, y), mask)
    font = ImageFont.truetype(FONT[lang], 84 if lang == 'ko' else 76)
    lines = caption.split('\n')
    lh = 104
    top = (CAP - lh * len(lines)) // 2 + 6
    for i, line in enumerate(lines):
        tw = d.textlength(line, font=font)
        tx, ty = (W - tw) / 2, top + i * lh
        d.text((tx, ty + 8), line, font=font, fill=(30, 60, 120), stroke_width=10, stroke_fill=(30, 60, 120))
        d.text((tx, ty), line, font=font, fill=(255, 255, 255), stroke_width=10, stroke_fill=(42, 98, 184))
        assert tw < W - 60, f'caption too wide: {line}'
    bg.save(dst, optimize=True)


os.makedirs(OUT, exist_ok=True)
for f in os.listdir(OUT):
    os.remove(os.path.join(OUT, f))
for lang, shots in SHOTS.items():
    for name, frame, cap in shots:
        compose(f'.cache/takes/{frame}.jpg', cap, lang, f'{OUT}/{lang}-{name}.png')
print('screenshots:', sorted(os.listdir(OUT)))
