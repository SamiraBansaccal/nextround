"""Adds reference candidates from a targeted search of the character's Fandom wiki files.

Use when the automatic collection found merchandise or screenshots: e.g. One Piece's official images
are named "<Name> Anime Infobox.png". Appends the best matches (cut-out renders first) to
characters/<id>/candidates/ as cNN.png and to candidates.json, then rebuilds contact-sheet.jpg.
Usage: python3 scripts/avatars/search-files.py <id> "<search words>" [max]
"""
import json, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
col = __import__("collect-references")

cid, query = sys.argv[1], sys.argv[2]
limit = int(sys.argv[3]) if len(sys.argv) > 3 else 6
wiki = json.loads((col.ROOT / "sources.json").read_text())[cid][0]
folder = col.ROOT / cid / "candidates"
manifest = json.loads((folder / "candidates.json").read_text())
known = {m["source"] for m in manifest}
titles = [q.strip() for q in query.split("|")] if query.startswith("File:") else col.file_search(wiki, query, 50)  # "File:A.png|File:B.png" = exact files
infos = [i for i in col.file_infos(wiki, titles) if i["url"] not in known]
scored = []
for info in infos[:20]:
    try:
        im = col.download(info["url"]).convert("RGBA")
    except Exception:
        continue
    scored.append((col.transparent_ratio(im) * 10 + min(im.size) / 400, info, im))
scored.sort(key=lambda t: t[0], reverse=True)
n = len(manifest)
for _, info, im in scored[:limit]:
    n += 1
    path = folder / f"c{n:02d}.png"
    im.save(path)
    manifest.append({"file": path.name, "source": info["url"], "wiki_file": info["title"], "size": [info["w"], info["h"]], "transparent_border": round(col.transparent_ratio(im), 2), "query": query})
    print(f"{cid}: {path.name} {info['title']}")
(folder / "candidates.json").write_text(json.dumps(manifest, indent=1, ensure_ascii=False))
col.contact_sheet(sorted(folder.glob("c*.png")), col.ROOT / cid / "contact-sheet.jpg")
