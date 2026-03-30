#!/usr/bin/env python3
"""
Generate a slideshow-style informational video:
  "Best First Aid Kits for Kids (2026)"

Output: public/videos/best-first-aid-kits-kids-demo.mp4
Resolution: 1280x720 @ 24 fps
"""

import os, shutil, subprocess, math
from PIL import Image, ImageDraw, ImageFont

# ── Paths ──────────────────────────────────────────────────────────────
BASE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(BASE, "public", "videos")
FRAME_DIR = os.path.join(BASE, "scripts", "_frames_tmp")
OUTPUT = os.path.join(OUT_DIR, "best-first-aid-kits-kids-demo.mp4")

os.makedirs(OUT_DIR, exist_ok=True)
os.makedirs(FRAME_DIR, exist_ok=True)

# ── Design tokens ──────────────────────────────────────────────────────
W, H = 1280, 720
FPS = 24
SLIDE_SEC = 3.5          # seconds per slide (visible)
FADE_FRAMES = 8          # frames for cross-fade transition

TEAL      = (13, 148, 136)
CORAL     = (239, 68, 68)
WARM_WH   = (254, 252, 232)
DARK      = (30, 30, 30)
LIGHT_TEAL = (204, 251, 241)
SOFT_CORAL = (254, 202, 202)
WHITE     = (255, 255, 255)
GOLD      = (234, 179, 8)

# ── Fonts ──────────────────────────────────────────────────────────────
FONT_BOLD  = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"
FONT_REG   = "/System/Library/Fonts/Supplemental/Arial.ttf"
FONT_ROUND = "/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"

def font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except Exception:
        return ImageFont.load_default()

# ── Drawing helpers ────────────────────────────────────────────────────

def draw_rounded_rect(draw, xy, radius, fill):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    r = radius
    # Four corners
    draw.ellipse([x0, y0, x0+2*r, y0+2*r], fill=fill)
    draw.ellipse([x1-2*r, y0, x1, y0+2*r], fill=fill)
    draw.ellipse([x0, y1-2*r, x0+2*r, y1], fill=fill)
    draw.ellipse([x1-2*r, y1-2*r, x1, y1], fill=fill)
    # Rectangles to fill gaps
    draw.rectangle([x0+r, y0, x1-r, y1], fill=fill)
    draw.rectangle([x0, y0+r, x1, y1-r], fill=fill)

def centered_text(draw, y, text, f, fill):
    bbox = draw.textbbox((0, 0), text, font=f)
    tw = bbox[2] - bbox[0]
    draw.text(((W - tw) // 2, y), text, font=f, fill=fill)

def draw_bullet(draw, x, y, text, f, fill, bullet_color=None):
    bc = bullet_color or fill
    draw.ellipse([x, y + 8, x + 14, y + 22], fill=bc)
    draw.text((x + 26, y), text, font=f, fill=fill)

def draw_icon_circle(draw, cx, cy, r, fill, icon_text, f, text_fill):
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=fill)
    bbox = draw.textbbox((0, 0), icon_text, font=f)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    draw.text((cx - tw // 2, cy - th // 2 - 2), icon_text, font=f, fill=text_fill)

def draw_stripe_accent(draw, y, color, width=W, height=6):
    draw.rectangle([0, y, width, y + height], fill=color)

def new_slide(bg_color):
    img = Image.new("RGB", (W, H), bg_color)
    return img, ImageDraw.Draw(img)

def draw_footer(draw, color=TEAL):
    draw.rectangle([0, H - 36, W, H], fill=color)
    f_sm = font(FONT_REG, 14)
    centered_text(draw, H - 28, "firstaidkitspot.com  |  Nurse Amy Brooks, Pediatric Emergency Specialist", f_sm, WARM_WH)

# ── Slide builders ─────────────────────────────────────────────────────

def slide_title():
    img, d = new_slide(TEAL)
    # Decorative cross
    cx, cy = W // 2, 170
    arm_w, arm_h = 50, 140
    d.rectangle([cx - arm_w//2, cy - arm_h//2, cx + arm_w//2, cy + arm_h//2], fill=WHITE)
    d.rectangle([cx - arm_h//2, cy - arm_w//2, cx + arm_h//2, cy + arm_w//2], fill=WHITE)
    # Inner cross (coral)
    iw, ih = 30, 100
    d.rectangle([cx - iw//2, cy - ih//2, cx + iw//2, cy + ih//2], fill=CORAL)
    d.rectangle([cx - ih//2, cy - iw//2, cx + ih//2, cy + iw//2], fill=CORAL)

    f_title = font(FONT_ROUND, 52)
    f_sub = font(FONT_REG, 28)
    f_year = font(FONT_BOLD, 22)

    centered_text(d, 280, "Best First Aid Kits", f_title, WARM_WH)
    centered_text(d, 345, "for Kids", f_title, WARM_WH)

    # Year badge
    draw_rounded_rect(d, (W//2 - 60, 415, W//2 + 60, 453), 16, CORAL)
    centered_text(d, 420, "2026", f_year, WHITE)

    draw_stripe_accent(d, 475, GOLD, height=4)
    centered_text(d, 500, "Pediatric Emergency Guide", f_sub, LIGHT_TEAL)

    # Small decorative dots
    for i in range(5):
        x = W // 2 - 80 + i * 40
        d.ellipse([x, 560, x + 10, 570], fill=SOFT_CORAL)

    draw_footer(d, DARK)
    return img


def slide_why_own_kit():
    img, d = new_slide(WARM_WH)
    draw_stripe_accent(d, 0, TEAL, height=8)

    f_head = font(FONT_ROUND, 40)
    f_body = font(FONT_REG, 24)
    f_icon = font(FONT_BOLD, 28)

    centered_text(d, 50, "Why Kids Need Their Own Kit", f_head, TEAL)
    draw_stripe_accent(d, 110, CORAL, width=200, height=4)
    # center the short stripe
    d.rectangle([W//2 - 100, 110, W//2 + 100, 114], fill=CORAL)

    bullets = [
        ("Pediatric Dosing", "Medications pre-measured for children's\nweight and age — no guessing in a crisis"),
        ("Child-Sized Supplies", "Smaller bandages, splints, and wraps\ndesigned to fit little bodies properly"),
        ("Kid-Specific Items", "Cartoon stickers, fun colors, and distraction\ntools that reduce fear during treatment"),
    ]
    icons = ["Rx", "S", "★"]
    colors = [TEAL, CORAL, GOLD]

    y = 155
    for i, (title, desc) in enumerate(bullets):
        # icon circle
        draw_icon_circle(d, 120, y + 42, 32, colors[i], icons[i], f_icon, WHITE)
        d.text((175, y + 5), title, font=font(FONT_BOLD, 26), fill=DARK)
        d.text((175, y + 40), desc, font=font(FONT_REG, 19), fill=(80, 80, 80))
        y += 155

    draw_footer(d)
    return img


def slide_top_picks():
    img, d = new_slide(TEAL)
    f_head = font(FONT_ROUND, 40)
    f_name = font(FONT_BOLD, 26)
    f_desc = font(FONT_REG, 19)
    f_num  = font(FONT_BOLD, 36)

    centered_text(d, 40, "Top 3 Picks for 2026", f_head, WARM_WH)
    draw_stripe_accent(d, 100, GOLD, height=4)

    picks = [
        ("Welly Bravery Badge Kit", "Fun designs kids love — colorful\nbandages & stickers included", CORAL),
        ("J&J Red Cross Kids Kit", "Trusted brand with 70+ pediatric\nitems, great all-around choice", WHITE),
        ("Adventure Medical Family", "Durable outdoor kit, perfect for\nactive families & travel", LIGHT_TEAL),
    ]

    y = 135
    card_h = 155
    for i, (name, desc, accent) in enumerate(picks):
        # Card background
        draw_rounded_rect(d, (100, y, W - 100, y + card_h), 14, (20, 120, 110))
        # Number badge
        draw_icon_circle(d, 155, y + card_h // 2, 30, accent, str(i + 1), f_num, DARK if accent != WHITE else TEAL)
        d.text((210, y + 25), name, font=f_name, fill=WARM_WH)
        d.text((210, y + 65), desc, font=f_desc, fill=LIGHT_TEAL)
        y += card_h + 20

    draw_footer(d, DARK)
    return img


def slide_essential_contents():
    img, d = new_slide(WARM_WH)
    draw_stripe_accent(d, 0, CORAL, height=8)

    f_head = font(FONT_ROUND, 40)
    f_item = font(FONT_BOLD, 22)
    f_icon = font(FONT_BOLD, 30)

    centered_text(d, 45, "Essential Kit Contents", f_head, CORAL)
    d.rectangle([W//2 - 100, 105, W//2 + 100, 109], fill=TEAL)

    items = [
        ("+", "Adhesive\nBandages", TEAL),
        ("Rx", "Children's\nMedications", CORAL),
        ("T", "Digital\nThermometer", GOLD),
        ("G", "Nitrile\nGloves", (100, 116, 139)),
        ("✂", "Safety\nScissors", TEAL),
        ("◎", "Antiseptic\nWipes", CORAL),
        ("△", "Triangular\nBandage", GOLD),
        ("❄", "Instant\nCold Pack", (100, 116, 139)),
    ]

    cols, rows = 4, 2
    cell_w, cell_h = 250, 220
    start_x = (W - cols * cell_w) // 2 + 30
    start_y = 140

    for idx, (icon, label, color) in enumerate(items):
        col = idx % cols
        row = idx // cols
        cx = start_x + col * cell_w + cell_w // 2 - 30
        cy = start_y + row * cell_h + 50
        draw_icon_circle(d, cx, cy, 40, color, icon, f_icon, WHITE)
        # Label centered below circle
        lines = label.split("\n")
        for li, line in enumerate(lines):
            bbox = d.textbbox((0, 0), line, font=f_item)
            tw = bbox[2] - bbox[0]
            d.text((cx - tw // 2, cy + 50 + li * 28), line, font=f_item, fill=DARK)

    draw_footer(d)
    return img


def slide_age_guide():
    img, d = new_slide(TEAL)
    f_head = font(FONT_ROUND, 40)
    f_age  = font(FONT_BOLD, 24)
    f_desc = font(FONT_REG, 18)
    f_icon = font(FONT_BOLD, 32)

    centered_text(d, 40, "Age-by-Age Guide", f_head, WARM_WH)
    draw_stripe_accent(d, 100, GOLD, height=4)

    stages = [
        ("0-1", "Infant", "Nasal aspirator, infant\ntylenol, rectal thermometer", CORAL),
        ("1-4", "Toddler", "Boo-boo packs, liquid meds,\npoison control number", SOFT_CORAL),
        ("5-11", "School-Age", "Standard bandages, tweezers,\nallergy meds, ice packs", LIGHT_TEAL),
        ("12+", "Teen", "Sports wraps, larger splints,\nOTC pain relievers", WHITE),
    ]

    card_w = 240
    total_w = 4 * card_w + 3 * 20
    sx = (W - total_w) // 2

    for i, (age, label, desc, accent) in enumerate(stages):
        x = sx + i * (card_w + 20)
        y = 140
        # Card bg
        draw_rounded_rect(d, (x, y, x + card_w, y + 470), 14, (20, 120, 110))
        # Age circle at top
        draw_icon_circle(d, x + card_w // 2, y + 60, 45, accent, age, f_icon, DARK)
        # Label
        bbox = d.textbbox((0, 0), label, font=f_age)
        tw = bbox[2] - bbox[0]
        d.text((x + (card_w - tw) // 2, y + 125), label, font=f_age, fill=WARM_WH)
        # Separator line
        d.rectangle([x + 30, y + 165, x + card_w - 30, y + 167], fill=accent)
        # Description
        d.text((x + 25, y + 185), desc, font=f_desc, fill=LIGHT_TEAL)

    draw_footer(d, DARK)
    return img


def slide_common_injuries():
    img, d = new_slide(WARM_WH)
    draw_stripe_accent(d, 0, TEAL, height=8)

    f_head = font(FONT_ROUND, 40)
    f_num  = font(FONT_BOLD, 44)
    f_name = font(FONT_BOLD, 28)
    f_tip  = font(FONT_REG, 18)

    centered_text(d, 45, "5 Most Common Injuries", f_head, TEAL)
    d.rectangle([W//2 - 100, 105, W//2 + 100, 109], fill=CORAL)

    injuries = [
        ("Cuts &\nScrapes", "Clean, apply antibiotic\nointment, bandage", TEAL),
        ("Minor\nBurns", "Cool water 10 min,\naloe vera, loose wrap", CORAL),
        ("Bumps &\nBruises", "Ice pack 20 min on,\n20 min off, elevate", GOLD),
        ("Insect\nStings", "Remove stinger, ice,\nantihistamine if needed", (100, 116, 139)),
        ("Fevers", "Age-appropriate dose,\ncool cloth, hydrate", TEAL),
    ]

    card_w = 210
    total_w = 5 * card_w + 4 * 15
    sx = (W - total_w) // 2

    for i, (name, tip, color) in enumerate(injuries):
        x = sx + i * (card_w + 15)
        y = 140
        draw_rounded_rect(d, (x, y, x + card_w, y + 490), 12, (245, 245, 240))
        # Number
        draw_icon_circle(d, x + card_w // 2, y + 55, 38, color, str(i + 1), f_num, WHITE)
        # Name
        lines = name.split("\n")
        for li, line in enumerate(lines):
            bbox = d.textbbox((0, 0), line, font=f_name)
            tw = bbox[2] - bbox[0]
            d.text((x + (card_w - tw) // 2, y + 115 + li * 34), line, font=f_name, fill=DARK)
        # Separator
        d.rectangle([x + 25, y + 200, x + card_w - 25, y + 202], fill=color)
        # Tip
        d.text((x + 18, y + 220), tip, font=f_tip, fill=(80, 80, 80))

    draw_footer(d)
    return img


def slide_end():
    img, d = new_slide(TEAL)

    f_cta   = font(FONT_ROUND, 48)
    f_url   = font(FONT_BOLD, 36)
    f_nurse = font(FONT_REG, 22)
    f_icon  = font(FONT_BOLD, 28)

    # Decorative cross (top)
    cx, cy = W // 2, 130
    arm_w, arm_h = 40, 110
    d.rectangle([cx - arm_w//2, cy - arm_h//2, cx + arm_w//2, cy + arm_h//2], fill=CORAL)
    d.rectangle([cx - arm_h//2, cy - arm_w//2, cx + arm_h//2, cy + arm_w//2], fill=CORAL)

    centered_text(d, 220, "Find Your Perfect Kit", f_cta, WARM_WH)
    draw_stripe_accent(d, 290, GOLD, height=4)

    # URL in a rounded badge
    draw_rounded_rect(d, (W//2 - 260, 325, W//2 + 260, 395), 20, CORAL)
    centered_text(d, 338, "firstaidkitspot.com", f_url, WHITE)

    centered_text(d, 430, "Reviewed & Approved by", f_nurse, LIGHT_TEAL)
    centered_text(d, 465, "Nurse Amy Brooks", font(FONT_BOLD, 28), WARM_WH)
    centered_text(d, 505, "Pediatric Emergency Specialist", f_nurse, LIGHT_TEAL)

    # Decorative dots
    for i in range(7):
        x = W // 2 - 120 + i * 40
        d.ellipse([x, 565, x + 10, 575], fill=SOFT_CORAL)

    draw_footer(d, DARK)
    return img


# ── Build all slides ───────────────────────────────────────────────────
print("Generating slides...")
slides = [
    slide_title(),
    slide_why_own_kit(),
    slide_top_picks(),
    slide_essential_contents(),
    slide_age_guide(),
    slide_common_injuries(),
    slide_end(),
]

# ── Render frames with cross-fade transitions ─────────────────────────
print("Rendering frames...")
frame_num = 0
frames_per_slide = int(SLIDE_SEC * FPS)

for si, slide in enumerate(slides):
    # Hold frames for this slide
    for f in range(frames_per_slide):
        # Fade in from black for first slide
        if si == 0 and f < FADE_FRAMES:
            alpha = f / FADE_FRAMES
            frame = Image.blend(Image.new("RGB", (W, H), DARK), slide, alpha)
        # Cross-fade from previous slide
        elif si > 0 and f < FADE_FRAMES:
            alpha = f / FADE_FRAMES
            frame = Image.blend(slides[si - 1], slide, alpha)
        # Fade out to black for last slide
        elif si == len(slides) - 1 and f >= frames_per_slide - FADE_FRAMES:
            alpha = (frames_per_slide - 1 - f) / FADE_FRAMES
            frame = Image.blend(Image.new("RGB", (W, H), DARK), slide, alpha)
        else:
            frame = slide

        frame.save(os.path.join(FRAME_DIR, f"frame_{frame_num:05d}.png"))
        frame_num += 1

print(f"Generated {frame_num} frames")

# ── Encode with ffmpeg ─────────────────────────────────────────────────
print("Encoding video with ffmpeg...")
cmd = [
    "ffmpeg", "-y",
    "-framerate", str(FPS),
    "-i", os.path.join(FRAME_DIR, "frame_%05d.png"),
    "-c:v", "libx264",
    "-pix_fmt", "yuv420p",
    "-preset", "medium",
    "-crf", "23",
    "-movflags", "+faststart",
    OUTPUT
]
subprocess.run(cmd, check=True, capture_output=True)

# ── Cleanup ────────────────────────────────────────────────────────────
print("Cleaning up temporary frames...")
shutil.rmtree(FRAME_DIR)

# Verify
size_mb = os.path.getsize(OUTPUT) / (1024 * 1024)
print(f"Done! Video saved to: {OUTPUT}")
print(f"File size: {size_mb:.2f} MB")
print(f"Duration: {frame_num / FPS:.1f}s @ {FPS} fps")
