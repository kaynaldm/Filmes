import re
import os
from collections import Counter

content_path = r"C:\Users\kayna\.gemini\antigravity-ide\brain\e0ef31a4-40ed-4aac-8a97-2fb3ffa142d7\.system_generated\steps\4\content.md"

with open(content_path, "r", encoding="utf-8", errors="ignore") as f:
    lines = f.readlines()

groups = Counter()
items = []

current_item = {}
for line in lines:
    line = line.strip()
    if line.startswith("#EXTINF"):
        # extract tvg-name, tvg-logo, group-title, and name
        match_group = re.search(r'group-title="([^"]*)"', line)
        group = match_group.group(1) if match_group else "Sem Categoria"
        
        match_name = re.search(r'tvg-name="([^"]*)"', line)
        name = match_name.group(1) if match_name else ""
        if not name and "," in line:
            name = line.split(",")[-1].strip()
            
        match_logo = re.search(r'tvg-logo="([^"]*)"', line)
        logo = match_logo.group(1) if match_logo else ""
        
        current_item = {
            "group": group,
            "name": name,
            "logo": logo,
            "raw_inf": line
        }
    elif line and not line.startswith("#") and current_item:
        current_item["url"] = line
        groups[current_item["group"]] += 1
        items.append(current_item)
        current_item = {}

print(f"Total items parsed: {len(items)}")
print(f"Total categories: {len(groups)}")
print("\nTop 20 categories:")
for grp, count in groups.most_common(30):
    print(f"  {grp}: {count}")

with open("categorias.txt", "w", encoding="utf-8") as f:
    for grp, count in groups.items():
        f.write(f"{grp} ({count})\n")
