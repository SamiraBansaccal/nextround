"""Static interviewer pictures (public/interviewers/<id>.webp) from the prepared references.

Source per character: the master reference's candidate when selection.json exists, otherwise the
canonical image (English Wikipedia's) found by collect-references.py, otherwise the best candidate.
The picture is 1280x720 (16:9, the call's webcam frame) with the head and shoulders filling the
height, centred, so the round avatar (centre square, object-cover) shows the face.
Usage: python3 scripts/avatars/make-pictures.py [id …]   then: node scripts/avatars/interviewer-pictures.mjs
"""
import json, sys
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
CHARS, OUT = ROOT / "assets" / "characters", ROOT / "public" / "interviewers"
sys.path.insert(0, str(Path(__file__).parent))
prepare = __import__("prepare-references")  # subject_box, load

def source(cid):
    folder = CHARS / cid
    sel = folder / "selection.json"
    if sel.exists():
        return prepare.load(cid, json.loads(sel.read_text())["master"])
    manifest = folder / "candidates" / "candidates.json"
    if not manifest.exists():
        return None
    entries = json.loads(manifest.read_text())
    pick = next((e for e in entries if e["wiki_file"].startswith("Wikipedia:")), entries[0] if entries else None)
    return Image.open(folder / "candidates" / pick["file"]).convert("RGBA") if pick else None

def picture(im):
    im = im.crop(prepare.subject_box(im))
    if im.height > im.width * 1.3:  # full body: keep head and shoulders
        im = im.crop((0, 0, im.width, int(min(im.height, max(im.width * 1.25, im.height * 0.55)))))
    W, H = 1280, 720
    scale = H * 0.96 / im.height
    if im.width * scale > W * 0.9:
        scale = W * 0.9 / im.width
    im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    canvas = Image.new("RGBA", (W, H), (246, 242, 236, 255))  # warm neutral, like the app's background
    glow = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((W // 2 - 420, -120, W // 2 + 420, H + 200), fill=(255, 255, 255, 160))
    canvas.alpha_composite(glow)
    canvas.alpha_composite(im, ((W - im.width) // 2, H - im.height))
    return canvas.convert("RGB")

ids = sys.argv[1:] or json.loads((CHARS / "sources.json").read_text()).keys()
OUT.mkdir(parents=True, exist_ok=True)
for cid in ids:
    im = source(cid)
    if im is None:
        print(f"{cid}: no source yet")
        continue
    picture(im).save(OUT / f"{cid}.webp", quality=82)
    print(f"{cid}: ok")
