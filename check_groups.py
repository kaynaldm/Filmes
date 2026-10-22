import re
from collections import Counter

groups = Counter()
with open("Filmes-Series.m3u8", "r", encoding="utf-8", errors="replace") as f:
    for line in f:
        if line.startswith("#EXTINF:"):
            m = re.search(r'group-title="([^"]*)"', line)
            g = m.group(1) if m else "Sem Categoria"
            groups[g] += 1

for g, count in sorted(groups.items()):
    print(repr(g), count)
