#!/usr/bin/env python3
"""Generate a kids first aid kit checklist infographic."""

from PIL import Image, ImageDraw, ImageFont
import os

# --- Config ---
WIDTH, HEIGHT = 800, 1000
BG = "#ffffff"
OUTPUT = "/Users/openclaw/.openclaw/workspace-philly/firstaid-site/public/images/articles/kids-first-aid-kit-checklist-infographic.jpg"

SECTIONS = [
    {
        "color": "#ef4444",
        "title": "Wound Care",
        "items": ["Adhesive bandages (assorted)", "Sterile gauze pads", "Antiseptic wipes", "Medical tape", "Antibiotic ointment", "Butterfly closure strips"],
    },
    {
        "color": "#3b82f6",
        "title": "Medications",
        "items": ["Pediatric acetaminophen", "Children's ibuprofen", "Diphenhydramine (antihistamine)", "Hydrocortisone cream 1%", "Burn relief gel", "ORS packets"],
    },
    {
        "color": "#10b981",
        "title": "Tools",
        "items": ["Digital thermometer", "Blunt-tip scissors", "Fine-point tweezers", "Nitrile gloves (S/M)", "Instant cold packs", "Penlight"],
    },
    {
        "color": "#f59e0b",
        "title": "Emergency",
        "items": ["Emergency contact card", "Pediatric dosing chart", "Pocket CPR mask", "Emergency blanket", "Safety whistle"],
    },
]


def hex_to_rgb(h):
    h = h.lstrip("#")
    return tuple(int(h[i : i + 2], 16) for i in (0, 2, 4))


def lighter(rgb, factor=0.88):
    """Return a light tinted version of the color for backgrounds."""
    return tuple(int(255 - (255 - c) * (1 - factor)) for c in rgb)


def draw_rounded_rect(draw, xy, radius, fill, outline=None, outline_width=0):
    """Draw a rounded rectangle."""
    x0, y0, x1, y1 = xy
    r = radius
    # Four corners
    draw.ellipse([x0, y0, x0 + 2 * r, y0 + 2 * r], fill=fill, outline=outline, width=outline_width)
    draw.ellipse([x1 - 2 * r, y0, x1, y0 + 2 * r], fill=fill, outline=outline, width=outline_width)
    draw.ellipse([x0, y1 - 2 * r, x0 + 2 * r, y1], fill=fill, outline=outline, width=outline_width)
    draw.ellipse([x1 - 2 * r, y1 - 2 * r, x1, y1], fill=fill, outline=outline, width=outline_width)
    # Rectangles to fill gaps
    draw.rectangle([x0 + r, y0, x1 - r, y1], fill=fill)
    draw.rectangle([x0, y0 + r, x1, y1 - r], fill=fill)
    # Outline arcs and lines
    if outline and outline_width:
        draw.arc([x0, y0, x0 + 2 * r, y0 + 2 * r], 180, 270, fill=outline, width=outline_width)
        draw.arc([x1 - 2 * r, y0, x1, y0 + 2 * r], 270, 360, fill=outline, width=outline_width)
        draw.arc([x0, y1 - 2 * r, x0 + 2 * r, y1], 90, 180, fill=outline, width=outline_width)
        draw.arc([x1 - 2 * r, y1 - 2 * r, x1, y1], 0, 90, fill=outline, width=outline_width)
        draw.line([x0 + r, y0, x1 - r, y0], fill=outline, width=outline_width)
        draw.line([x0 + r, y1, x1 - r, y1], fill=outline, width=outline_width)
        draw.line([x0, y0 + r, x0, y1 - r], fill=outline, width=outline_width)
        draw.line([x1, y0 + r, x1, y1 - r], fill=outline, width=outline_width)


def load_font(size, bold=False):
    """Try to load a nice font, fall back to default."""
    candidates_bold = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay-Bold.otf",
        "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    ]
    candidates_regular = [
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.otf",
        "/System/Library/Fonts/Supplemental/Arial.ttf",
    ]
    candidates = candidates_bold if bold else candidates_regular
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def main():
    img = Image.new("RGB", (WIDTH, HEIGHT), BG)
    draw = ImageDraw.Draw(img)

    # Fonts
    font_title = load_font(32, bold=True)
    font_subtitle = load_font(16)
    font_section = load_font(20, bold=True)
    font_item = load_font(15)
    font_check = load_font(14, bold=True)

    # --- Header area ---
    # Top accent bar
    draw.rectangle([0, 0, WIDTH, 6], fill="#1e293b")

    # Title
    title = "Complete Kids First Aid Kit Checklist 2026"
    bbox = draw.textbbox((0, 0), title, font=font_title)
    tw = bbox[2] - bbox[0]
    draw.text(((WIDTH - tw) / 2, 24), title, fill="#1e293b", font=font_title)

    # Subtitle
    subtitle = "firstaidkitspot.com"
    bbox = draw.textbbox((0, 0), subtitle, font=font_subtitle)
    sw = bbox[2] - bbox[0]
    draw.text(((WIDTH - sw) / 2, 64), subtitle, fill="#64748b", font=font_subtitle)

    # Thin divider line
    draw.line([60, 92, WIDTH - 60, 92], fill="#e2e8f0", width=2)

    # --- Sections ---
    margin_x = 30
    section_gap = 12
    y_cursor = 106
    col_width = (WIDTH - 2 * margin_x - section_gap) / 2

    positions = [
        (margin_x, y_cursor),
        (margin_x + col_width + section_gap, y_cursor),
        (margin_x, None),  # y set after row 1
        (margin_x + col_width + section_gap, None),
    ]

    # Calculate section heights
    def calc_section_height(section):
        header_h = 42
        item_h = 24
        padding = 16
        return header_h + len(section["items"]) * item_h + padding

    heights = [calc_section_height(s) for s in SECTIONS]
    row1_h = max(heights[0], heights[1])
    row2_h = max(heights[2], heights[3])

    # Update y for row 2
    row2_y = y_cursor + row1_h + section_gap
    positions[2] = (margin_x, row2_y)
    positions[3] = (margin_x + col_width + section_gap, row2_y)

    for i, section in enumerate(SECTIONS):
        x, y = positions[i]
        row_h = row1_h if i < 2 else row2_h
        rgb = hex_to_rgb(section["color"])
        bg_rgb = lighter(rgb, 0.90)
        bg_color = "rgb({},{},{})".format(*bg_rgb)
        accent = section["color"]

        # Rounded box background
        draw_rounded_rect(
            draw,
            (x, y, x + col_width, y + row_h),
            radius=14,
            fill=bg_color,
            outline=accent,
            outline_width=2,
        )

        # Section header bar
        draw_rounded_rect(
            draw,
            (x, y, x + col_width, y + 38),
            radius=14,
            fill=accent,
        )
        # Square off the bottom of the header so it meets the box cleanly
        draw.rectangle([x, y + 14, x + col_width, y + 38], fill=accent)

        # Section title text (white on colored header)
        icon_map = {
            "Wound Care": "\u2795",
            "Medications": "\U0001F48A",
            "Tools": "\U0001F527",
            "Emergency": "\u26A0\uFE0F",
        }
        section_label = f"  {section['title']}"
        bbox = draw.textbbox((0, 0), section_label, font=font_section)
        th = bbox[3] - bbox[1]
        draw.text((x + 14, y + (38 - th) / 2 - 2), section_label, fill="#ffffff", font=font_section)

        # Items
        item_y = y + 46
        for item in section["items"]:
            # Checkbox
            cx, cy = x + 18, item_y + 3
            box_size = 14
            draw_rounded_rect(draw, (cx, cy, cx + box_size, cy + box_size), radius=3, fill="#ffffff", outline=accent, outline_width=2)
            # Checkmark
            draw.line([cx + 3, cy + 7, cx + 6, cy + 11], fill=accent, width=2)
            draw.line([cx + 6, cy + 11, cx + 11, cy + 3], fill=accent, width=2)

            # Item text
            draw.text((x + 40, item_y), item, fill="#334155", font=font_item)
            item_y += 24

    # --- Footer ---
    footer_y = row2_y + row2_h + 18
    draw.line([60, footer_y, WIDTH - 60, footer_y], fill="#e2e8f0", width=2)

    # Tip box
    tip_y = footer_y + 12
    draw_rounded_rect(
        draw,
        (margin_x, tip_y, WIDTH - margin_x, tip_y + 70),
        radius=12,
        fill="#f0fdf4",
        outline="#86efac",
        outline_width=2,
    )
    tip_title = "Pro Tip"
    draw.text((margin_x + 16, tip_y + 8), tip_title, fill="#16a34a", font=load_font(16, bold=True))
    tip_text = "Check expiration dates every 6 months and replace used items\nimmediately. Store kit in a cool, dry place out of direct sunlight."
    draw.text((margin_x + 16, tip_y + 30), tip_text, fill="#334155", font=load_font(13))

    # Bottom branding bar
    bar_y = HEIGHT - 38
    draw.rectangle([0, bar_y, WIDTH, HEIGHT], fill="#1e293b")
    brand = "firstaidkitspot.com  |  Your trusted first aid resource"
    bbox = draw.textbbox((0, 0), brand, font=font_subtitle)
    bw = bbox[2] - bbox[0]
    draw.text(((WIDTH - bw) / 2, bar_y + 10), brand, fill="#94a3b8", font=font_subtitle)

    # Save
    img.save(OUTPUT, "JPEG", quality=92)
    print(f"Saved infographic to {OUTPUT}")
    print(f"Size: {img.size}")


if __name__ == "__main__":
    main()
