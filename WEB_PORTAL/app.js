// K-Cine - Client Application Logic
// Suporte a Autenticação, Central de Clientes, Supabase e Streaming

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
  heroItems: [],
  currentUser: null,
  // Estado de Séries & Capítulos
  seriesViewMode: 'all', // 'all' (todos os capítulos) | 'grouped' (agrupado por série)
  groupedSeriesList: [],
  activeSeriesContext: null, // { seriesName, episodes: [], currentIndex: 0 }
  activeSeriesGroup: null
};

// Elementos DOM
const dom = {
  // Login Screen
  loginScreen: document.getElementById('loginScreen'),
  loginForm: document.getElementById('loginForm'),
  loginUsername: document.getElementById('loginUsername'),
  loginPassword: document.getElementById('loginPassword'),
  btnLoginSubmit: document.getElementById('btnLoginSubmit'),
  btnLoginText: document.getElementById('btnLoginText'),
  btnToggleLoginEye: document.getElementById('btnToggleLoginEye'),
  loginAlertBox: document.getElementById('loginAlertBox'),
  loginAlertMessage: document.getElementById('loginAlertMessage'),

  // Header & User Controls
  mainHeader: document.getElementById('mainHeader'),
  userProfileBtn: document.getElementById('userProfileBtn'),
  navUserAvatar: document.getElementById('navUserAvatar'),
  navUserInitial: document.getElementById('navUserInitial'),
  navUserName: document.getElementById('navUserName'),
  navUserRole: document.getElementById('navUserRole'),
  btnLogoutHeader: document.getElementById('btnLogoutHeader'),

  // Hero Banner
  heroBanner: document.getElementById('heroBanner'),
  heroBackdrop: document.getElementById('heroBackdrop'),
  heroTitle: document.getElementById('heroTitle'),
  heroCategory: document.getElementById('heroCategory'),
  heroDesc: document.getElementById('heroDesc'),
  btnHeroPlay: document.getElementById('btnHeroPlay'),
  btnHeroCopy: document.getElementById('btnHeroCopy'),
  btnHeroVlc: document.getElementById('btnHeroVlc'),

  // Filtros e Catálogo
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

  // Alternador de Visualização de Séries
  seriesViewControls: document.getElementById('seriesViewControls'),
  btnViewAll: document.getElementById('btnViewAll'),
  btnViewGrouped: document.getElementById('btnViewGrouped'),

  // Player Modal & Navegação de Capítulos
  playerModal: document.getElementById('playerModal'),
  htmlVideoPlayer: document.getElementById('htmlVideoPlayer'),
  modalVideoTitle: document.getElementById('modalVideoTitle'),
  modalCategoryBadge: document.getElementById('modalCategoryBadge'),
  modalEpisodeBadge: document.getElementById('modalEpisodeBadge'),
  playerEpisodeNav: document.getElementById('playerEpisodeNav'),
  btnPrevEp: document.getElementById('btnPrevEp'),
  btnNextEp: document.getElementById('btnNextEp'),
  playerSeriesStrip: document.getElementById('playerSeriesStrip'),
  stripSeriesName: document.getElementById('stripSeriesName'),
  stripEpCount: document.getElementById('stripEpCount'),
  playerStripScroll: document.getElementById('playerStripScroll'),
  streamUrlDisplay: document.getElementById('streamUrlDisplay'),
  btnCopyModalUrl: document.getElementById('btnCopyModalUrl'),
  btnModalOpenVlc: document.getElementById('btnModalOpenVlc'),
  btnClosePlayer: document.getElementById('btnClosePlayer'),
  btnModalDismiss: document.getElementById('btnModalDismiss'),
  playerLoading: document.getElementById('playerLoading'),

  // Modal de Detalhes da Série (Temporadas e Episódios)
  seriesModal: document.getElementById('seriesModal'),
  seriesModalPoster: document.getElementById('seriesModalPoster'),
  seriesModalCategory: document.getElementById('seriesModalCategory'),
  seriesModalTitle: document.getElementById('seriesModalTitle'),
  seriesModalTotalEpisodes: document.getElementById('seriesModalTotalEpisodes'),
  seriesModalTotalSeasons: document.getElementById('seriesModalTotalSeasons'),
  seriesSeasonsBar: document.getElementById('seriesSeasonsBar'),
  seriesEpisodesGrid: document.getElementById('seriesEpisodesGrid'),
  btnCloseSeriesModal: document.getElementById('btnCloseSeriesModal'),

  // Modais Secundários
  exportModal: document.getElementById('exportModal'),
  btnOpenExport: document.getElementById('btnOpenExport'),
  btnCloseExport: document.getElementById('btnCloseExport'),

  guideModal: document.getElementById('guideModal'),
  btnOpenGuide: document.getElementById('btnOpenGuide'),
  btnCloseGuide: document.getElementById('btnCloseGuide'),

  // Painel Admin Kaynã
  adminModal: document.getElementById('adminModal'),
  btnCloseAdmin: document.getElementById('btnCloseAdmin'),
  formAddMovie: document.getElementById('formAddMovie'),
  newTitle: document.getElementById('newTitle'),
  newCategory: document.getElementById('newCategory'),
  newType: document.getElementById('newType'),
  newStreamUrl: document.getElementById('newStreamUrl'),
  newPosterUrl: document.getElementById('newPosterUrl'),

  // Central de Clientes
  formCreateClient: document.getElementById('formCreateClient'),
  clientNewUser: document.getElementById('clientNewUser'),
  clientNewPass: document.getElementById('clientNewPass'),
  clientNewNotes: document.getElementById('clientNewNotes'),
  btnGenPassword: document.getElementById('btnGenPassword'),
  clientsListContainer: document.getElementById('clientsListContainer'),
  filterClientsInput: document.getElementById('filterClientsInput'),
  statTotalClients: document.getElementById('statTotalClients'),
  statActiveClients: document.getElementById('statActiveClients'),
  statBlockedClients: document.getElementById('statBlockedClients'),
  clientStorageBadge: document.getElementById('clientStorageBadge'),

  // Supabase & Nuvem Tab
  formSupabaseConfig: document.getElementById('formSupabaseConfig'),
  inputSupabaseUrl: document.getElementById('inputSupabaseUrl'),
  inputSupabaseKey: document.getElementById('inputSupabaseKey'),
  btnSaveSupabase: document.getElementById('btnSaveSupabase'),
  btnSyncToSupabase: document.getElementById('btnSyncToSupabase'),
  btnDisconnectSupabase: document.getElementById('btnDisconnectSupabase'),
  supabasePill: document.getElementById('supabasePill'),
  btnCopySqlScript: document.getElementById('btnCopySqlScript'),

  toast: document.getElementById('toastNotification')
};

// Fallback de imagem de poster
const FALLBACK_POSTER = "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500&auto=format&fit=crop&q=60";

// =====================================================================
// INICIALIZAÇÃO
// =====================================================================
document.addEventListener('DOMContentLoaded', async () => {
  setupEventListeners();
  setupModalScrollLocks();
  initSupabaseTab();

  // 1. Verificar Sessão de Autenticação do Usuário
  await checkAuthSession();

  // 2. Carregar Manifesto de Filmes e Séries
  await loadManifesto();
});

// =====================================================================
// CONTROLE DE MODAIS (TRAVA TOTAL DO FUNDO / BACKGROUND FREEZE)
// =====================================================================
function openModal(modalEl) {
  if (!modalEl) return;
  modalEl.classList.add('active');
  document.body.classList.add('modal-open');
}

function closeModal(modalEl) {
  if (!modalEl) return;
  if (modalEl === dom.playerModal || modalEl.id === 'playerModal') {
    stopVideoPlayback();
  }
  modalEl.classList.remove('active');
  const anyActive = document.querySelector('.modal-overlay.active');
  if (!anyActive && (!dom.loginScreen || dom.loginScreen.style.display !== 'flex')) {
    document.body.classList.remove('modal-open');
  }
}

function closeAllModals() {
  closePlayerModal();
  document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
  if (!dom.loginScreen || dom.loginScreen.style.display !== 'flex') {
    document.body.classList.remove('modal-open');
  }
}

function setupModalScrollLocks() {
  // Garante que o scroll do mouse ou toque no fundo escuro não role o documento principal
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.addEventListener('wheel', (e) => {
      if (modal.classList.contains('active') && e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });

    modal.addEventListener('touchmove', (e) => {
      if (modal.classList.contains('active') && e.target === modal) {
        e.preventDefault();
      }
    }, { passive: false });
  });
}

// =====================================================================
// AUTENTICAÇÃO E TELA DE ENTRADA
// =====================================================================
async function checkAuthSession() {
  const check = await AuthManager.verifyCurrentSession();
  if (check && check.valid && check.user) {
    state.currentUser = check.user;
    applyUserRole(state.currentUser);
    hideLoginScreen();
  } else {
    state.currentUser = null;
    const msg = check && check.blocked
      ? 'Seu acesso foi bloqueado pelo administrador. Entre em contato para regularizar seu plano.'
      : null;
    showLoginScreen(msg);
  }
}

function showLoginScreen(alertMsg = null) {
  if (dom.loginScreen) {
    dom.loginScreen.style.display = 'flex';
  }
  document.body.classList.add('modal-open');

  if (alertMsg) {
    dom.loginAlertMessage.textContent = alertMsg;
    dom.loginAlertBox.style.display = 'flex';
  } else {
    dom.loginAlertBox.style.display = 'none';
  }
}

function hideLoginScreen() {
  if (dom.loginScreen) {
    dom.loginScreen.style.display = 'none';
  }
  const anyModal = document.querySelector('.modal-overlay.active');
  if (!anyModal) {
    document.body.classList.remove('modal-open');
  }
}

function applyUserRole(user) {
  if (!user) return;
  const isClient = user.role === 'cliente';

  document.body.classList.toggle('role-cliente', isClient);
  document.body.classList.toggle('role-admin', !isClient);

  // Ajusta visualização do avatar no topo
  const initial = user.username ? user.username.charAt(0).toUpperCase() : 'U';
  if (dom.navUserInitial) dom.navUserInitial.textContent = initial;
  if (dom.navUserName) dom.navUserName.textContent = user.username;
  if (dom.navUserRole) dom.navUserRole.textContent = isClient ? 'CLIENTE VIP' : 'ADMIN';

  if (dom.userProfileBtn) {
    if (isClient) {
      dom.userProfileBtn.title = `Perfil do Cliente: ${user.username}`;
    } else {
      dom.userProfileBtn.title = 'Painel da Conta Admin - Kaynã';
    }
  }

  // Previne cópia, clique direito e inspeção para clientes
  if (isClient) {
    document.addEventListener('contextmenu', blockClientAction);
    document.addEventListener('copy', blockClientAction);
    document.addEventListener('cut', blockClientAction);
    document.addEventListener('dragstart', blockClientAction);
    document.addEventListener('keydown', handleSecurityKeys);
  } else {
    document.removeEventListener('contextmenu', blockClientAction);
    document.removeEventListener('copy', blockClientAction);
    document.removeEventListener('cut', blockClientAction);
    document.removeEventListener('dragstart', blockClientAction);
    document.removeEventListener('keydown', handleSecurityKeys);
  }
}

function blockClientAction(e) {
  if (!state.currentUser || state.currentUser.role === 'cliente') {
    e.preventDefault();
    return false;
  }
}

function handleSecurityKeys(e) {
  if (!state.currentUser || state.currentUser.role === 'cliente') {
    // Bloqueia F12, Ctrl+Shift+I/J/C, Ctrl+U (Ver Código Fonte) e Ctrl+S (Salvar Página)
    if (
      e.key === 'F12' ||
      (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
      (e.ctrlKey && (e.key === 'u' || e.key === 'U' || e.key === 's' || e.key === 'S'))
    ) {
      e.preventDefault();
      return false;
    }
  }
}

function handleLogout() {
  AuthManager.logout();
  state.currentUser = null;
  document.body.classList.remove('role-cliente', 'role-admin');
  closeAllModals();
  showLoginScreen();
  showToast('Você saiu da sua conta.');
}

// =====================================================================
// CONFIGURAÇÃO GERAL DE EVENTOS
// =====================================================================
function setupEventListeners() {
  // 1. Formulário de Login
  if (dom.loginForm) {
    dom.loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const user = dom.loginUsername.value.trim();
      const pass = dom.loginPassword.value.trim();

      dom.btnLoginSubmit.disabled = true;
      dom.btnLoginText.textContent = 'Verificando acesso...';

      const result = await AuthManager.login(user, pass);

      dom.btnLoginSubmit.disabled = false;
      dom.btnLoginText.textContent = 'Entrar no Catálogo';

      if (result.success && result.user) {
        state.currentUser = result.user;
        applyUserRole(state.currentUser);
        hideLoginScreen();
        dom.loginForm.reset();
        showToast(`Bem-vindo, ${result.user.username}!`);

        // Re-renderiza o catálogo para aplicar restrições visuais do perfil
        if (state.rawItems && state.rawItems.length) {
          refreshCatalogDisplay();
        } else if (state.currentItems && state.currentItems.length) {
          state.displayedCount = 0;
          dom.cardsGrid.innerHTML = '';
          renderNextBatch();
        }
      } else {
        dom.loginAlertMessage.textContent = result.message || 'Erro ao realizar login.';
        dom.loginAlertBox.style.display = 'flex';
      }
    });
  }

  // Toggle Eye da senha de login
  if (dom.btnToggleLoginEye) {
    dom.btnToggleLoginEye.addEventListener('click', () => {
      const type = dom.loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      dom.loginPassword.setAttribute('type', type);
    });
  }

  // Botão Sair no cabeçalho
  if (dom.btnLogoutHeader) {
    dom.btnLogoutHeader.addEventListener('click', handleLogout);
  }

  // Filtros de Tipo (Todos / Filmes / Séries)
  dom.btnTypeTodos.addEventListener('click', () => switchType('todos'));
  dom.btnTypeFilmes.addEventListener('click', () => switchType('filmes'));
  dom.btnTypeSeries.addEventListener('click', () => switchType('series'));

  // Busca Inteligente
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

  // Tecla '/' para focar na busca e ESC para fechar modais
  document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== dom.searchInput && (!dom.loginScreen || dom.loginScreen.style.display !== 'flex')) {
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

  // Alternador de Visualização de Séries (Todos os Capítulos vs Agrupar por Série)
  if (dom.btnViewAll) {
    dom.btnViewAll.addEventListener('click', () => setSeriesViewMode('all'));
  }
  if (dom.btnViewGrouped) {
    dom.btnViewGrouped.addEventListener('click', () => setSeriesViewMode('grouped'));
  }

  // Player Modal & Navegação de Capítulos
  dom.btnClosePlayer.addEventListener('click', closePlayerModal);
  dom.btnModalDismiss.addEventListener('click', closePlayerModal);
  if (dom.btnPrevEp) {
    dom.btnPrevEp.addEventListener('click', playPreviousEpisode);
  }
  if (dom.btnNextEp) {
    dom.btnNextEp.addEventListener('click', playNextEpisode);
  }
  if (dom.btnCopyModalUrl) {
    dom.btnCopyModalUrl.addEventListener('click', () => {
      if (state.currentUser && state.currentUser.role === 'admin') {
        copyToClipboard(dom.streamUrlDisplay.value);
      }
    });
  }

  // Modal de Série
  if (dom.btnCloseSeriesModal) {
    dom.btnCloseSeriesModal.addEventListener('click', () => closeModal(dom.seriesModal));
  }

  // Export Modal
  if (dom.btnOpenExport && dom.exportModal) {
    dom.btnOpenExport.addEventListener('click', () => {
      if (state.currentUser && state.currentUser.role === 'admin') {
        openModal(dom.exportModal);
      }
    });
    dom.btnCloseExport.addEventListener('click', () => closeModal(dom.exportModal));
  }

  // Guide Modal
  if (dom.btnOpenGuide && dom.guideModal) {
    dom.btnOpenGuide.addEventListener('click', () => openModal(dom.guideModal));
    dom.btnCloseGuide.addEventListener('click', () => closeModal(dom.guideModal));
  }

  // Admin Profile Modal - Apenas para Administrador
  if (dom.userProfileBtn && dom.adminModal) {
    dom.userProfileBtn.addEventListener('click', () => {
      if (state.currentUser && state.currentUser.role === 'admin') {
        openModal(dom.adminModal);
        renderClientsList();
      }
    });
  }
  if (dom.btnCloseAdmin && dom.adminModal) {
    dom.btnCloseAdmin.addEventListener('click', () => closeModal(dom.adminModal));
  }

  // Abas do Painel Admin
  document.querySelectorAll('.admin-tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const tabId = e.currentTarget.getAttribute('data-tab');
      document.querySelectorAll('.admin-tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
      e.currentTarget.classList.add('active');
      const targetContent = document.getElementById(`tab-${tabId}`);
      if (targetContent) targetContent.classList.add('active');

      if (tabId === 'central-clientes') {
        renderClientsList();
      }
    });
  });

  // Cadastro de Novo Título pelo Admin
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
      closeModal(dom.adminModal);
      dom.formAddMovie.reset();
      showToast(`Título "${title}" cadastrado com sucesso!`);
    });
  }

  // =====================================================================
  // EVENTOS DA CENTRAL DE CLIENTES
  // =====================================================================
  if (dom.formCreateClient) {
    dom.formCreateClient.addEventListener('submit', async (e) => {
      e.preventDefault();
      const username = dom.clientNewUser.value.trim();
      const password = dom.clientNewPass.value.trim();
      const notes = dom.clientNewNotes.value.trim();

      const btnSubmit = document.getElementById('btnSubmitClient');
      if (btnSubmit) btnSubmit.disabled = true;

      const res = await AuthManager.createClient(username, password, notes);

      if (btnSubmit) btnSubmit.disabled = false;

      if (res.success) {
        showToast(`Login de cliente "${username}" criado com sucesso!`);
        dom.formCreateClient.reset();
        renderClientsList();
      } else {
        alert(res.message);
      }
    });
  }

  if (dom.btnGenPassword) {
    dom.btnGenPassword.addEventListener('click', () => {
      // Gera senha aleatória amigável de 6 caracteres
      const chars = '23456789abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ';
      let pass = '';
      for (let i = 0; i < 6; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      dom.clientNewPass.value = pass;
    });
  }

  if (dom.filterClientsInput) {
    dom.filterClientsInput.addEventListener('input', () => {
      renderClientsList();
    });
  }

  // Fechar Modais ao clicar no Backdrop escuro
  [dom.playerModal, dom.exportModal, dom.guideModal, dom.adminModal, dom.seriesModal].forEach(modal => {
    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          closeAllModals();
        }
      });
    }
  });

  // Fechar vídeo se a aba/janela for fechada ou ocultada
  window.addEventListener('beforeunload', stopVideoPlayback);
  window.addEventListener('pagehide', stopVideoPlayback);

  // Fechar modais e áudio ao pressionar tecla ESC
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeAllModals();
    }
  });
}

// =====================================================================
// GESTÃO DA CENTRAL DE CLIENTES (ADMIN)
// =====================================================================
async function renderClientsList() {
  if (!dom.clientsListContainer) return;
  dom.clientsListContainer.innerHTML = '<div class="clients-loading">Carregando lista de clientes...</div>';

  const clients = await AuthManager.listClients();
  updateClientsStats(clients);

  const query = (dom.filterClientsInput ? dom.filterClientsInput.value : '').trim().toLowerCase();
  const filtered = query
    ? clients.filter(c => c.username.toLowerCase().includes(query) || (c.notes && c.notes.toLowerCase().includes(query)))
    : clients;

  if (!filtered.length) {
    dom.clientsListContainer.innerHTML = `
      <div style="text-align: center; padding: 24px; color: #64748b; font-size: 0.85rem;">
        Nenhum cliente encontrado.
      </div>
    `;
    return;
  }

  dom.clientsListContainer.innerHTML = '';
  filtered.forEach(client => {
    const isBlocked = client.status === 'bloqueado';
    const isAdmin = client.role === 'admin';
    const initial = client.username ? client.username.charAt(0).toUpperCase() : 'C';

    const row = document.createElement('div');
    row.className = `client-item-row ${isBlocked ? 'is-blocked' : ''}`;

    row.innerHTML = `
      <div class="client-info-col">
        <div class="client-mini-avatar ${isAdmin ? 'admin-avatar-bg' : ''}">${initial}</div>
        <div class="client-details">
          <span class="client-name-title">
            ${escapeHtml(client.username)}
            ${isAdmin ? '<span class="badge-client-status" style="background: rgba(99,102,241,0.2); color:#818cf8;">ADMIN</span>' : ''}
          </span>
          <span class="client-notes-text">${escapeHtml(client.notes || 'Sem observações')}</span>
        </div>
      </div>

      <div class="client-cred-col" title="Senha de acesso do cliente">
        <span style="color: #94a3b8;">Senha:</span>
        <strong id="pwDisplay-${client.id}">${escapeHtml(client.password)}</strong>
      </div>

      <div>
        <span class="badge-client-status ${client.status}">
          ${client.status === 'ativo' ? '● ATIVO' : '✕ BLOQUEADO'}
        </span>
      </div>

      <div class="client-actions-col">
        ${!isAdmin ? `
          <button class="btn-client-action ${isBlocked ? 'btn-unblock' : 'btn-block'}" data-action="toggle-block" data-id="${client.id}">
            ${isBlocked ? '✓ Desbloquear' : '✕ Bloquear'}
          </button>
        ` : ''}
        <button class="btn-client-action btn-pw" data-action="edit-pw" data-id="${client.id}" data-user="${escapeHtml(client.username)}">
          🔑 Alterar Senha
        </button>
        ${!isAdmin ? `
          <button class="btn-client-action btn-delete" data-action="delete" data-id="${client.id}" data-user="${escapeHtml(client.username)}" title="Excluir Cliente">
            🗑️
          </button>
        ` : ''}
      </div>
    `;

    // Evento de Bloquear / Desbloquear instantâneo
    const btnToggle = row.querySelector('[data-action="toggle-block"]');
    if (btnToggle) {
      btnToggle.onclick = async () => {
        const res = await AuthManager.toggleBlockClient(client.id);
        if (res.success) {
          const actionText = res.newStatus === 'ativo' ? 'DESBLOQUEADO' : 'BLOQUEADO';
          showToast(`Cliente "${client.username}" agora está ${actionText}!`);
          renderClientsList();
        } else {
          showToast(res.message);
        }
      };
    }

    // Evento de Alterar Senha
    const btnPw = row.querySelector('[data-action="edit-pw"]');
    if (btnPw) {
      btnPw.onclick = async () => {
        const newPass = prompt(`Digite a nova senha para o cliente "${client.username}":`, client.password);
        if (newPass !== null && newPass.trim() !== '') {
          const res = await AuthManager.updateClientPassword(client.id, newPass.trim());
          if (res.success) {
            showToast(`Senha de "${client.username}" alterada com sucesso!`);
            renderClientsList();
          } else {
            showToast(res.message);
          }
        }
      };
    }

    // Evento de Excluir
    const btnDel = row.querySelector('[data-action="delete"]');
    if (btnDel) {
      btnDel.onclick = async () => {
        if (confirm(`Tem certeza que deseja excluir o cliente "${client.username}"?`)) {
          const res = await AuthManager.deleteClient(client.id);
          if (res.success) {
            showToast(`Cliente "${client.username}" excluído!`);
            renderClientsList();
          } else {
            showToast(res.message);
          }
        }
      };
    }

    dom.clientsListContainer.appendChild(row);
  });
}

function updateClientsStats(clients) {
  const nonAdmins = clients.filter(c => c.role !== 'admin');
  const total = nonAdmins.length;
  const active = nonAdmins.filter(c => c.status === 'ativo').length;
  const blocked = nonAdmins.filter(c => c.status === 'bloqueado').length;

  if (dom.statTotalClients) dom.statTotalClients.textContent = total;
  if (dom.statActiveClients) dom.statActiveClients.textContent = active;
  if (dom.statBlockedClients) dom.statBlockedClients.textContent = blocked;
  if (dom.clientStorageBadge) {
    const isSupabase = AuthManager.isSupabaseConnected();
    dom.clientStorageBadge.textContent = isSupabase ? 'Supabase Nuvem' : 'Local';
    dom.clientStorageBadge.style.color = isSupabase ? '#3ECF8E' : 'var(--accent-cyan)';
  }
}

// =====================================================================
// ABA SUPABASE & BANCO DE DADOS EM NUVEM
// =====================================================================
function initSupabaseTab() {
  const cfg = AuthManager.getSupabaseConfig();
  if (cfg) {
    if (dom.inputSupabaseUrl) dom.inputSupabaseUrl.value = cfg.url || '';
    if (dom.inputSupabaseKey) dom.inputSupabaseKey.value = cfg.anonKey || '';
    if (dom.btnDisconnectSupabase) dom.btnDisconnectSupabase.style.display = 'inline-block';
  }
  updateSupabasePill();

  if (dom.formSupabaseConfig) {
    dom.formSupabaseConfig.addEventListener('submit', async (e) => {
      e.preventDefault();
      const url = dom.inputSupabaseUrl.value.trim();
      const key = dom.inputSupabaseKey.value.trim();

      dom.btnSaveSupabase.disabled = true;
      dom.btnSaveSupabase.innerHTML = '<span>Testando conexão...</span>';

      const test = await AuthManager.testSupabaseConnection(url, key);

      dom.btnSaveSupabase.disabled = false;
      dom.btnSaveSupabase.innerHTML = '<span>⚡ Salvar & Testar Conexão</span>';

      if (test.success) {
        AuthManager.saveSupabaseConfig(url, key);
        updateSupabasePill();
        if (dom.btnDisconnectSupabase) dom.btnDisconnectSupabase.style.display = 'inline-block';
        showToast('Supabase conectado com sucesso!');
        renderClientsList();
      } else {
        alert(test.message);
      }
    });
  }

  if (dom.btnSyncToSupabase) {
    dom.btnSyncToSupabase.addEventListener('click', async () => {
      dom.btnSyncToSupabase.disabled = true;
      dom.btnSyncToSupabase.textContent = 'Sincronizando...';

      const res = await AuthManager.syncLocalToSupabase();

      dom.btnSyncToSupabase.disabled = false;
      dom.btnSyncToSupabase.textContent = '🔄 Sincronizar Clientes Locais com o Supabase';

      showToast(res.message);
      renderClientsList();
    });
  }

  if (dom.btnDisconnectSupabase) {
    dom.btnDisconnectSupabase.addEventListener('click', () => {
      if (confirm('Deseja desconectar do Supabase e retornar ao armazenamento local?')) {
        AuthManager.saveSupabaseConfig('', '');
        dom.inputSupabaseUrl.value = '';
        dom.inputSupabaseKey.value = '';
        dom.btnDisconnectSupabase.style.display = 'none';
        updateSupabasePill();
        showToast('Supabase desconectado. Operando em modo local.');
        renderClientsList();
      }
    });
  }

  if (dom.btnCopySqlScript) {
    dom.btnCopySqlScript.addEventListener('click', () => {
      const sql = `CREATE TABLE IF NOT EXISTS public.clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'cliente',
    status TEXT NOT NULL DEFAULT 'ativo',
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Permitir leitura publica de clientes" ON public.clientes FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Permitir criacao de clientes" ON public.clientes FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Permitir atualizacao de clientes" ON public.clientes FOR UPDATE TO anon, authenticated USING (true);
CREATE POLICY "Permitir exclusao de clientes" ON public.clientes FOR DELETE TO anon, authenticated USING (true);`;
      copyToClipboard(sql);
      showToast('Script SQL copiado com sucesso! Cole no SQL Editor do Supabase.');
    });
  }
}

function updateSupabasePill() {
  if (!dom.supabasePill) return;
  const connected = AuthManager.isSupabaseConnected();
  if (connected) {
    dom.supabasePill.textContent = '● Supabase Conectado (Nuvem)';
    dom.supabasePill.className = 'supabase-status-pill connected';
  } else {
    dom.supabasePill.textContent = 'Modo Local (Offline)';
    dom.supabasePill.className = 'supabase-status-pill';
  }
}

// =====================================================================
// CARREGAMENTO DO CATÁLOGO DE VÍDEOS
// =====================================================================
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

function switchType(type) {
  state.activeType = type;
  [dom.btnTypeTodos, dom.btnTypeFilmes, dom.btnTypeSeries].forEach(b => b.classList.remove('active'));
  if (type === 'todos') dom.btnTypeTodos.classList.add('active');
  if (type === 'filmes') dom.btnTypeFilmes.classList.add('active');
  if (type === 'series') dom.btnTypeSeries.classList.add('active');

  buildCategoryChips();
  loadDestaques();
}

function buildCategoryChips() {
  if (!state.manifesto) return;

  if (dom.categorySelect) {
    dom.categorySelect.innerHTML = '';

    const optDestaques = document.createElement('option');
    optDestaques.value = 'destaques';
    optDestaques.textContent = '⭐ Lançamentos & Destaques';
    dom.categorySelect.appendChild(optDestaques);

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

  dom.categoriesChips.innerHTML = '';

  const chipDestaques = document.createElement('button');
  chipDestaques.className = `category-chip ${state.activeCategoryId === 'destaques' ? 'active' : ''}`;
  chipDestaques.innerHTML = `<span>⭐ Destaques</span>`;
  chipDestaques.onclick = () => loadDestaques();
  dom.categoriesChips.appendChild(chipDestaques);

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

function prepareHeroBanner() {
  if (!state.manifesto || !state.manifesto.categorias.length) return;
  const lancamentos = state.manifesto.categorias.find(c => c.id.includes('lancamentos')) || state.manifesto.categorias[0];
  if (lancamentos && lancamentos.destaques) {
    state.heroItems = lancamentos.destaques.filter(i => i.p && i.p.includes('http'));
  }

  if (state.heroItems.length > 0) {
    updateHeroItem(state.heroItems[0]);
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
    dom.btnHeroCopy.onclick = () => {
      if (state.currentUser && state.currentUser.role === 'admin') {
        copyToClipboard(item.u);
      }
    };
  }
  if (dom.btnHeroVlc) {
    dom.btnHeroVlc.onclick = () => {
      if (state.currentUser && state.currentUser.role === 'admin') {
        window.open(item.u, '_blank');
      }
    };
  }
}

function loadDestaques() {
  state.activeCategoryId = 'destaques';
  if (dom.categorySelect) dom.categorySelect.value = 'destaques';
  updateActiveChipHighlight();
  dom.currentViewTitle.textContent = "Lançamentos & Destaques";
  dom.activeCategoryTitle.textContent = "Exibindo Destaques Selecionados";

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

  state.rawItems = pool;
  refreshCatalogDisplay();
}

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

    state.rawItems = items.map(it => ({
      ...it,
      catNome: catName
    }));

    refreshCatalogDisplay();
  } catch (err) {
    console.error('Erro ao buscar dados da categoria:', err);
    dom.cardsGrid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #ef4444;">Erro ao carregar títulos desta categoria.</div>';
  }
}

// =====================================================================
// ORGANIZAÇÃO E AGRUPAMENTO DE SÉRIES
// =====================================================================
function setSeriesViewMode(mode) {
  state.seriesViewMode = mode;
  if (dom.btnViewAll) dom.btnViewAll.classList.toggle('active', mode === 'all');
  if (dom.btnViewGrouped) dom.btnViewGrouped.classList.toggle('active', mode === 'grouped');
  refreshCatalogDisplay();
}

function updateSeriesControlsVisibility() {
  if (!dom.seriesViewControls) return;
  const isSeriesCat = (state.activeType === 'series') || 
                      (state.activeCategoryId && (
                        state.activeCategoryId.includes('series') ||
                        state.activeCategoryId.includes('novelas') ||
                        state.activeCategoryId.includes('doramas') ||
                        state.activeCategoryId.includes('netflix') ||
                        state.activeCategoryId.includes('prime') ||
                        state.activeCategoryId.includes('max') ||
                        state.activeCategoryId.includes('disney') ||
                        state.activeCategoryId.includes('crunchyroll') ||
                        state.activeCategoryId.includes('turcas')
                      ));
  const hasEpisodes = state.rawItems && state.rawItems.some(it => parseEpisodeInfo(it.t).isEpisode);

  if (isSeriesCat || hasEpisodes) {
    dom.seriesViewControls.style.display = 'inline-flex';
  } else {
    dom.seriesViewControls.style.display = 'none';
  }
}

function refreshCatalogDisplay() {
  if (!state.rawItems) state.rawItems = [];
  updateSeriesControlsVisibility();

  if (state.seriesViewMode === 'grouped') {
    const { groups, nonSeries } = groupItemsBySeries(state.rawItems);
    state.currentItems = [...groups, ...nonSeries];
  } else {
    state.currentItems = [...state.rawItems];
  }

  if (dom.sortSelect && dom.sortSelect.value !== 'padrao') {
    applySortingInMemory(dom.sortSelect.value);
  }

  state.displayedCount = 0;
  dom.cardsGrid.innerHTML = '';
  renderNextBatch();

  if (state.seriesViewMode === 'grouped') {
    const groupCount = state.currentItems.filter(it => it.isGroup).length;
    dom.itemsFoundText.textContent = `${groupCount} séries agrupadas (${state.rawItems.length.toLocaleString()} episódios no total)`;
  } else {
    dom.itemsFoundText.textContent = `${state.currentItems.length.toLocaleString()} títulos disponíveis`;
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
    state.currentItems.sort((a, b) => (a.seriesName || a.t || '').localeCompare(b.seriesName || b.t || '', 'pt-BR'));
  } else if (sortType === 'za') {
    state.currentItems.sort((a, b) => (b.seriesName || b.t || '').localeCompare(a.seriesName || a.t || '', 'pt-BR'));
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

// =====================================================================
// PARSER DE EPISÓDIOS & IDENTIFICAÇÃO DE CAPÍTULOS
// =====================================================================
function parseEpisodeInfo(rawTitle) {
  if (!rawTitle || typeof rawTitle !== 'string') {
    return { isEpisode: false, seriesName: '', season: null, episode: null, episodeTitle: '', badge: '', label: '', shortBadge: '', cleanTitle: '' };
  }

  const title = rawTitle.trim();

  // 1. Padrão Clássico: S01E02, S1E2, T01E02, TEMP 01 EP 02, Temporada 1 Episodio 2
  // Ex: "90 Dias De Volta Pra Pista S04E01", "Breaking Bad T02E07 - O Retorno", "Dark S01 E03"
  const p1 = /^(.*?)\s*[\(\[\{]?(?:S|TEMP|TEMPORADA|T)\s*(\d{1,2})\s*[\s\.\-_]*\s*(?:E|EP|CAP|CAPITULO|EPS)\s*(\d{1,3})[\)\]\}]?(?:\s*[\-\:]?\s*(.*?))?$/i;
  let m = title.match(p1);
  if (m) {
    const seriesName = m[1].replace(/[\s\.\-_]+$/, '').trim() || title;
    const s = parseInt(m[2], 10);
    const e = parseInt(m[3], 10);
    const sStr = String(s).padStart(2, '0');
    const eStr = String(e).padStart(2, '0');
    const epTitle = m[4] ? m[4].replace(/^[\[\(].*?[\]\)]$/, '').trim() : '';
    return {
      isEpisode: true,
      seriesName,
      season: s,
      episode: e,
      episodeTitle: epTitle,
      badge: `T${sStr} • EP ${eStr}`,
      label: `Temporada ${s} • Episódio ${e}`,
      shortBadge: `T${sStr} E${eStr}`,
      cleanTitle: seriesName
    };
  }

  // 2. Padrão 01x05, 1x5
  // Ex: "Game of Thrones 01x05", "Lost 3x10"
  const p2 = /^(.*?)\s*[\(\[\{]?(\d{1,2})x(\d{1,3})[\)\]\}]?(?:\s*[\-\:]?\s*(.*?))?$/i;
  m = title.match(p2);
  if (m) {
    const seriesName = m[1].replace(/[\s\.\-_]+$/, '').trim() || title;
    const s = parseInt(m[2], 10);
    const e = parseInt(m[3], 10);
    const sStr = String(s).padStart(2, '0');
    const eStr = String(e).padStart(2, '0');
    const epTitle = m[4] ? m[4].trim() : '';
    return {
      isEpisode: true,
      seriesName,
      season: s,
      episode: e,
      episodeTitle: epTitle,
      badge: `T${sStr} • EP ${eStr}`,
      label: `Temporada ${s} • Episódio ${e}`,
      shortBadge: `T${sStr} E${eStr}`,
      cleanTitle: seriesName
    };
  }

  // 3. Padrão Capítulo / Episódio avulso (Novelas, Doramas, Animes):
  // Ex: "Amor de Mae Cap 45", "Renascer Capitulo 102", "Chaves Ep 12", "Naruto Ep 200"
  const p3 = /^(.*?)\s*[\(\[\{]?(?:EP|EPISODIO|CAP|CAPITULO)\s*[\.\-_]?\s*(\d{1,4})[\)\]\}]?(?:\s*[\-\:]?\s*(.*?))?$/i;
  m = title.match(p3);
  if (m) {
    const seriesName = m[1].replace(/[\s\.\-_]+$/, '').trim() || title;
    const e = parseInt(m[2], 10);
    const eStr = String(e).padStart(2, '0');
    const isCap = /cap/i.test(m[0]);
    return {
      isEpisode: true,
      seriesName,
      season: 1,
      episode: e,
      episodeTitle: m[3] ? m[3].trim() : '',
      badge: isCap ? `CAP ${eStr}` : `EP ${eStr}`,
      label: isCap ? `Capítulo ${e}` : `Episódio ${e}`,
      shortBadge: isCap ? `C${eStr}` : `E${eStr}`,
      cleanTitle: seriesName
    };
  }

  return {
    isEpisode: false,
    seriesName: title,
    season: null,
    episode: null,
    episodeTitle: '',
    badge: '',
    label: '',
    shortBadge: '',
    cleanTitle: title
  };
}

function groupItemsBySeries(items) {
  const groups = new Map();
  const nonSeries = [];

  items.forEach((item, originalIndex) => {
    const parsed = parseEpisodeInfo(item.t);
    if (parsed.isEpisode) {
      const key = parsed.seriesName.toLowerCase();
      if (!groups.has(key)) {
        groups.set(key, {
          isGroup: true,
          seriesName: parsed.seriesName,
          catNome: item.catNome || 'Série',
          poster: item.p,
          episodes: [],
          seasons: new Set()
        });
      }
      const g = groups.get(key);
      if (parsed.season) g.seasons.add(parsed.season);
      if ((!g.poster || g.poster === FALLBACK_POSTER) && item.p && item.p.startsWith('http')) {
        g.poster = item.p;
      }
      g.episodes.push({
        ...item,
        parsed,
        originalIndex
      });
    } else {
      nonSeries.push(item);
    }
  });

  // Ordena episódios de cada série cronologicamente (Temporada crescente, Episódio crescente)
  const groupList = Array.from(groups.values());
  groupList.forEach(g => {
    g.episodes.sort((a, b) => {
      const sDiff = (a.parsed.season || 1) - (b.parsed.season || 1);
      if (sDiff !== 0) return sDiff;
      return (a.parsed.episode || 1) - (b.parsed.episode || 1);
    });
    g.totalEpisodes = g.episodes.length;
    g.totalSeasons = g.seasons.size || 1;
    if ((!g.poster || g.poster === FALLBACK_POSTER) && g.episodes[0] && g.episodes[0].p) {
      g.poster = g.episodes[0].p;
    }
    g.u = g.episodes[0] ? g.episodes[0].u : '';
    g.t = g.seriesName;
    g.p = g.poster;
  });

  return {
    groups: groupList,
    nonSeries
  };
}

// =====================================================================
// CRIAÇÃO DE CARDS (SUPORTE A CAPÍTULOS, BADGES E AGRUPAMENTO)
// =====================================================================
function createSeriesGroupCard(group, index) {
  const card = document.createElement('div');
  card.className = 'video-card is-series-group';

  const posterUrl = group.poster && group.poster.startsWith('http') ? group.poster : FALLBACK_POSTER;
  const categoryName = group.catNome || 'Série';

  card.innerHTML = `
    <div class="card-poster">
      <img src="${posterUrl}" alt="${escapeHtml(group.seriesName)}" loading="lazy" onerror="this.src='${FALLBACK_POSTER}'">
      <span class="card-badge group-badge">${group.totalEpisodes} EPISÓDIOS</span>
      <div class="card-play-overlay">
        <div class="play-circle" title="Ver Episódios">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
    </div>
    <div class="card-body">
      <div class="card-chapter-pill">
        <span class="pill-dot"></span>
        <span>${group.totalEpisodes} Episódios • ${group.totalSeasons} Temporada${group.totalSeasons > 1 ? 's' : ''}</span>
      </div>
      <h4 class="card-title" title="${escapeHtml(group.seriesName)}">${escapeHtml(group.seriesName)}</h4>
      <span class="card-category">${escapeHtml(categoryName)}</span>
      <div class="card-actions">
        <button class="btn-card-action btn-view-series" title="Explorar todos os episódios">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          Ver Capítulos
        </button>
      </div>
    </div>
  `;

  card.querySelector('.card-play-overlay').onclick = () => openSeriesModal(group);
  card.querySelector('.btn-view-series').onclick = (e) => {
    e.stopPropagation();
    openSeriesModal(group);
  };

  return card;
}

function createVideoCard(item, index) {
  if (item.isGroup) {
    return createSeriesGroupCard(item, index);
  }

  const card = document.createElement('div');
  card.className = 'video-card';

  const posterUrl = item.p && item.p.startsWith('http') ? item.p : FALLBACK_POSTER;
  const categoryName = item.catNome || 'Filmes & Séries';
  const epInfo = parseEpisodeInfo(item.t);

  const isAdmin = state.currentUser && state.currentUser.role === 'admin';
  const isClient = !isAdmin;

  // Se NÃO for admin (cliente ou visitante), o botão de copiar link NÃO É RENDERIZADO! Apenas assistir.
  const copyBtnHtml = isAdmin ? `
    <button class="btn-card-action btn-copy" title="Copiar Link de Vídeo">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
      Link
    </button>
  ` : '';

  // Se for episódio, exibe badge com o episódio exato (ex: T04 • EP 01) e pílula no corpo
  const badgeHtml = epInfo.isEpisode
    ? `<span class="card-badge series-badge">${epInfo.badge}</span>`
    : `<span class="card-badge">HD / 4K</span>`;

  const chapterPillHtml = epInfo.isEpisode
    ? `<div class="card-chapter-pill"><span class="pill-dot"></span><span>${escapeHtml(epInfo.label)}</span></div>`
    : '';

  const displayTitle = epInfo.isEpisode ? epInfo.seriesName : item.t;

  card.innerHTML = `
    <div class="card-poster">
      <img src="${posterUrl}" alt="${escapeHtml(item.t)}" loading="lazy" onerror="this.src='${FALLBACK_POSTER}'">
      ${badgeHtml}
      <div class="card-play-overlay">
        <div class="play-circle">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
        </div>
      </div>
    </div>
    <div class="card-body">
      ${chapterPillHtml}
      <h4 class="card-title" title="${escapeHtml(item.t)}">${escapeHtml(displayTitle)}</h4>
      <span class="card-category">${escapeHtml(categoryName)}</span>
      <div class="card-actions">
        <button class="btn-card-action btn-play" title="Assistir Agora">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Assistir
        </button>
        ${copyBtnHtml}
      </div>
    </div>
  `;

  // Eventos de Reprodução
  card.querySelector('.card-play-overlay').onclick = () => openPlayer(item.t, categoryName, item.u, item);
  card.querySelector('.btn-play').onclick = () => openPlayer(item.t, categoryName, item.u, item);

  const btnCopy = card.querySelector('.btn-copy');
  if (btnCopy) {
    btnCopy.onclick = (e) => {
      e.stopPropagation();
      copyToClipboard(item.u);
    };
  }

  // Previne menu de contexto e inspeção para clientes
  if (isClient) {
    card.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  return card;
}

// =====================================================================
// BUSCA DE TÍTULOS
// =====================================================================
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

  try {
    const apiResp = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (apiResp.ok) {
      const results = await apiResp.json();
      displaySearchResults(results, query);
      return;
    }
  } catch (e) {
    // API backend local indisponível, fallback em memória
  }

  const lowerQ = query.toLowerCase();
  const pool = state.rawItems || state.currentItems || [];
  const matched = pool.filter(item => item.t && item.t.toLowerCase().includes(lowerQ));
  displaySearchResults(matched, query);
}

function displaySearchResults(results, query) {
  state.rawItems = results;
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

  refreshCatalogDisplay();
  dom.itemsFoundText.textContent = `${results.length.toLocaleString()} títulos encontrados`;
}

// =====================================================================
// PLAYER DE VÍDEO & NAVEGAÇÃO DE SÉRIES
// =====================================================================
function openPlayer(title, category, url, itemObj = null) {
  dom.modalVideoTitle.textContent = title;
  dom.modalCategoryBadge.textContent = category;

  // Informações de Episódio / Navegação Binge
  const epInfo = parseEpisodeInfo(title);
  if (epInfo.isEpisode) {
    if (dom.modalEpisodeBadge) {
      dom.modalEpisodeBadge.textContent = epInfo.badge;
      dom.modalEpisodeBadge.style.display = 'inline-block';
    }
    setupPlayerSeriesNavigation(epInfo, url, category);
  } else {
    if (dom.modalEpisodeBadge) dom.modalEpisodeBadge.style.display = 'none';
    if (dom.playerEpisodeNav) dom.playerEpisodeNav.style.display = 'none';
    if (dom.playerSeriesStrip) dom.playerSeriesStrip.style.display = 'none';
    state.activeSeriesContext = null;
  }

  // Apenas admin tem visualização e cópia do link direto
  const isAdmin = state.currentUser && state.currentUser.role === 'admin';
  if (isAdmin) {
    if (dom.streamUrlDisplay) dom.streamUrlDisplay.value = url;
    if (dom.btnModalOpenVlc) {
      dom.btnModalOpenVlc.href = `vlc://${url}`;
      dom.btnModalOpenVlc.style.display = 'inline-flex';
    }
    if (dom.btnCopyModalUrl) dom.btnCopyModalUrl.style.display = 'inline-flex';
  } else {
    if (dom.streamUrlDisplay) {
      dom.streamUrlDisplay.value = '';
      dom.streamUrlDisplay.removeAttribute('value');
    }
    if (dom.btnModalOpenVlc) {
      dom.btnModalOpenVlc.removeAttribute('href');
      dom.btnModalOpenVlc.style.display = 'none';
    }
    if (dom.btnCopyModalUrl) {
      dom.btnCopyModalUrl.style.display = 'none';
    }
  }

  openModal(dom.playerModal);

  const video = dom.htmlVideoPlayer;
  dom.playerLoading.classList.add('active');

  // Previne menu de contexto e clique direito no player para clientes
  if (!isAdmin) {
    video.oncontextmenu = (e) => { e.preventDefault(); return false; };
  }

  if (state.hlsPlayer) {
    state.hlsPlayer.destroy();
    state.hlsPlayer = null;
  }

  const playableUrl = getPlayableUrl(url);

  if (url.includes('.m3u8')) {
    if (Hls.isSupported()) {
      state.hlsPlayer = new Hls({
        debug: false,
        enableWorker: true
      });
      state.hlsPlayer.loadSource(playableUrl);
      state.hlsPlayer.attachMedia(video);
      state.hlsPlayer.on(Hls.Events.MANIFEST_PARSED, () => {
        dom.playerLoading.classList.remove('active');
        video.play().catch(() => console.log('Autoplay com som restrito pelo navegador'));
      });
      state.hlsPlayer.on(Hls.Events.ERROR, () => {
        dom.playerLoading.classList.remove('active');
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = playableUrl;
      video.play().catch(() => console.log('Autoplay bloqueado'));
    }
  } else {
    video.src = playableUrl;
    video.load();
    video.play().then(() => {
      dom.playerLoading.classList.remove('active');
    }).catch(() => {
      dom.playerLoading.classList.remove('active');
    });
  }

  // Auto-play próximo episódio ao finalizar o vídeo
  video.onended = () => {
    if (state.activeSeriesContext) {
      const { currentIndex, episodes } = state.activeSeriesContext;
      if (currentIndex < episodes.length - 1) {
        showToast('Próximo capítulo iniciando...');
        setTimeout(() => playNextEpisode(), 1500);
      }
    }
  };

  // Fallback inteligente caso o navegador bloqueie o stream direto
  video.onerror = () => {
    if (!dom.playerModal || !dom.playerModal.classList.contains('active')) {
      return;
    }
    dom.playerLoading.classList.remove('active');
    const proxiedUrl = getPlayableUrl(url, true);
    if (!video.src.includes('/api/stream') && video.src !== proxiedUrl && dom.playerModal.classList.contains('active')) {
      console.log('Tentando reproduzir através do proxy seguro /api/stream...');
      video.src = proxiedUrl;
      video.load();
      video.play().catch(() => {});
    }
  };

  const hidePlayerLoading = () => {
    if (dom.playerLoading) {
      dom.playerLoading.classList.remove('active');
    }
  };

  video.oncanplay = hidePlayerLoading;
  video.onplaying = hidePlayerLoading;
  video.onloadeddata = hidePlayerLoading;
  video.onplay = hidePlayerLoading;
  video.onwaiting = null;
}

function setupPlayerSeriesNavigation(epInfo, currentUrl, category) {
  let pool = state.rawItems || state.currentItems || [];
  let seriesEpisodes = pool.filter(it => {
    if (!it.t) return false;
    const itEp = parseEpisodeInfo(it.t);
    return itEp.isEpisode && itEp.seriesName.toLowerCase() === epInfo.seriesName.toLowerCase();
  });

  if (!seriesEpisodes.length) {
    if (dom.playerEpisodeNav) dom.playerEpisodeNav.style.display = 'none';
    if (dom.playerSeriesStrip) dom.playerSeriesStrip.style.display = 'none';
    state.activeSeriesContext = null;
    return;
  }

  seriesEpisodes.sort((a, b) => {
    const epA = parseEpisodeInfo(a.t);
    const epB = parseEpisodeInfo(b.t);
    const sDiff = (epA.season || 1) - (epB.season || 1);
    if (sDiff !== 0) return sDiff;
    return (epA.episode || 1) - (epB.episode || 1);
  });

  const currentIndex = seriesEpisodes.findIndex(it => it.u === currentUrl || it.t === epInfo.cleanTitle || (parseEpisodeInfo(it.t).season === epInfo.season && parseEpisodeInfo(it.t).episode === epInfo.episode));
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  state.activeSeriesContext = {
    seriesName: epInfo.seriesName,
    category,
    episodes: seriesEpisodes,
    currentIndex: activeIdx
  };

  // Atualiza botões Anterior / Próximo
  if (dom.playerEpisodeNav) {
    dom.playerEpisodeNav.style.display = 'inline-flex';
    if (dom.btnPrevEp) dom.btnPrevEp.disabled = activeIdx <= 0;
    if (dom.btnNextEp) dom.btnNextEp.disabled = activeIdx >= seriesEpisodes.length - 1;
  }

  // Atualiza barra de capítulos
  if (dom.playerSeriesStrip && dom.playerStripScroll) {
    dom.playerSeriesStrip.style.display = 'flex';
    if (dom.stripSeriesName) dom.stripSeriesName.textContent = epInfo.seriesName;
    if (dom.stripEpCount) dom.stripEpCount.textContent = `${seriesEpisodes.length} capítulos`;

    dom.playerStripScroll.innerHTML = '';
    seriesEpisodes.forEach((epItem, idx) => {
      const parsedEp = parseEpisodeInfo(epItem.t);
      const btn = document.createElement('button');
      btn.className = `btn-strip-ep ${idx === activeIdx ? 'active' : ''}`;
      btn.textContent = parsedEp.badge || `EP ${idx + 1}`;
      btn.title = epItem.t;
      btn.onclick = () => {
        openPlayer(epItem.t, category, epItem.u, epItem);
      };
      dom.playerStripScroll.appendChild(btn);

      if (idx === activeIdx) {
        setTimeout(() => btn.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }), 100);
      }
    });
  }
}

function playPreviousEpisode() {
  if (!state.activeSeriesContext) return;
  const { episodes, currentIndex, category } = state.activeSeriesContext;
  if (currentIndex > 0) {
    const prevEp = episodes[currentIndex - 1];
    openPlayer(prevEp.t, category, prevEp.u, prevEp);
  }
}

function playNextEpisode() {
  if (!state.activeSeriesContext) return;
  const { episodes, currentIndex, category } = state.activeSeriesContext;
  if (currentIndex < episodes.length - 1) {
    const nextEp = episodes[currentIndex + 1];
    openPlayer(nextEp.t, category, nextEp.u, nextEp);
  }
}

// =====================================================================
// MODAL DE DETALHES DA SÉRIE (TEMPORADAS & LISTA DE EPISÓDIOS)
// =====================================================================
function openSeriesModal(seriesGroup) {
  state.activeSeriesGroup = seriesGroup;

  dom.seriesModalPoster.src = seriesGroup.poster || FALLBACK_POSTER;
  dom.seriesModalPoster.onerror = () => { dom.seriesModalPoster.src = FALLBACK_POSTER; };
  dom.seriesModalTitle.textContent = seriesGroup.seriesName;
  dom.seriesModalCategory.textContent = seriesGroup.catNome || 'SÉRIE';
  dom.seriesModalTotalEpisodes.textContent = `${seriesGroup.totalEpisodes} episódios`;
  dom.seriesModalTotalSeasons.textContent = `${seriesGroup.totalSeasons} temporada${seriesGroup.totalSeasons > 1 ? 's' : ''}`;

  // Organiza episódios por temporada
  const seasonsMap = new Map();
  seriesGroup.episodes.forEach(ep => {
    const s = ep.parsed.season || 1;
    if (!seasonsMap.has(s)) seasonsMap.set(s, []);
    seasonsMap.get(s).push(ep);
  });

  const seasonNumbers = Array.from(seasonsMap.keys()).sort((a, b) => a - b);
  const activeSeason = seasonNumbers[0] || 1;

  // Renderiza tabs de temporadas
  dom.seriesSeasonsBar.innerHTML = '';
  seasonNumbers.forEach((sNum) => {
    const tab = document.createElement('button');
    tab.className = `season-tab-btn ${sNum === activeSeason ? 'active' : ''}`;
    tab.textContent = `Temporada ${sNum} (${seasonsMap.get(sNum).length})`;
    tab.onclick = () => {
      document.querySelectorAll('.season-tab-btn').forEach(b => b.classList.remove('active'));
      tab.classList.add('active');
      renderSeasonEpisodes(seasonsMap.get(sNum), seriesGroup);
    };
    dom.seriesSeasonsBar.appendChild(tab);
  });

  renderSeasonEpisodes(seasonsMap.get(activeSeason) || seriesGroup.episodes, seriesGroup);

  openModal(dom.seriesModal);
}

function renderSeasonEpisodes(episodes, seriesGroup) {
  dom.seriesEpisodesGrid.innerHTML = '';

  if (!episodes || !episodes.length) {
    dom.seriesEpisodesGrid.innerHTML = '<div style="color: #64748b; padding: 20px;">Nenhum episódio encontrado nesta temporada.</div>';
    return;
  }

  episodes.forEach(ep => {
    const itemEl = document.createElement('div');
    itemEl.className = 'series-ep-item';

    const parsed = ep.parsed;
    const epTitle = parsed.episodeTitle || parsed.label;

    itemEl.innerHTML = `
      <div class="series-ep-info">
        <span class="series-ep-badge">${parsed.badge}</span>
        <span class="series-ep-title" title="${escapeHtml(ep.t)}">${escapeHtml(epTitle)}</span>
      </div>
      <button class="series-ep-play-btn" title="Assistir ${escapeHtml(parsed.badge)}">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <polygon points="5 3 19 12 5 21 5 3"></polygon>
        </svg>
      </button>
    `;

    itemEl.onclick = () => {
      closeModal(dom.seriesModal);
      openPlayer(ep.t, seriesGroup.catNome || 'Série', ep.u, ep);
    };

    dom.seriesEpisodesGrid.appendChild(itemEl);
  });
}

function getPlayableUrl(rawUrl, forceProxy = false) {
  if (!rawUrl) return '';
  // Se estiver rodando em HTTPS (ex: Vercel) ou forçado:
  // Navegadores bloqueiam streams HTTP (Mixed Content).
  // O proxy /api/stream resolve os redirecionamentos no backend e entrega via HTTPS.
  if (forceProxy || window.location.protocol === 'https:' || (!rawUrl.startsWith('http://localhost') && !rawUrl.startsWith('http://127.0.0.1') && window.location.hostname.includes('vercel.app'))) {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return `/api/stream?url=${encodeURIComponent(rawUrl)}`;
    }
  }
  return rawUrl;
}

function stopVideoPlayback() {
  const video = dom.htmlVideoPlayer;
  if (video) {
    // Remove callbacks para evitar loops ou re-ativação acidental
    video.onerror = null;
    video.onplaying = null;
    video.onwaiting = null;
    video.oncanplay = null;
    video.onloadeddata = null;

    // Pausa imediata
    try {
      video.pause();
    } catch (e) {}

    // Limpa fontes de reprodução e tempo
    video.removeAttribute('src');
    video.srcObject = null;
    video.src = '';
    video.currentTime = 0;

    // Força o navegador a descarregar buffers de áudio/vídeo da memória
    try {
      video.load();
    } catch (e) {}
  }

  // Destrói Hls.js se ativo
  if (state.hlsPlayer) {
    try {
      state.hlsPlayer.stopLoad();
      state.hlsPlayer.detachMedia();
      state.hlsPlayer.destroy();
    } catch (e) {}
    state.hlsPlayer = null;
  }
}

function closePlayerModal() {
  stopVideoPlayback();
  if (dom.playerModal) {
    closeModal(dom.playerModal);
  }
  // Garantia absoluta de desbloqueio da rolagem da página
  const anyActive = document.querySelector('.modal-overlay.active');
  if (!anyActive && (!dom.loginScreen || dom.loginScreen.style.display !== 'flex')) {
    document.body.classList.remove('modal-open');
  }
}

// =====================================================================
// UTILITÁRIOS
// =====================================================================
function copyToClipboard(text) {
  // Apenas Admin pode copiar links
  if (state.currentUser && state.currentUser.role === 'cliente') {
    return;
  }

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

  showToast('Copiado com sucesso!');
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
