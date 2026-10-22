// CineStream BR - Client Application Logic

const state = {
  manifesto: null,
  activeType: 'todos', // 'todos' | 'filmes' | 'series'
  activeCategoryId: 'destaques',
  currentItems: [],
  displayedCount: 0,
  pageSize: 40,
  searchQuery: '',
  searchTimeout: null,
  hlsPlayer: null,
  heroIndex: 0,
  heroItems: []
};

// Elementos DOM
const dom = {
  heroBanner: document.getElementById('heroBanner'),
  heroBackdrop: document.getElementById('heroBackdrop'),
  heroTitle: document.getElementById('heroTitle'),
  heroCategory: document.getElementById('heroCategory'),
  heroDesc: document.getElementById('heroDesc'),
  btnHeroPlay: document.getElementById('btnHeroPlay'),
  btnHeroCopy: document.getElementById('btnHeroCopy'),
  btnHeroVlc: document.getElementById('btnHeroVlc'),

  categoriesChips: document.getElementById('categoriesChips'),
  categorySelect: document.getElementById('categorySelect'),
  sortSelect: document.getElementById('sortSelect'),
  activeCategoryTitle: document.getElementById('activeCategoryTitle'),
  currentViewTitle: document.getElementById('currentViewTitle'),
  itemsFoundText: document.getElementById('itemsFoundText'),
  cardsGrid: document.getElementById('cardsGrid'),
  loadMoreContainer: document.getElementById('loadMoreContainer'),
  btnLoadMore: document.getElementById('btnLoadMore'),

  searchInput: document.getElementById('searchInput'),
  clearSearchBtn: document.getElementById('clearSearchBtn'),

  btnTypeTodos: document.getElementById('btnTypeTodos'),
  btnTypeFilmes: document.getElementById('btnTypeFilmes'),
  btnTypeSeries: document.getElementById('btnTypeSeries'),

  playerModal: document.getElementById('playerModal'),
  htmlVideoPlayer: document.getElementById('htmlVideoPlayer'),
  modalVideoTitle: document.getElementById('modalVideoTitle'),
  modalCategoryBadge: document.getElementById('modalCategoryBadge'),
  streamUrlDisplay: document.getElementById('streamUrlDisplay'),
  btnCopyModalUrl: document.getElementById('btnCopyModalUrl'),
  btnModalOpenVlc: document.getElementById('btnModalOpenVlc'),
  btnClosePlayer: document.getElementById('btnClosePlayer'),
  btnModalDismiss: document.getElementById('btnModalDismiss'),
  playerLoading: document.getElementById('playerLoading'),

  exportModal: document.getElementById('exportModal'),
  btnOpenExport: document.getElementById('btnOpenExport'),
  btnCloseExport: document.getElementById('btnCloseExport'),

  guideModal: document.getElementById('guideModal'),
  btnOpenGuide: document.getElementById('btnOpenGuide'),
  btnCloseGuide: document.getElementById('btnCloseGuide'),

  userProfileBtn: document.getElementById('userProfileBtn'),
  adminModal: document.getElementById('adminModal'),
  btnCloseAdmin: document.getElementById('btnCloseAdmin'),
  formAddMovie: document.getElementById('formAddMovie'),
  newTitle: document.getElementById('newTitle'),
  newCategory: document.getElementById('newCategory'),
  newType: document.getElementById('newType'),
  newStreamUrl: document.getElementById('newStreamUrl'),
  newPosterUrl: document.getElementById('newPosterUrl'),

  toast: document.getElementById('toastNotification')
};

// Fallback de imagem de poster
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";

// Inicialização
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  await loadManifesto();
});

// Configuração de Eventos
function setupEventListeners() {
  // Filtros de Tipo
  dom.btnTypeTodos.addEventListener('click', () => switchType('todos'));
  dom.btnTypeFilmes.addEventListener('click', () => switchType('filmes'));
  dom.btnTypeSeries.addEventListener('click', () => switchType('series'));

  // Busca
  dom.searchInput.addEventListener('input', (e) => {
    const val = e.target.value.trim();
    dom.clearSearchBtn.style.display = val ? 'block' : 'none';
    clearTimeout(state.searchTimeout);
    state.searchTimeout = setTimeout(() => handleSearch(val), 350);
  });

  dom.clearSearchBtn.addEventListener('click', () => {
    dom.searchInput.value = '';
    dom.clearSearchBtn.style.display = 'none';
    handleSearch('');
  });

  // Tecla '/' para focar na busca
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== dom.searchInput) {
      e.preventDefault();
      dom.searchInput.focus();
    }
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Botão Carregar Mais
  dom.btnLoadMore.addEventListener('click', renderNextBatch);

  // Filtro Dropdown de Categoria
  if (dom.categorySelect) {
    dom.categorySelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (val === 'destaques') {
        loadDestaques();
      } else {
        const opt = e.target.selectedOptions[0];
        const label = opt ? opt.getAttribute('data-nome') || opt.text : val;
        selectCategory(val, label);
      }
    });
  }

  // Filtro de Ordenação A-Z
  if (dom.sortSelect) {
    dom.sortSelect.addEventListener('change', (e) => {
      applySorting(e.target.value);
    });
  }

  // Player Modal
  dom.btnClosePlayer.addEventListener('click', closePlayerModal);
  dom.btnModalDismiss.addEventListener('click', closePlayerModal);
  dom.btnCopyModalUrl.addEventListener('click', () => {
    copyToClipboard(dom.streamUrlDisplay.value);
  });

  // Export Modal
  if (dom.btnOpenExport && dom.exportModal) {
    dom.btnOpenExport.addEventListener('click', () => dom.exportModal.classList.add('active'));
    dom.btnCloseExport.addEventListener('click', () => dom.exportModal.classList.remove('active'));
  }

  // Guide Modal
  if (dom.btnOpenGuide && dom.guideModal) {
    dom.btnOpenGuide.addEventListener('click', () => dom.guideModal.classList.add('active'));
    dom.btnCloseGuide.addEventListener('click', () => dom.guideModal.classList.remove('active'));
  }

  // Admin Profile Modal - Kaynã
  if (dom.userProfileBtn && dom.adminModal) {
    dom.userProfileBtn.addEventListener('click', () => dom.adminModal.classList.add('active'));
  }
  if (dom.btnCloseAdmin && dom.adminModal) {
    dom.btnCloseAdmin.addEventListener('click', () => dom.adminModal.classList.remove('active'));
  }

  // Admin Tabs
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) targetContent.classList.add('active');
    });
  });

  // Formulário de Cadastro de Novo Título
  if (dom.formAddMovie) {
    dom.formAddMovie.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = dom.newTitle.value.trim();
      const catVal = dom.newCategory.value;
      const catName = dom.newCategory.selectedOptions[0] ? dom.newCategory.selectedOptions[0].text : 'Geral';
      const url = dom.newStreamUrl.value.trim();
      const poster = dom.newPosterUrl.value.trim() || FALLBACK_POSTER;

      const newItem = {
        t: title,
        catNome: catName,
        p: poster,
        u: url
      };

      state.currentItems.unshift(newItem);
      const newCard = createVideoCard(newItem, 0);
      dom.cardsGrid.prepend(newCard);
      dom.adminModal.classList.remove('active');
      dom.formAddMovie.reset();
      showToast(`Título "${title}" cadastrado com sucesso pelo Admin Kaynã!`);
    });
  }

  // Fechar ao clicar fora
  [dom.playerModal, dom.exportModal, dom.guideModal, dom.adminModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    }
  });
}

// Carregar Manifesto
async function loadManifesto() {
  try {
    const resp = await fetch('data/manifesto.json');
    if (!resp.ok) throw new Error('Não foi possível carregar manifesto.json');
    state.manifesto = await resp.json();

    buildCategoryChips();
    prepareHeroBanner();
    loadDestaques();
  } catch (err) {
    console.error('Erro ao carregar catálogo:', err);
    dom.itemsFoundText.textContent = 'Erro ao carregar dados do catálogo.';
  }
}

// Alternar Tipo (Todos / Filmes / Séries)
function switchType(type) {
  state.activeType = type;
  [dom.btnTypeTodos, dom.btnTypeFilmes, dom.btnTypeSeries].forEach(b => b.classList.remove('active'));
  if (type === 'todos') dom.btnTypeTodos.classList.add('active');
  if (type === 'filmes') dom.btnTypeFilmes.classList.add('active');
  if (type === 'series') dom.btnTypeSeries.classList.add('active');

  buildCategoryChips();
  loadDestaques();
}

// Montar Dropdown Completo e Chips Populares de Categoria
function buildCategoryChips() {
  if (!state.manifesto) return;

  // 1. Preencher Dropdown com todas as 50 Categorias Agrupadas
  if (dom.categorySelect) {
    dom.categorySelect.innerHTML = '';

    // Grupo Destaques
    const optDestaques = document.createElement('option');
    optDestaques.value = 'destaques';
    optDestaques.textContent = '⭐ Lançamentos & Destaques';
    dom.categorySelect.appendChild(optDestaques);

    // Grupo Filmes
    const filmesGroup = document.createElement('optgroup');
    filmesGroup.label = '🎬 FILMES (25 Gêneros)';
    const filmesCats = state.manifesto.categorias.filter(c => c.tipo === 'filmes');
    filmesCats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.setAttribute('data-nome', cat.nome);
      opt.textContent = `${cat.nome} (${cat.total.toLocaleString()})`;
      filmesGroup.appendChild(opt);
    });
    dom.categorySelect.appendChild(filmesGroup);

    // Grupo Séries
    const seriesGroup = document.createElement('optgroup');
    seriesGroup.label = '📺 SÉRIES & STREAMINGS (25 Opções)';
    const seriesCats = state.manifesto.categorias.filter(c => c.tipo === 'series');
    seriesCats.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.setAttribute('data-nome', cat.nome);
      opt.textContent = `${cat.nome} (${cat.total.toLocaleString()})`;
      seriesGroup.appendChild(opt);
    });
    dom.categorySelect.appendChild(seriesGroup);

    dom.categorySelect.value = state.activeCategoryId;
  }

  // 2. Preencher Chips Populares (Os Mais Acessados) sem quebrar barra de rolagem horizontal
  dom.categoriesChips.innerHTML = '';

  // Chip Destaques
  const chipDestaques = document.createElement('button');
  chipDestaques.className = `category-chip ${state.activeCategoryId === 'destaques' ? 'active' : ''}`;
  chipDestaques.innerHTML = `<span>⭐ Destaques</span>`;
  chipDestaques.onclick = () => {
    loadDestaques();
  };
  dom.categoriesChips.appendChild(chipDestaques);

  // Lista dos mais populares/relevantes para acesso rápido em formato de chips
  const popularKeywords = [
    { key: '01_lancamentos', label: '🔥 Lançamentos' },
    { key: '02_4k_uhd', label: '💎 4K Ultra HD' },
    { key: '03_acao', label: '💥 Ação' },
    { key: '06_comedia', label: '🍿 Comédia' },
    { key: '24_terror', label: '👻 Terror' },
    { key: '04_animacao', label: '🎨 Animação' },
    { key: '17_nacionais', label: '🇧🇷 Nacionais' },
    { key: '01_netflix', label: '🔴 Netflix' },
    { key: '02_amazon_prime', label: '📦 Prime Video' },
    { key: '03_max_hbo', label: '👑 HBO Max' },
    { key: '04_disney_plus', label: '✨ Disney+' },
    { key: '09_doramas', label: '🇰🇷 Doramas' },
    { key: '10_novelas', label: '🌹 Novelas' },
    { key: '11_turcas', label: '🇹🇷 Turcas' },
    { key: '08_crunchyroll', label: '🇯🇵 Crunchyroll' }
  ];

  popularKeywords.forEach(pk => {
    const cat = state.manifesto.categorias.find(c => c.id === pk.key);
    if (cat) {
      // Se houver filtro de tipo ativo (filmes vs séries), respeita
      if (state.activeType !== 'todos' && cat.tipo !== state.activeType) return;

      const btn = document.createElement('button');
      btn.className = `category-chip ${state.activeCategoryId === cat.id ? 'active' : ''}`;
      btn.innerHTML = `
        <span>${pk.label}</span>
        <span class="chip-count">${cat.total.toLocaleString()}</span>
      `;
      btn.onclick = () => selectCategory(cat.id, cat.nome);
      dom.categoriesChips.appendChild(btn);
    }
  });
}

// Configurar Hero Banner
function prepareHeroBanner() {
  if (!state.manifesto || !state.manifesto.categorias.length) return;
  
  // Coletar itens de destaque para o hero (dos lançamentos e 4k)
  const lancamentos = state.manifesto.categorias.find(c => c.id.includes('lancamentos')) || state.manifesto.categorias[0];
  if (lancamentos && lancamentos.destaques) {
    state.heroItems = lancamentos.destaques.filter(i => i.p && i.p.includes('http'));
  }

  if (state.heroItems.length > 0) {
    updateHeroItem(state.heroItems[0]);
    // Auto-rotacionar a cada 12 segundos
    setInterval(() => {
      state.heroIndex = (state.heroIndex + 1) % state.heroItems.length;
      updateHeroItem(state.heroItems[state.heroIndex]);
    }, 12000);
  }
}

function updateHeroItem(item) {
  if (!item) return;
  dom.heroTitle.textContent = item.t;
  dom.heroCategory.textContent = "Filmes em Destaque";
  dom.heroBackdrop.style.backgroundImage = `url('${item.p || FALLBACK_POSTER}')`;

  if (dom.btnHeroPlay) {
    dom.btnHeroPlay.onclick = () => openPlayer(item.t, 'Filmes em Destaque', item.u);
  }
  if (dom.btnHeroCopy) {
    dom.btnHeroCopy.onclick = () => copyToClipboard(item.u);
  }
  if (dom.btnHeroVlc) {
    dom.btnHeroVlc.onclick = () => window.open(item.u, '_blank');
  }
}

// Carregar Destaques
function loadDestaques() {
  state.activeCategoryId = 'destaques';
  if (dom.categorySelect) dom.categorySelect.value = 'destaques';
  updateActiveChipHighlight();
  dom.currentViewTitle.textContent = "Lançamentos & Destaques";
  dom.activeCategoryTitle.textContent = "Exibindo Destaques Selecionados";

  // Reúne os destaques das categorias de acordo com o filtro
  let pool = [];
  const cats = state.manifesto.categorias.filter(c => {
    if (state.activeType === 'todos') return true;
    return c.tipo === state.activeType;
  });

  cats.forEach(c => {
    if (c.destaques) {
      c.destaques.forEach(it => {
        pool.push({
          ...it,
          catNome: c.nome
        });
      });
    }
  });

  state.currentItems = pool;
  if (dom.sortSelect && dom.sortSelect.value !== 'padrao') {
    applySortingInMemory(dom.sortSelect.value);
  }
  state.displayedCount = 0;
  dom.cardsGrid.innerHTML = '';
  renderNextBatch();
  dom.itemsFoundText.textContent = `${pool.length} títulos em destaque`;
}

// Selecionar Categoria
async function selectCategory(catId, catName) {
  if (catId === 'destaques') {
    loadDestaques();
    return;
  }

  state.activeCategoryId = catId;
  if (dom.categorySelect) dom.categorySelect.value = catId;
  updateActiveChipHighlight();
  dom.currentViewTitle.textContent = catName;
  dom.activeCategoryTitle.textContent = `Categoria: ${catName}`;
  dom.cardsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">Carregando títulos da categoria...</div>';
  dom.loadMoreContainer.style.display = 'none';

  try {
    const resp = await fetch(`data/${catId}.json`);
    if (!resp.ok) throw new Error('Falha ao carregar categoria');
    const items = await resp.json();

    state.currentItems = items.map(it => ({
      ...it,
      catNome: catName
    }));
    
    if (dom.sortSelect && dom.sortSelect.value !== 'padrao') {
      applySortingInMemory(dom.sortSelect.value);
    }

    state.displayedCount = 0;
    dom.cardsGrid.innerHTML = '';
    renderNextBatch();
    dom.itemsFoundText.textContent = `${items.length.toLocaleString()} títulos disponíveis`;
  } catch (err) {
    console.error('Erro ao buscar dados da categoria:', err);
    dom.cardsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Erro ao carregar títulos desta categoria.</div>';
  }
}

function applySorting(sortType) {
  applySortingInMemory(sortType);
  state.displayedCount = 0;
  dom.cardsGrid.innerHTML = '';
  renderNextBatch();
}

function applySortingInMemory(sortType) {
  if (!state.currentItems || !state.currentItems.length) return;
  if (sortType === 'az') {
    state.currentItems.sort((a, b) => (a.t || '').localeCompare(b.t || '', 'pt-BR'));
  } else if (sortType === 'za') {
    state.currentItems.sort((a, b) => (b.t || '').localeCompare(a.t || '', 'pt-BR'));
  }
}

function updateActiveChipHighlight() {
  document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
  const activeBtn = Array.from(document.querySelectorAll('.category-chip')).find(b => {
    if (state.activeCategoryId === 'destaques' && b.innerText.includes('Destaques')) return true;
    return b.onclick && b.onclick.toString().includes(state.activeCategoryId);
  });
  if (activeBtn) activeBtn.classList.add('active');
}

// Renderização Paginada em Lotes (Chunks)
function renderNextBatch() {
  const nextBatch = state.currentItems.slice(state.displayedCount, state.displayedCount + state.pageSize);
  if (!nextBatch.length) {
    dom.loadMoreContainer.style.display = 'none';
    return;
  }

  const fragment = document.createDocumentFragment();
  nextBatch.forEach((item, index) => {
    const card = createVideoCard(item, state.displayedCount + index);
    fragment.appendChild(card);
  });

  dom.cardsGrid.appendChild(fragment);
  state.displayedCount += nextBatch.length;

  if (state.displayedCount < state.currentItems.length) {
    dom.loadMoreContainer.style.display = 'block';
  } else {
    dom.loadMoreContainer.style.display = 'none';
  }
}

// Criar Elemento Card
function createVideoCard(item, index) {
  const card = document.createElement('div');
  card.className = 'video-card';

  const posterUrl = item.p && item.p.startsWith('http') ? item.p : FALLBACK_POSTER;
  const categoryName = item.catNome || 'Filmes & Séries';
  const isSeries = categoryName.toLowerCase().includes('séries') || item.t.toLowerCase().match(/s\d+e\d+/i);
  const badgeText = isSeries ? 'SÉRIE' : 'HD / 4K';

  card.innerHTML = `
    <div class="card-poster">
      <img src="${posterUrl}" alt="${escapeHtml(item.t)}" loading="lazy" onerror="this.src='${FALLBACK_POSTER}'">
      <span class="card-badge">${badgeText}</span>
      <div class="card-play-overlay">
        <div class="play-circle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
    </div>
    <div class="card-body">
      <h4 class="card-title" title="${escapeHtml(item.t)}">${escapeHtml(item.t)}</h4>
      <span class="card-category">${escapeHtml(categoryName)}</span>
      <div class="card-actions">
        <button class="btn-card-action btn-play" title="Assistir Agora">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Play
        </button>
        <button class="btn-card-action btn-copy" title="Copiar Link de Vídeo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Link
        </button>
      </div>
    </div>
  `;

  // Eventos do Card
  card.querySelector('.card-play-overlay').onclick = () => openPlayer(item.t, categoryName, item.u);
  card.querySelector('.btn-play').onclick = () => openPlayer(item.t, categoryName, item.u);
  card.querySelector('.btn-copy').onclick = (e) => {
    e.stopPropagation();
    copyToClipboard(item.u);
  };

  return card;
}

// Busca Inteligente
async function handleSearch(query) {
  state.searchQuery = query;
  if (!query) {
    if (state.activeCategoryId === 'destaques') {
      loadDestaques();
    } else {
      selectCategory(state.activeCategoryId, dom.currentViewTitle.textContent);
    }
    return;
  }

  dom.currentViewTitle.textContent = `Resultados para: "${query}"`;
  dom.cardsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #94a3b8;">Pesquisando em todo o catálogo...</div>';
  dom.loadMoreContainer.style.display = 'none';

  // Tenta buscar no endpoint da API de busca rápida local se o backend estiver rodando
  try {
    const apiResp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (apiResp.ok) {
      const results = await apiResp.json();
      displaySearchResults(results, query);
      return;
    }
  } catch (e) {
    // Backend API não está presente (modo estático), pesquisa localmente
  }

  // Pesquisa local em memória
  const lowerQ = query.toLowerCase();
  const matched = state.currentItems.filter(item => item.t && item.t.toLowerCase().includes(lowerQ));
  displaySearchResults(matched, query);
}

function displaySearchResults(results, query) {
  state.currentItems = results;
  state.displayedCount = 0;
  dom.cardsGrid.innerHTML = '';

  if (!results.length) {
    dom.cardsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 60px 20px;">
        <h3 style="font-size: 1.2rem; margin-bottom: 8px;">Nenhum título encontrado para "${escapeHtml(query)}"</h3>
        <p style="color: #64748b;">Tente buscar por termos mais simples como "Matrix", "Vingadores", "Stranger" ou "Batman".</p>
      </div>
    `;
    dom.itemsFoundText.textContent = `0 títulos encontrados`;
    return;
  }

  renderNextBatch();
  dom.itemsFoundText.textContent = `${results.length.toLocaleString()} títulos encontrados`;
}

// Player de Vídeo Modal
function openPlayer(title, category, url) {
  dom.modalVideoTitle.textContent = title;
  dom.modalCategoryBadge.textContent = category;
  dom.streamUrlDisplay.value = url;
  dom.btnModalOpenVlc.href = `vlc://${url}`;
  dom.playerModal.classList.add('active');

  const video = dom.htmlVideoPlayer;
  dom.playerLoading.classList.add('active');

  // Destrói instância HLS anterior se houver
  if (state.hlsPlayer) {
    state.hlsPlayer.destroy();
    state.hlsPlayer = null;
  }

  // Tenta reprodução HLS ou MP4 nativo
  if (url.includes('.m3u8')) {
    if (Hls.isSupported()) {
      state.hlsPlayer = new Hls({
        debug: false,
        enableWorker: true
      });
      state.hlsPlayer.loadSource(url);
      state.hlsPlayer.attachMedia(video);
      state.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        dom.playerLoading.classList.remove('active');
        video.play().catch(e => console.log('Autoplay bloqueado pelo navegador'));
      });
      state.hlsPlayer.on(Hls.Events.ERROR, () => {
        dom.playerLoading.classList.remove('active');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = url;
      video.play().catch(e => console.log('Autoplay bloqueado'));
    }
  } else {
    // Arquivo direto (.mp4, .mkv, etc)
    video.src = url;
    video.load();
    video.play().then(() => {
      dom.playerLoading.classList.remove('active');
    }).catch(e => {
      dom.playerLoading.classList.remove('active');
    });
  }

  video.onplaying = () => dom.playerLoading.classList.remove('active');
  video.onwaiting = () => dom.playerLoading.classList.add('active');
}

function closePlayerModal() {
  dom.playerModal.classList.remove('active');
  const video = dom.htmlVideoPlayer;
  video.pause();
  video.src = '';
  if (state.hlsPlayer) {
    state.hlsPlayer.destroy();
    state.hlsPlayer = null;
  }
}

function closeAllModals() {
  closePlayerModal();
  if (dom.exportModal) dom.exportModal.classList.remove('active');
  if (dom.guideModal) dom.guideModal.classList.remove('active');
  if (dom.adminModal) dom.adminModal.classList.remove('active');
}

// Copiar para Área de Transferência
function copyToClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(text);
  } else {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
  }

  showToast('Link do vídeo copiado com sucesso!');
}

function showToast(msg) {
  dom.toast.textContent = msg;
  dom.toast.classList.add('show');
  setTimeout(() => dom.toast.classList.remove('show'), 3000);
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/[&<>"']/g, function(m) {
    return {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[m];
  });
}
