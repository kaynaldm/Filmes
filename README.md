# 🎬 K-Cine - Sistema & Catálogo de Filmes e Séries

Catálogo completo, sanitizado e organizado com **316.354 títulos** (mais de **30.200 filmes** e **286.100 episódios de séries**) prontos para uso em Smart TVs, TV Boxes, players multimídia e no próprio Portal Web incluído.

---

## 📁 Estrutura das Pastas Organizadas

Todos os links foram processados e divididos na pasta `CANAIS_ORGANIZADOS/`:

```
d:\PROJETOS PRE-PRONTOS\FILMES\
  │
  ├── CANAIS_ORGANIZADOS/
  │   ├── 00_LISTAS_MESTRES/
  │   │   ├── Canal_Filmes_e_Series_Completo.m3u8  (316.354 títulos organizados)
  │   │   ├── Canal_Filmes_Geral.m3u8              (30.203 filmes)
  │   │   ├── Canal_Series_Geral.m3u8              (286.151 séries)
  │   │   ├── Relatorio_Geral.txt                  (Estatísticas detalhadas)
  │   │   └── Estatisticas_Catalogo.json
  │   │
  │   ├── 01_FILMES/ (25 Categorias)
  │   │   ├── 01_Lancamentos/
  │   │   ├── 02_4K_UHD/
  │   │   ├── 03_Acao/
  │   │   ├── 04_Animacao/
  │   │   ├── 05_Aventura/
  │   │   ├── 06_Comedia/
  │   │   ├── 07_Crime/
  │   │   ├── 08_Drama/
  │   │   ├── 09_Dramas_Curtos/
  │   │   ├── 10_Familia/
  │   │   ├── 11_Fantasia/
  │   │   ├── 12_Faroeste/
  │   │   ├── 13_Ficcao_Cientifica/
  │   │   ├── 14_Guerra/
  │   │   ├── 15_Infantis/
  │   │   ├── 16_Legendados/
  │   │   ├── 17_Nacionais/
  │   │   ├── 18_Natalino/
  │   │   ├── 19_Oscar_2024/
  │   │   ├── 20_Oscar_2025/
  │   │   ├── 21_Religiosos/
  │   │   ├── 22_Romance/
  │   │   ├── 23_Suspense/
  │   │   ├── 24_Terror/
  │   │   └── 25_Cinema/
  │   │
  │   └── 02_SERIES/ (25 Categorias / Produtoras)
  │       ├── 01_Netflix/
  │       ├── 02_Amazon_Prime/
  │       ├── 03_Max_HBO/
  │       ├── 04_Disney_Plus/
  │       ├── 05_Globoplay/
  │       ├── 06_Apple_TV_Plus/
  │       ├── 07_Paramount_Plus/
  │       ├── 08_Crunchyroll/
  │       ├── 09_Doramas/
  │       ├── 10_Novelas/
  │       ├── 11_Turcas/
  │       ├── 12_Mexicanas/
  │       ├── 13_Discovery_Plus/
  │       ├── 14_Star_Plus/
  │       ├── 15_DirecTV/
  │       ├── 16_Funimation/
  │       ├── 17_SBT/
  │       ├── 18_Brasil_Paralelo/
  │       ├── 19_Indianas/
  │       ├── 20_Claro_Video/
  │       ├── 21_Lionsgate/
  │       ├── 22_Portuguesas/
  │       ├── 23_Pluto_TV/
  │       ├── 24_AMC_Plus/
  │       └── 25_Outras_Produtoras/
```

### 📄 O que há dentro de CADA pasta de categoria?
Cada categoria possui 4 arquivos prontos para uso:
1. `playlist.m3u8`: Lista padrão compatível com Smart TV, TV Box, VLC e qualquer app de IPTV.
2. `links.txt`: Arquivo de texto puro com numeração, Nome do Filme, Link de Transmissão e URL do Cartaz/Poster.
3. `catalogo.csv`: Planilha formatada com cabeçalho (ID, Título, Categoria, Poster TMDB, Link Stream) para abrir no Excel.
4. `dados.json`: Estrutura JSON completa para integrações e desenvolvimento de apps.

---

## 🚀 Como Iniciar o Portal Web de Streaming (K-Cine)

Para navegar, pesquisar títulos instantaneamente com posters e assistir aos vídeos diretamente pelo navegador:

1. Dê um duplo-clique no arquivo:
   ```
   iniciar_portal.bat
   ```
2. O servidor local iniciará e abrirá automaticamente no navegador em:
   ```
   http://localhost:8080
   ```
3. Recursos do Portal:
   - **Busca Global Instantânea**: Pesquise entre todos os 316.354 títulos em menos de 5ms.
   - **Player Integrado**: Clique em qualquer filme ou série para reproduzir na hora.
   - **Cópia de Links**: 1 clique para copiar o link direto de transmissão MP4/HLS.
   - **Integração com VLC**: Botão dedicado para abrir direto no VLC Media Player.

---

## 📺 Como Usar nas Smart TVs e TV Box

### Opção 1: Aplicativos de IPTV (TiviMate / IPTV Smarters / SS IPTV / Smart IPTV)
1. Transfira o arquivo `Canal_Filmes_e_Series_Completo.m3u8` (ou a playlist da categoria que preferir) para o seu dispositivo via pendrive ou rede local.
2. No app (ex: TiviMate ou Smarters), escolha **"Adicionar Lista" -> "Arquivo Local (.m3u)"**.
3. Todos os canais, logos dos pôsteres e categorias já aparecerão catalogados.

### Opção 2: Jellyfin / Emby / Kodi (.STRM)
- Se você utiliza o **Jellyfin**, **Emby** ou **Kodi** para criar seu próprio servidor de streaming estilo Netflix:
- Execute o script `gerar_strm_kodi_jellyfin.py`:
  ```bash
  python gerar_strm_kodi_jellyfin.py
  ```
- O script criará a pasta `BIBLIOTECA_STRM` com arquivos `.strm` individuais. Aponte sua biblioteca de filmes do Jellyfin para essa pasta e ele baixará sinopses, capas, notas e elenco automaticamente!

---

## 🛠️ Scripts Utilitários Inclusos

- `organizar_tudo.py`: Script principal que baixa, analisa e reorganiza o catálogo inteiro em segundos.
- `servidor.py`: Servidor HTTP leve com motor de busca de alta velocidade em memória RAM.
- `iniciar_portal.bat`: Atalho executável para inicialização do sistema.
- `gerar_strm_kodi_jellyfin.py`: Gerador de biblioteca .strm para servidores de mídia.
