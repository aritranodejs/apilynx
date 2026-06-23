#!/usr/bin/env python3
"""Generate Apilynx app icons for Electron (PNG, ICO) and favicon."""

from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
BUILD = ROOT / "build"
PUBLIC = ROOT / "public"

BG = (24, 24, 27)  # zinc-900
ORANGE = (249, 115, 22)  # orange-500
ORANGE_LIGHT = (251, 146, 60)


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGBA", (size, size), BG + (255,))
    d = ImageDraw.Draw(img)
    pad = size * 0.12
    cx, cy = size / 2, size / 2

    # Rounded square frame
    r = size * 0.18
    d.rounded_rectangle(
        (pad, pad, size - pad, size - pad),
        radius=r,
        outline=ORANGE,
        width=max(2, size // 64),
    )

    # Stylized "A" / lynx bolt
    s = size * 0.34
    top = (cx, cy - s * 0.95)
    left = (cx - s * 0.72, cy + s * 0.85)
    right = (cx + s * 0.72, cy + s * 0.85)
    mid_l = (cx - s * 0.28, cy + s * 0.05)
    mid_r = (cx + s * 0.28, cy + s * 0.05)
    cross_l = (cx - s * 0.42, cy + s * 0.38)
    cross_r = (cx + s * 0.42, cy + s * 0.38)

    d.polygon([top, left, right], fill=ORANGE)
    d.polygon([mid_l, mid_r, cross_r, cross_l], fill=BG + (255,))

    # Lightning accent
    bolt = [
        (cx + s * 0.08, cy - s * 0.15),
        (cx + s * 0.38, cy - s * 0.15),
        (cx + s * 0.12, cy + s * 0.22),
        (cx + s * 0.32, cy + s * 0.22),
        (cx - s * 0.05, cy + s * 0.62),
        (cx + s * 0.08, cy + s * 0.18),
        (cx - s * 0.12, cy + s * 0.18),
    ]
    d.polygon(bolt, fill=ORANGE_LIGHT)

    return img


def main() -> None:
    BUILD.mkdir(parents=True, exist_ok=True)
    PUBLIC.mkdir(parents=True, exist_ok=True)

    sizes = [16, 32, 48, 64, 128, 256, 512, 1024]
    images: dict[int, Image.Image] = {}

    for sz in sizes:
        images[sz] = draw_icon(sz)

    images[512].save(BUILD / "icon.png", "PNG")
    images[1024].save(BUILD / "icon@2x.png", "PNG")
    images[256].save(PUBLIC / "icon.png", "PNG")
    images[32].save(PUBLIC / "favicon.ico", format="ICO", sizes=[(32, 32)])

    # Windows .ico with multiple sizes
    images[256].save(
        BUILD / "icon.ico",
        format="ICO",
        sizes=[(16, 16), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)],
    )

    print("Generated:", BUILD / "icon.png", BUILD / "icon.ico", PUBLIC / "favicon.ico")


if __name__ == "__main__":
    main()
