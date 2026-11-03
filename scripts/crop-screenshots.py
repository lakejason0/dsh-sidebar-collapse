"""Crop the two screenshots in `docs/` from the original full-window captures.

The workspace/session rows below the sidebar's workspace header are
intentionally cut away: they carry the maintainer's own workspace and session
titles ("DS Bot", "知鱼", "Chief", ...), which do not belong in a public README.

Usage: edit the two source paths, then run with the bundled Python
(python + Pillow are provided by the harness runtime).
"""

import os

from PIL import Image

SRC_EXPANDED = r"C:\Users\Lakeus\.dsh\attachments\v1\objects\be\be8301937d444f81634e92c42b5807ee9a34a604ba2f144e2dae681e45d89221"
SRC_FOLDED = r"C:\Users\Lakeus\.dsh\attachments\v1\objects\9f\9f5d9443213d509ccb0600db8c5404e387938cfba3ca109f97554599a409c4db"
OUT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__))) + os.sep + "docs"

CROPS = [
    (SRC_EXPANDED, "expanded.png", (0, 0, 432, 745)),
    (SRC_FOLDED, "folded.png", (0, 0, 432, 232)),
]


def main() -> None:
    os.makedirs(OUT_DIR, exist_ok=True)
    for src, name, box in CROPS:
        image = Image.open(src).convert("RGB")
        cropped = image.crop(box)
        path = os.path.join(OUT_DIR, name)
        cropped.save(path, "PNG", optimize=True)
        print(f"{name}: {cropped.size[0]}x{cropped.size[1]} {os.path.getsize(path)} bytes")


if __name__ == "__main__":
    main()
