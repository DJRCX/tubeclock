#!/usr/bin/env python3
import os
import math
from PIL import Image, ImageDraw

def create_icon(size):
    # High-resolution rendering (4x super-sampling) for ultra-sharp edges
    scale = 4
    canvas_size = size * scale
    img = Image.new("RGBA", (canvas_size, canvas_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)

    # Outer rounded square with YouTube red accent
    radius = int(canvas_size * 0.24)
    # Gradient or solid sleek dark/red background
    # Background: modern deep dark with vibrant red accent
    draw.rounded_rectangle(
        [0, 0, canvas_size - 1, canvas_size - 1],
        radius=radius,
        fill="#FF0000"  # YouTube Red
    )

    # Inner circular clock face (Dark contrast)
    pad = int(canvas_size * 0.16)
    draw.ellipse(
        [pad, pad, canvas_size - pad, canvas_size - pad],
        fill="#0F0F0F"  # YouTube dark mode background
    )

    # Clock center coordinates
    center = canvas_size / 2
    clock_radius = (canvas_size - 2 * pad) / 2

    # Hour hand (pointing ~ 10 o'clock)
    hour_angle = math.radians(300)
    hour_len = clock_radius * 0.52
    hx = center + hour_len * math.sin(hour_angle)
    hy = center - hour_len * math.cos(hour_angle)
    draw.line([center, center, hx, hy], fill="#FFFFFF", width=max(2, int(scale * size * 0.07)), joint="round")

    # Minute hand (pointing ~ 2 o'clock, 10:10 style)
    min_angle = math.radians(60)
    min_len = clock_radius * 0.72
    mx = center + min_len * math.sin(min_angle)
    my = center - min_len * math.cos(min_angle)
    draw.line([center, center, mx, my], fill="#FF4E45", width=max(2, int(scale * size * 0.05)), joint="round")

    # Center pin
    pin_radius = max(1, int(canvas_size * 0.05))
    draw.ellipse(
        [center - pin_radius, center - pin_radius, center + pin_radius, center + pin_radius],
        fill="#FFFFFF"
    )

    # Downsample with Lanczos filter for crisp anti-aliasing
    final_img = img.resize((size, size), Image.Resampling.LANCZOS)
    return final_img

def main():
    icons_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icons")
    os.makedirs(icons_dir, exist_ok=True)

    sizes = [16, 48, 128]
    for s in sizes:
        icon = create_icon(s)
        path = os.path.join(icons_dir, f"icon-{s}.png")
        icon.save(path, "PNG")
        print(f"Generated {path} ({s}x{s})")

if __name__ == "__main__":
    main()
