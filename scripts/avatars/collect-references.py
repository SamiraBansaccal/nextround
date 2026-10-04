"""Collects reference image candidates for each character from its franchise's Fandom wiki.

For every entry of characters/sources.json: lists the images used on the character's page, keeps the
large ones, ranks them (official art and transparent renders first) and downloads the best ones into
characters/<id>/candidates/ with a contact sheet (contact-sheet.jpg) to pick the references from.
Usage: python3 scripts/avatars/collect-references.py [character-id …]   (all characters by default)
"""
import io, json, re, sys, time, urllib.parse, urllib.request
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2] / "characters"
UA = {"User-Agent": "NextRound reference collector (personal project)"}
SKIP = re.compile(r"logo|icon|signature|title.?card|map|symbol|emblem|flag|sprite|tombstone|gravestone|chart|diagram|stamp|button|badge|\.svg$|\.gif$", re.I)
GOOD = re.compile(r"render|official|artwork|promo|profile|model|design|full.?body|pose|transparent|infobox|character|cutout|png$", re.I)
MAX_CANDIDATES = 16

def api(wiki, **params):
    params |= {"format": "json"}
    url = f"https://{wiki}.fandom.com/api.php?{urllib.parse.urlencode(params)}"
    for attempt in range(4):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return json.load(r)
        except Exception:
            time.sleep(2 * (attempt + 1))
    raise RuntimeError(f"API failed: {url}")

def file_infos(wiki, files):
    infos = []
    for start in range(0, len(files), 50):
        d = api(wiki, action="query", titles="|".join(files[start:start + 50]), prop="imageinfo", iiprop="url|size|mime")
        for f in d["query"]["pages"].values():
            ii = (f.get("imageinfo") or [{}])[0]
            if ii.get("mime") in ("image/png", "image/jpeg", "image/webp") and min(ii.get("width", 0), ii.get("height", 0)) >= 300:
                infos.append({"title": f["title"], "url": ii["url"], "w": ii["width"], "h": ii["height"], "mime": ii["mime"]})
    return infos

def page_files(wiki, title):
    d = api(wiki, action="query", titles=title, redirects=1, prop="images", imlimit=500)
    return [i["title"] for p in d["query"]["pages"].values() for i in p.get("images", [])]

def category_files(wiki, category):
    files, cont = [], {}
    while True:
        d = api(wiki, action="query", list="categorymembers", cmtitle=category, cmtype="file", cmlimit=500, **cont)
        files += [m["title"] for m in d["query"]["categorymembers"]]
        if "continue" not in d or len(files) > 1500:
            return files
        cont = d["continue"]

def candidates(wiki, title):
    """Files from the character page, its /Gallery subpage and its image categories."""
    files = page_files(wiki, title) + page_files(wiki, f"{title}/Gallery")
    words = [w for w in re.split(r"[^A-Za-z]+", title) if len(w) > 2]
    cats = api(wiki, action="query", list="search", srnamespace=14, srsearch=f"Images {title}", srlimit=20)["query"]["search"]
    for c in cats:
        if re.match(r"Category:(Images|Gallery)", c["title"]) and any(w.lower() in c["title"].lower() for w in words):
            files += category_files(wiki, c["title"])
    files = [f for f in dict.fromkeys(files) if not SKIP.search(f)]
    infos = [i for i in file_infos(wiki, files) if i["w"] <= i["h"] * 1.9]
    # Shortlist: renders are usually PNG; then the largest. The final ranking needs the pixels.
    infos.sort(key=lambda i: (i["mime"] == "image/png", GOOD.search(i["title"]) is not None, min(i["w"], i["h"])), reverse=True)
    return infos[:28]

def transparent_ratio(im):
    """Share of transparent pixels on the image border: high = a cut-out render, easy to reuse."""
    if im.mode != "RGBA":
        return 0.0
    a = im.getchannel("A")
    w, h = im.size
    border = [a.getpixel((x, y)) for x in range(0, w, max(1, w // 50)) for y in (0, h - 1)] + [a.getpixel((x, y)) for y in range(0, h, max(1, h // 50)) for x in (0, w - 1)]
    return sum(1 for v in border if v < 20) / len(border)

def download(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
        return Image.open(io.BytesIO(r.read()))

def contact_sheet(paths, out):
    cell, cols = 260, 4
    rows = (len(paths) + cols - 1) // cols
    sheet = Image.new("RGB", (cols * cell, rows * (cell + 18)), "white")
    draw = ImageDraw.Draw(sheet)
    for n, path in enumerate(paths):
        im = Image.open(path).convert("RGBA")
        bg = Image.new("RGBA", im.size, (235, 235, 235, 255))
        im = Image.alpha_composite(bg, im).convert("RGB")
        im.thumbnail((cell - 8, cell - 8))
        x, y = (n % cols) * cell, (n // cols) * (cell + 18)
        sheet.paste(im, (x + 4, y + 4))
        draw.text((x + 4, y + cell), f"{path.stem}  {Image.open(path).size[0]}x{Image.open(path).size[1]}", fill="black")
    sheet.save(out, quality=85)

def main():
    sources = json.load(open(ROOT / "sources.json"))
    ids = sys.argv[1:] or list(sources)
    for cid in ids:
        wiki, title = sources[cid]
        folder = ROOT / cid / "candidates"
        folder.mkdir(parents=True, exist_ok=True)
        found = candidates(wiki, title)
        scored = []
        for info in found:
            try:
                im = download(info["url"]).convert("RGBA")
            except Exception:
                continue
            ratio = transparent_ratio(im)
            portrait = im.size[1] >= im.size[0]
            scored.append((ratio * 10 + (2 if portrait else 0) + min(im.size) / 400, info, im, ratio))
            time.sleep(0.2)
        scored.sort(key=lambda t: t[0], reverse=True)
        for old_file in folder.glob("c*.png"):
            old_file.unlink()
        manifest, paths = [], []
        for n, (score, info, im, ratio) in enumerate(scored[:MAX_CANDIDATES], 1):
            path = folder / f"c{n:02d}.png"
            im.save(path)
            paths.append(path)
            manifest.append({"file": path.name, "source": info["url"], "wiki_file": info["title"], "size": [info["w"], info["h"]], "transparent_border": round(ratio, 2)})
        (folder / "candidates.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
        if paths:
            contact_sheet(paths, ROOT / cid / "contact-sheet.jpg")
        print(f"{cid}: {len(paths)} candidates")

main()
