/**
 * K-Cine - Módulo de Autenticação e Gestão de Clientes
 * Suporta Supabase na nuvem + Fallback em Armazenamento Local
 */

const AuthManager = (() => {
  const STORAGE_KEYS = {
    SESSION: 'cinestream_user_session',
    CONFIG: 'cinestream_supabase_config',
    CLIENTS: 'cinestream_local_clientes'
  };

  let supabase = null;

  // Clientes padrão para início imediato
  const DEFAULT_CLIENTS = [
    {
      id: 'admin-1',
      username: 'kayna',
      password: 'admin123',
      role: 'admin',
      status: 'ativo',
      notes: 'Kaynã - Proprietário & Administrador Geral',
      created_at: new Date().toISOString()
    },
    {
      id: 'admin-2',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      status: 'ativo',
      notes: 'Administrador Master do Sistema',
      created_at: new Date().toISOString()
    },
    {
      id: 'cli-demo',
      username: 'cliente1',
      password: '123456',
      role: 'cliente',
      status: 'ativo',
      notes: 'Acesso VIP de Teste',
      created_at: new Date().toISOString()
    }
  ];

  // Inicialização
  function init() {
    initLocalClients();
    initSupabase();
  }

  function initLocalClients() {
    const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    if (!stored) {
      localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(DEFAULT_CLIENTS));
    }
  }

  function getLocalClients() {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      return stored ? JSON.parse(stored) : DEFAULT_CLIENTS;
    } catch (e) {
      return DEFAULT_CLIENTS;
    }
  }

  function saveLocalClients(list) {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(list));
  }

  // Inicializa o cliente do Supabase com as credenciais salvas
  function initSupabase() {
    try {
      const config = getSupabaseConfig();
      if (config && config.url && config.anonKey && window.supabase) {
        supabase = window.supabase.createClient(config.url, config.anonKey);
        console.log('[Auth] Supabase conectado com sucesso.');
      } else {
        supabase = null;
      }
    } catch (err) {
      console.warn('[Auth] Erro ao inicializar Supabase:', err);
      supabase = null;
    }
  }

  function getSupabaseConfig() {
    try {
      const cfg = localStorage.getItem(STORAGE_KEYS.CONFIG);
      return cfg ? JSON.parse(cfg) : null;
    } catch (e) {
      return null;
    }
  }

  function saveSupabaseConfig(url, anonKey) {
    const cleanUrl = (url || '').trim().replace(/\/$/, '');
    const cleanKey = (anonKey || '').trim();
    if (!cleanUrl || !cleanKey) {
      localStorage.removeItem(STORAGE_KEYS.CONFIG);
      supabase = null;
      return false;
    }
    localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
    initSupabase();
    return true;
  }

  function isSupabaseConnected() {
    return !!supabase;
  }

  // Testar conexão com Supabase
  async function testSupabaseConnection(url, anonKey) {
    try {
      if (!window.supabase) {
        return { success: false, message: 'Biblioteca Supabase SDK ainda não foi carregada.' };
      }
      const testClient = window.supabase.createClient(url.trim(), anonKey.trim());
      const { data, error } = await testClient.from('clientes').select('id').limit(1);
      if (error) {
        return { success: false, message: `Erro no Supabase: ${error.message} (Verifique se executou o script supabase_schema.sql no SQL Editor).` };
      }
      return { success: true, message: 'Conexão com o Supabase estabelecida com sucesso!' };
    } catch (e) {
      return { success: false, message: `Falha na requisição: ${e.message}` };
    }
  }

  // Sessão atual
  function getCurrentUser() {
    try {
      const session = localStorage.getItem(STORAGE_KEYS.SESSION);
      return session ? JSON.parse(session) : null;
    } catch (e) {
      return null;
    }
  }

  function setSession(user) {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(user));
  }

  function logout() {
    localStorage.removeItem(STORAGE_KEYS.SESSION);
  }

  // Login de usuário ou cliente
  async function login(username, password) {
    const cleanUsername = (username || '').trim().toLowerCase();
    const cleanPassword = (password || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Por favor, informe seu usuário e senha.' };
    }

    // 1. Se o Supabase estiver ativo, verifica prioritariamente nele
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .ilike('username', cleanUsername)
          .eq('password', cleanPassword)
          .maybeSingle();

        if (error) {
          console.warn('[Auth] Erro na consulta do Supabase, verificando modo local:', error);
        } else if (data) {
          if (data.status === 'bloqueado') {
            return {
              success: false,
              blocked: true,
              message: 'Seu acesso está bloqueado pelo administrador. Entre em contato para regularizar seu plano.'
            };
          }
          const userObj = {
            id: data.id,
            username: data.username,
            role: data.role || 'cliente',
            status: data.status || 'ativo',
            notes: data.notes || ''
          };
          setSession(userObj);
          return { success: true, user: userObj };
        }
      } catch (err) {
        console.warn('[Auth] Falha de rede no Supabase, tentando local:', err);
      }
    }

    // 2. Verificação no Armazenamento Local (Offline ou Fallback)
    const localClients = getLocalClients();
    const user = localClients.find(
      c => c.username.toLowerCase() === cleanUsername && c.password === cleanPassword
    );

    if (!user) {
      return { success: false, message: 'Usuário ou senha incorretos. Verifique suas credenciais.' };
    }

    if (user.status === 'bloqueado') {
      return {
        success: false,
        blocked: true,
        message: 'Seu acesso está bloqueado pelo administrador. Entre em contato para regularizar seu plano.'
      };
    }

    const userObj = {
      id: user.id,
      username: user.username,
      role: user.role || 'cliente',
      status: user.status || 'ativo',
      notes: user.notes || ''
    };
    setSession(userObj);
    return { success: true, user: userObj };
  }

  // Verifica em tempo real se o usuário ativo ainda está desbloqueado
  async function verifyCurrentSession() {
    const user = getCurrentUser();
    if (!user) return null;

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('status, role')
          .ilike('username', user.username)
          .maybeSingle();

        if (!error && data) {
          if (data.status === 'bloqueado') {
            logout();
            return { valid: false, blocked: true };
          }
          user.status = data.status;
          user.role = data.role;
          setSession(user);
          return { valid: true, user };
        }
      } catch (e) {
        // Ignora erro de rede temporário
      }
    }

    // Checagem local
    const localClients = getLocalClients();
    const found = localClients.find(c => c.username.toLowerCase() === user.username.toLowerCase());
    if (found) {
      if (found.status === 'bloqueado') {
        logout();
        return { valid: false, blocked: true };
      }
      return { valid: true, user };
    }

    return { valid: true, user };
  }

  // Listar todos os clientes (Apenas Admin)
  async function listClients() {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Atualiza o cache local
          saveLocalClients(data);
          return data;
        }
      } catch (e) {
        console.warn('[Auth] Erro ao buscar do Supabase, usando local:', e);
      }
    }
    return getLocalClients();
  }

  // Criar novo cliente
  async function createClient(username, password, notes = '') {
    const cleanUsername = (username || '').trim();
    const cleanPassword = (password || '').trim();
    const cleanNotes = (notes || '').trim();

    if (!cleanUsername || !cleanPassword) {
      return { success: false, message: 'Nome de usuário e senha são obrigatórios.' };
    }

    if (cleanUsername.length < 3) {
      return { success: false, message: 'O nome de usuário deve ter pelo menos 3 caracteres.' };
    }

    // Verificar duplicidade local
    const local = getLocalClients();
    if (local.some(c => c.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, message: `O usuário "${cleanUsername}" já existe no catálogo.` };
    }

    const newClient = {
      id: 'cli-' + Date.now(),
      username: cleanUsername,
      password: cleanPassword,
      role: 'cliente',
      status: 'ativo',
      notes: cleanNotes,
      created_at: new Date().toISOString()
    };

    // Salva no Supabase se conectado
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('clientes')
          .insert([{
            username: cleanUsername,
            password: cleanPassword,
            role: 'cliente',
            status: 'ativo',
            notes: cleanNotes
          }])
          .select()
          .single();

        if (error) {
          return { success: false, message: `Erro ao salvar no Supabase: ${error.message}` };
        }
        if (data) {
          newClient.id = data.id;
        }
      } catch (err) {
        return { success: false, message: `Falha de rede ao conectar com Supabase: ${err.message}` };
      }
    }

    // Salva no armazenamento local
    local.unshift(newClient);
    saveLocalClients(local);

    return { success: true, client: newClient };
  }

  // Alternar Bloqueio / Desbloqueio do Cliente
  async function toggleBlockClient(clientId) {
    const local = getLocalClients();
    const client = local.find(c => c.id === clientId || c.username === clientId);
    if (!client) {
      return { success: false, message: 'Cliente não encontrado.' };
    }

    const newStatus = client.status === 'ativo' ? 'bloqueado' : 'ativo';
    client.status = newStatus;
    client.updated_at = new Date().toISOString();

    if (supabase) {
      try {
        await supabase
          .from('clientes')
          .update({ status: newStatus, updated_at: client.updated_at })
          .eq('id', client.id);
      } catch (e) {
        console.warn('[Auth] Erro ao sincronizar bloqueio com Supabase:', e);
      }
    }

    saveLocalClients(local);
    return { success: true, newStatus, client };
  }

  // Redefinir Senha do Cliente (Apenas Admin pode fazer isso)
  async function updateClientPassword(clientId, newPassword) {
    const cleanPw = (newPassword || '').trim();
    if (!cleanPw) {
      return { success: false, message: 'A nova senha não pode ser vazia.' };
    }

    const local = getLocalClients();
    const client = local.find(c => c.id === clientId || c.username === clientId);
    if (!client) {
      return { success: false, message: 'Cliente não encontrado.' };
    }

    client.password = cleanPw;
    client.updated_at = new Date().toISOString();

    if (supabase) {
      try {
        await supabase
          .from('clientes')
          .update({ password: cleanPw, updated_at: client.updated_at })
          .eq('id', client.id);
      } catch (e) {
        console.warn('[Auth] Erro ao sincronizar nova senha com Supabase:', e);
      }
    }

    saveLocalClients(local);
    return { success: true, client };
  }

  // Excluir Cliente
  async function deleteClient(clientId) {
    let local = getLocalClients();
    const client = local.find(c => c.id === clientId || c.username === clientId);
    if (!client) {
      return { success: false, message: 'Cliente não encontrado.' };
    }

    if (client.username === 'admin' || client.username === 'kayna') {
      return { success: false, message: 'Não é permitido excluir os administradores principais.' };
    }

    if (supabase) {
      try {
        await supabase
          .from('clientes')
          .delete()
          .eq('id', client.id);
      } catch (e) {
        console.warn('[Auth] Erro ao excluir do Supabase:', e);
      }
    }

    local = local.filter(c => c.id !== clientId && c.username !== clientId);
    saveLocalClients(local);
    return { success: true };
  }

  // Sincronizar clientes locais para o Supabase
  async function syncLocalToSupabase() {
    if (!supabase) {
      return { success: false, message: 'Supabase não está configurado ou conectado.' };
    }

    try {
      const local = getLocalClients();
      let syncedCount = 0;

      for (const item of local) {
        const { error } = await supabase
          .from('clientes')
          .upsert({
            username: item.username,
            password: item.password,
            role: item.role || 'cliente',
            status: item.status || 'ativo',
            notes: item.notes || ''
          }, { onConflict: 'username' });

        if (!error) syncedCount++;
      }

      // Atualiza a lista local com os dados finais do Supabase
      const { data } = await supabase.from('clientes').select('*');
      if (data) saveLocalClients(data);

      return { success: true, count: syncedCount, message: `${syncedCount} clientes sincronizados com o Supabase com sucesso!` };
    } catch (err) {
      return { success: false, message: `Erro durante sincronização: ${err.message}` };
    }
  }

  // Inicializa ao carregar
  init();

  return {
    init,
    login,
    logout,
    getCurrentUser,
    verifyCurrentSession,
    listClients,
    createClient,
    toggleBlockClient,
    updateClientPassword,
    deleteClient,
    getSupabaseConfig,
    saveSupabaseConfig,
    isSupabaseConnected,
    testSupabaseConnection,
    syncLocalToSupabase
  };
})();
