"""
Gerador de Arquivos .STRM para Jellyfin / Emby / Kodi / Plex
Permite transformar os links em uma biblioteca de mídia sob demanda!
"""
import os
import re
import json

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
M3U_FILE = os.path.join(BASE_DIR, "Filmes-Series.m3u8")
OUTPUT_STRM_DIR = os.path.join(BASE_DIR, "BIBLIOTECA_STRM")

def sanitize_name(name):
    clean = re.sub(r'[\\/*?:"<>|]', "", name).strip()
    return clean

def gerar_strm(limite_por_categoria=None):
    print("=" * 60)
    print("  GERADOR DE ARQUIVOS .STRM (JELLYFIN / EMBY / KODI)")
    print("=" * 60)
    print("Lendo catálogo...")

    os.makedirs(OUTPUT_STRM_DIR, exist_ok=True)
    filmes_dir = os.path.join(OUTPUT_STRM_DIR, "FILMES")
    series_dir = os.path.join(OUTPUT_STRM_DIR, "SERIES")
    os.makedirs(filmes_dir, exist_ok=True)
    os.makedirs(series_dir, exist_ok=True)

    gerados_filmes = 0
    gerados_series = 0
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
                m_group = re.search(r'group-title="([^"]*)"', current_inf)
                grp = m_group.group(1) if m_group else "Outros"
                
                m_name = re.search(r'tvg-name="([^"]*)"', current_inf)
                if m_name and m_name.group(1):
                    name = m_name.group(1)
                else:
                    name = current_inf.split(",")[-1].strip() if "," in current_inf else "Sem Titulo"

                safe_name = sanitize_name(name)
                if not safe_name:
                    safe_name = "Item_Sem_Nome"

                is_serie = "SÉRIES" in grp or "SERIES" in grp

                if not is_serie:
                    # Formato Filme: FILMES / Categoria / Nome / Nome.strm
                    safe_cat = sanitize_name(grp.replace("FILMES | ", ""))
                    cat_folder = os.path.join(filmes_dir, safe_cat)
                    os.makedirs(cat_folder, exist_ok=True)
                    
                    strm_path = os.path.join(cat_folder, f"{safe_name}.strm")
                    with open(strm_path, "w", encoding="utf-8") as strm_f:
                        strm_f.write(url + "\n")
                    gerados_filmes += 1
                else:
                    # Formato Série: SERIES / Categoria / Nome.strm
                    safe_cat = sanitize_name(grp.replace("SÉRIES | ", ""))
                    cat_folder = os.path.join(series_dir, safe_cat)
                    os.makedirs(cat_folder, exist_ok=True)
                    
                    strm_path = os.path.join(cat_folder, f"{safe_name}.strm")
                    with open(strm_path, "w", encoding="utf-8") as strm_f:
                        strm_f.write(url + "\n")
                    gerados_series += 1

                current_inf = None

    print(f"\n[SUCESSO] Arquivos .STRM gerados com êxito!")
    print(f"- Filmes gerados: {gerados_filmes:,}")
    print(f"- Séries geradas: {gerados_series:,}")
    print(f"- Localização: {OUTPUT_STRM_DIR}")

if __name__ == "__main__":
    gerar_strm()
