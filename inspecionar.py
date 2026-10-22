import re

with open("Filmes-Series.m3u8", "r", encoding="utf-8", errors="replace") as f:
    found = 0
    for line in f:
        if 'group-title="S' in line:
            print("INFO:", line.strip())
            url = next(f, "").strip()
            print("URL:", url)
            print("-" * 50)
            found += 1
            if found >= 8:
                break
