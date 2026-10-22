import os
import re
from collections import Counter

file_path = "Filmes-Series.m3u8"
groups = Counter()
total_items = 0

with open(file_path, "r", encoding="utf-8", errors="replace") as f:
    for line in f:
        if line.startswith("#EXTINF"):
            match = re.search(r'group-title="([^"]*)"', line)
            grp = match.group(1) if match else "Sem Categoria"
            groups[grp] += 1
            total_items += 1

print(f"Total de itens no arquivo completo: {total_items}")
print(f"Total de categorias: {len(groups)}")
print("\nCategorias encontradas:")
with open("todas_categorias.txt", "w", encoding="utf-8") as out:
    for grp, count in sorted(groups.items(), key=lambda x: -x[1]):
        line_str = f"{grp}: {count}"
        print(f"  {line_str}")
        out.write(line_str + "\n")
