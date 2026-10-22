import re

with open("Filmes-Series.m3u8", "r", encoding="utf-8", errors="replace") as f:
    non_url_lines = 0
    total_extinf = 0
    extinf_without_url = 0
    current_has_extinf = False
    
    for i, line in enumerate(f):
        line = line.strip()
        if not line:
            continue
        if line.startswith("#EXTINF:"):
            total_extinf += 1
            current_has_extinf = True
        elif line.startswith("#"):
            continue
        elif current_has_extinf:
            current_has_extinf = False
        else:
            non_url_lines += 1

print(f"Total EXTINF: {total_extinf}")
print(f"Orphan URLs: {non_url_lines}")
