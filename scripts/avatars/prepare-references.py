"""Builds the references of a character from the candidates picked in characters/<id>/selection.json.

selection.json:
  {"master": {"file": "c01", "erase": [[x0, y0, x1, y1]]},           # fractions of the image
   "references": [{"file": "c01"}, {"file": "c08", "crop": [x0, y0, x1, y1]}],
   "notes": "why these images"}
Output, same framing and scale for every character (white background, subject centred, 6 % margin):
  characters/<id>/master_reference.png   1536x2048 (3:4), the cleanest full or 3/4 body image
  characters/<id>/references/reference_NN.png   1024x1365 (3:4)
Usage: python3 scripts/avatars/prepare-references.py <character-id> […]
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageChops

ROOT = Path(__file__).resolve().parents[2] / "characters"

def load(cid, spec):
    im = Image.open(ROOT / cid / "candidates" / f"{spec['file']}.png").convert("RGBA")
    w, h = im.size
    for x0, y0, x1, y1 in spec.get("erase", []):
        im.paste((0, 0, 0, 0), (int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    if "crop" in spec:
        x0, y0, x1, y1 = spec["crop"]
        im = im.crop((int(x0 * w), int(y0 * h), int(x1 * w), int(y1 * h)))
    return im

def subject_box(im):
    """Bounding box of the subject: opaque pixels for a cut-out, else pixels that differ from the corners."""
    alpha = im.getchannel("A")
    if alpha.getextrema()[0] < 20:
        return alpha.point(lambda v: 255 if v > 20 else 0).getbbox()
    rgb = im.convert("RGB")
    corner = rgb.getpixel((0, 0))
    diff = ImageChops.difference(rgb, Image.new("RGB", rgb.size, corner)).convert("L").point(lambda v: 255 if v > 30 else 0)
    return diff.getbbox() or (0, 0, *im.size)

def framed(im, size):
    """White canvas of `size`, subject scaled to fill it with a 6 % margin, centred."""
    box = subject_box(im)
    im = im.crop(box)
    cw, ch = size
    scale = min(cw * 0.88 / im.width, ch * 0.88 / im.height)
    im = im.resize((max(1, round(im.width * scale)), max(1, round(im.height * scale))), Image.LANCZOS)
    canvas = Image.new("RGBA", size, (255, 255, 255, 255))
    canvas.alpha_composite(im, ((cw - im.width) // 2, (ch - im.height) // 2))
    return canvas.convert("RGB")

def prepare(cid):
    sel = json.loads((ROOT / cid / "selection.json").read_text())
    framed(load(cid, sel["master"]), (1536, 2048)).save(ROOT / cid / "master_reference.png", optimize=True)
    out = ROOT / cid / "references"
    out.mkdir(exist_ok=True)
    for old in out.glob("reference_*.png"):
        old.unlink()
    for n, spec in enumerate(sel["references"], 1):
        framed(load(cid, spec), (1024, 1365)).save(out / f"reference_{n:02d}.png", optimize=True)
    print(f"{cid}: master + {len(sel['references'])} references")

for cid in sys.argv[1:]:
    prepare(cid)
