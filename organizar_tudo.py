import os
import re
import csv
import json
import time

BASE_DIR = r"d:\PROJETOS PRE-PRONTOS\FILMES"
M3U_FILE = os.path.join(BASE_DIR, "Filmes-Series.m3u8")
OUTPUT_BASE = os.path.join(BASE_DIR, "CANAIS_ORGANIZADOS")
WEB_DATA_DIR = os.path.join(BASE_DIR, "WEB_PORTAL", "data")

os.makedirs(OUTPUT_BASE, exist_ok=True)
os.makedirs(WEB_DATA_DIR, exist_ok=True)

# Mapeamento limpo de categorias para nomes de pastas
CATEGORY_MAP = {
    # FILMES
    "FILMES | Lançamentos": ("01_FILMES", "01_Lancamentos", "Filmes Lançamentos"),
    "FILMES | 4K UHD": ("01_FILMES", "02_4K_UHD", "Filmes 4K Ultra HD"),
    "FILMES | Ação": ("01_FILMES", "03_Acao", "Filmes de Ação"),
    "FILMES | Animação": ("01_FILMES", "04_Animacao", "Filmes de Animação"),
    "FILMES | Aventura": ("01_FILMES", "05_Aventura", "Filmes de Aventura"),
    "FILMES | Comédia": ("01_FILMES", "06_Comedia", "Filmes de Comédia"),
    "FILMES | Crime": ("01_FILMES", "07_Crime", "Filmes de Crime e Policial"),
    "FILMES | Drama": ("01_FILMES", "08_Drama", "Filmes de Drama"),
    "FILMES | Dramas Curtos": ("01_FILMES", "09_Dramas_Curtos", "Dramas Curtos"),
    "FILMES | Família": ("01_FILMES", "10_Familia", "Filmes para Família"),
    "FILMES | Fantasia": ("01_FILMES", "11_Fantasia", "Filmes de Fantasia"),
    "FILMES | Faroeste": ("01_FILMES", "12_Faroeste", "Filmes de Faroeste / Western"),
    "FILMES | Ficcao": ("01_FILMES", "13_Ficcao_Cientifica", "Filmes de Ficção Científica"),
    "FILMES | Guerra": ("01_FILMES", "14_Guerra", "Filmes de Guerra"),
    "FILMES | Infantis": ("01_FILMES", "15_Infantis", "Filmes Infantis"),
    "FILMES | Legendados": ("01_FILMES", "16_Legendados", "Filmes Legendados"),
    "FILMES | Nacionais": ("01_FILMES", "17_Nacionais", "Filmes Nacionais"),
    "FILMES | Natalino": ("01_FILMES", "18_Natalino", "Filmes Natalinos"),
    "FILMES | Oscar 2024": ("01_FILMES", "19_Oscar_2024", "Filmes Indicados ao Oscar 2024"),
    "FILMES | Oscar 2025": ("01_FILMES", "20_Oscar_2025", "Filmes Indicados ao Oscar 2025"),
    "FILMES | Religiosos": ("01_FILMES", "21_Religiosos", "Filmes Religiosos / Gospel"),
    "FILMES | Romance": ("01_FILMES", "22_Romance", "Filmes de Romance"),
    "FILMES | Suspense": ("01_FILMES", "23_Suspense", "Filmes de Suspense"),
    "FILMES | Terror": ("01_FILMES", "24_Terror", "Filmes de Terror"),
    "Cinema": ("01_FILMES", "25_Cinema", "Filmes em Cartaz / Cinema"),

    # SÉRIES
    "SÉRIES | NETFLIX": ("02_SERIES", "01_Netflix", "Séries Netflix"),
    "SÉRIES | AMAZON PRIME VIDEO": ("02_SERIES", "02_Amazon_Prime", "Séries Amazon Prime Video"),
    "SÉRIES | MAX": ("02_SERIES", "03_Max_HBO", "Séries HBO / Max"),
    "SÉRIES | DISNEY PLUS": ("02_SERIES", "04_Disney_Plus", "Séries Disney+"),
    "SÉRIES | GLOBOPLAY": ("02_SERIES", "05_Globoplay", "Séries Globoplay"),
    "SÉRIES | APPLE TV PLUS": ("02_SERIES", "06_Apple_TV_Plus", "Séries Apple TV+"),
    "SÉRIES | PARAMOUNT": ("02_SERIES", "07_Paramount_Plus", "Séries Paramount+"),
    "SÉRIES | CRUNCHYROLL": ("02_SERIES", "08_Crunchyroll", "Animes Crunchyroll"),
    "SÉRIES | DORAMA": ("02_SERIES", "09_Doramas", "Doramas Coreanos e Asiáticos"),
    "SÉRIES | NOVELAS": ("02_SERIES", "10_Novelas", "Novelas Completas"),
    "SÉRIES | TURCAS": ("02_SERIES", "11_Turcas", "Séries e Novelas Turcas"),
    "SÉRIES | MEXICANAS": ("02_SERIES", "12_Mexicanas", "Séries e Novelas Mexicanas"),
    "SÉRIES | DISCOVERY PLUS": ("02_SERIES", "13_Discovery_Plus", "Séries Discovery+"),
    "SÉRIES | STAR PLUS": ("02_SERIES", "14_Star_Plus", "Séries Star+"),
    "SÉRIES | DIRECTV": ("02_SERIES", "15_DirecTV", "Séries DirecTV"),
    "SÉRIES | FUNIMATION NOW": ("02_SERIES", "16_Funimation", "Animes Funimation"),
    "SÉRIES | SBT": ("02_SERIES", "17_SBT", "Séries e Programas SBT"),
    "SÉRIES | BRASIL PARALELO": ("02_SERIES", "18_Brasil_Paralelo", "Produções Brasil Paralelo"),
    "SÉRIES | INDIANAS": ("02_SERIES", "19_Indianas", "Séries Indianas"),
    "SÉRIES | CLARO VIDEO": ("02_SERIES", "20_Claro_Video", "Séries Claro Vídeo"),
    "SÉRIES | LIONSGATE": ("02_SERIES", "21_Lionsgate", "Séries Lionsgate+"),
    "SÉRIES | PORTUGUESAS": ("02_SERIES", "22_Portuguesas", "Séries Portuguesas"),
    "SÉRIES | PLUTOTV": ("02_SERIES", "23_Pluto_TV", "Séries Pluto TV"),
    "SÉRIES | AMC PLUS": ("02_SERIES", "24_AMC_Plus", "Séries AMC+"),
    "SÉRIES | OUTRAS PRODUTORAS": ("02_SERIES", "25_Outras_Produtoras", "Séries de Outras Produtoras")
}

def sanitize_filename(name):
    return re.sub(r'[\\/*?:"<>|]', "", name).strip()

def run():
    print("Iniciando organização profissional das listas...")
    start_time = time.time()

    # Prepara buffers em memória para escrita rápida
    category_items = {k: [] for k in CATEGORY_MAP}
    all_movies = []
    all_series = []
    total_count = 0

    current_inf = None
    with open(M3U_FILE, "r", encoding="utf-8", errors="replace") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            if line.startswith("#EXTINF:"):
                current_inf = line
            elif line.startswith("#"):
                continue
            elif current_inf:
                url = line
                
                # Extrai dados do EXTINF
                m_group = re.search(r'group-title="([^"]*)"', current_inf)
                raw_group = m_group.group(1) if m_group else "Outros"
                
                m_logo = re.search(r'tvg-logo="([^"]*)"', current_inf)
                logo = m_logo.group(1) if m_logo else ""
                
                m_name = re.search(r'tvg-name="([^"]*)"', current_inf)
                if m_name and m_name.group(1):
                    name = m_name.group(1)
                else:
                    name = current_inf.split(",")[-1].strip() if "," in current_inf else "Sem Título"
                
                item = {
                    "title": name,
                    "category": raw_group,
                    "logo": logo,
                    "url": url,
                    "extinf": current_inf
                }
                
                if raw_group in category_items:
                    category_items[raw_group].append(item)
                else:
                    # Categoria não mapeada explicitamente
                    if "SÉRIES" in raw_group or "SERIES" in raw_group:
                        category_items.setdefault("SÉRIES | OUTRAS PRODUTORAS", []).append(item)
                    else:
                        category_items.setdefault("Cinema", []).append(item)

                if "SÉRIES" in raw_group or "SERIES" in raw_group:
                    all_series.append(item)
                else:
                    all_movies.append(item)

                total_count += 1
                current_inf = None

    print(f"Total de títulos lidos: {total_count} ({len(all_movies)} filmes, {len(all_series)} séries/episódios)")
    print(f"Tempo de parsing: {time.time() - start_time:.2f}s")

    # Criando estrutura de pastas e arquivos
    print("\nGravando arquivos por categoria...")
    stats = {
        "total_geral": total_count,
        "total_filmes": len(all_movies),
        "total_series": len(all_series),
        "categorias": {}
    }

    manifesto_web = []

    for cat_raw, items in category_items.items():
        if not items:
            continue
        
        type_folder, cat_folder, display_name = CATEGORY_MAP.get(cat_raw, ("OUTROS", sanitize_filename(cat_raw), cat_raw))
        dir_path = os.path.join(OUTPUT_BASE, type_folder, cat_folder)
        os.makedirs(dir_path, exist_ok=True)

        stats["categorias"][cat_raw] = {
            "nome_exibicao": display_name,
            "tipo": "Filmes" if type_folder == "01_FILMES" else "Séries",
            "pasta": f"{type_folder}/{cat_folder}",
            "quantidade": len(items)
        }

        # 1. Arquivo M3U8 da categoria
        m3u8_path = os.path.join(dir_path, "playlist.m3u8")
        with open(m3u8_path, "w", encoding="utf-8") as fm3u:
            fm3u.write("#EXTM3U\n")
            fm3u.write(f'#EXT-X-SESSION-DATA:DATA-ID="canal-{cat_folder.lower()}"\n')
            for it in items:
                fm3u.write(f'{it["extinf"]}\n{it["url"]}\n')

        # 2. Arquivo TXT limpo (Título | Link)
        txt_path = os.path.join(dir_path, "links.txt")
        with open(txt_path, "w", encoding="utf-8") as ftxt:
            ftxt.write(f"=== {display_name.upper()} (Total: {len(items)}) ===\n\n")
            for idx, it in enumerate(items, 1):
                ftxt.write(f"{idx:05d}. {it['title']}\n    Link: {it['url']}\n    Poster: {it['logo']}\n\n")

        # 3. Arquivo CSV para Excel
        csv_path = os.path.join(dir_path, "catalogo.csv")
        with open(csv_path, "w", encoding="utf-8-sig", newline="") as fcsv:
            writer = csv.writer(fcsv)
            writer.writerow(["ID", "Título", "Categoria", "Poster_TMDB", "Link_Stream"])
            for idx, it in enumerate(items, 1):
                writer.writerow([idx, it["title"], display_name, it["logo"], it["url"]])

        # 4. Arquivo JSON estruturado
        json_path = os.path.join(dir_path, "dados.json")
        with open(json_path, "w", encoding="utf-8") as fjson:
            json.dump({
                "categoria": display_name,
                "tipo": "Filmes" if type_folder == "01_FILMES" else "Séries",
                "total": len(items),
                "itens": [{
                    "id": idx,
                    "titulo": it["title"],
                    "logo": it["logo"],
                    "url": it["url"]
                } for idx, it in enumerate(items, 1)]
            }, fjson, ensure_ascii=False, indent=2)

        # 5. Salva dados web em fatias leves para o Web Portal
        web_cat_id = cat_folder.lower()
        web_json_path = os.path.join(WEB_DATA_DIR, f"{web_cat_id}.json")
        with open(web_json_path, "w", encoding="utf-8") as fweb:
            json.dump([{
                "t": it["title"],
                "p": it["logo"],
                "u": it["url"]
            } for it in items], fweb, ensure_ascii=False)

        manifesto_web.append({
            "id": web_cat_id,
            "tipo": "filmes" if type_folder == "01_FILMES" else "series",
            "nome": display_name,
            "pasta": f"{type_folder}/{cat_folder}",
            "total": len(items),
            "destaques": [{
                "t": it["title"],
                "p": it["logo"],
                "u": it["url"]
            } for it in items[:12]]
        })

    # Gravar Listas Mestres em 00_LISTAS_MESTRES
    master_dir = os.path.join(OUTPUT_BASE, "00_LISTAS_MESTRES")
    os.makedirs(master_dir, exist_ok=True)

    print("\nGravando Listas Mestres...")
    # 1. Filmes Geral
    with open(os.path.join(master_dir, "Canal_Filmes_Geral.m3u8"), "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")
        for it in all_movies:
            f.write(f'{it["extinf"]}\n{it["url"]}\n')

    # 2. Series Geral
    with open(os.path.join(master_dir, "Canal_Series_Geral.m3u8"), "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")
        for it in all_series:
            f.write(f'{it["extinf"]}\n{it["url"]}\n')

    # 3. Completo Filmes e Series
    with open(os.path.join(master_dir, "Canal_Filmes_e_Series_Completo.m3u8"), "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")
        for it in all_movies:
            f.write(f'{it["extinf"]}\n{it["url"]}\n')
        for it in all_series:
            f.write(f'{it["extinf"]}\n{it["url"]}\n')

    # 4. Relatório e Estatísticas
    with open(os.path.join(master_dir, "Relatorio_Geral.txt"), "w", encoding="utf-8") as f:
        f.write("=" * 60 + "\n")
        f.write("      CANAL DE FILMES E SÉRIES - CATÁLOGO ORGANIZADO\n")
        f.write("=" * 60 + "\n\n")
        f.write(f"Total Geral de Títulos/Links: {total_count:,}\n")
        f.write(f"Total de Filmes: {len(all_movies):,}\n")
        f.write(f"Total de Séries/Episódios: {len(all_series):,}\n")
        f.write(f"Total de Pastas de Categorias: {len(stats['categorias'])}\n\n")
        f.write("-" * 60 + "\n")
        f.write("DISTRIBUIÇÃO POR CATEGORIA:\n")
        f.write("-" * 60 + "\n")
        for cat_raw, data in sorted(stats["categorias"].items(), key=lambda x: -x[1]["quantidade"]):
            f.write(f"[{data['tipo']}] {data['nome_exibicao']} ({data['pasta']}): {data['quantidade']:,} títulos\n")

    with open(os.path.join(master_dir, "Estatisticas_Catalogo.json"), "w", encoding="utf-8") as f:
        json.dump(stats, f, ensure_ascii=False, indent=2)

    # Manifesto para o Web Portal
    with open(os.path.join(WEB_DATA_DIR, "manifesto.json"), "w", encoding="utf-8") as f:
        json.dump({
            "estatisticas": stats,
            "categorias": manifesto_web
        }, f, ensure_ascii=False, indent=2)

    total_time = time.time() - start_time
    print(f"\n[SUCESSO] Organização completa finalizada com êxito em {total_time:.2f} segundos!")
    print(f"Diretório principal: {OUTPUT_BASE}")

if __name__ == "__main__":
    run()
