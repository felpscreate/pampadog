/**
 * PAMPA DOG - admin.js
 * Lógica do painel de administração (admin.html)
 */
document.addEventListener('DOMContentLoaded', () => {
  if (typeof PD === 'undefined') {
    alert('Erro: data.js não carregado!');
    return;
  }

  const listEl = document.getElementById('admin-list');
  const tabsEl = document.getElementById('admin-tabs');
  const header = document.getElementById('header');
  const modal = document.getElementById('edit-modal');
  const form = document.getElementById('edit-form');
  const imgInput = document.getElementById('edit-img-cardapio');
  const imgUpload = document.getElementById('edit-img-upload');
  const imgPreview = document.getElementById('edit-img-preview');
  const imgUploadName = document.getElementById('edit-img-upload-name');
  const linkTypeSelect = document.getElementById('edit-link-type');
  const productUrlInput = document.getElementById('edit-product-url');
  const productUrlGroup = document.getElementById('edit-product-url-group');
  const loginScreen = document.getElementById('admin-login-screen');
  const loginForm = document.getElementById('admin-login-form');
  const loginUserInput = document.getElementById('admin-login-user');
  const loginPasswordInput = document.getElementById('admin-login-password');
  const loginError = document.getElementById('admin-login-error');
  const logoutBtn = document.getElementById('btn-admin-logout');
  const mainEl = document.querySelector('main');
  const mobileFab = document.getElementById('admin-mobile-fab');
  const mobileFabMenu = document.getElementById('admin-mobile-fab-menu');
  const mobileAddBtn = document.getElementById('admin-mobile-add');
  const mobileBackupBtn = document.getElementById('admin-mobile-backup');
  const flagPromocaoInput = document.getElementById('edit-flag-promocao');
  const flagMaisPedidoInput = document.getElementById('edit-flag-mais-pedido');
  const flagProdutoSemanaInput = document.getElementById('edit-flag-produto-semana');
  const flag50OffInput = document.getElementById('edit-flag-50off');
  const AUTH_KEY = 'pampaDog_admin_auth';
  const AUTH_USER = 'pampadogmg';
  const AUTH_PASS = 'P4mp@dogrs';
  
  let currentCategory = 'all';
  let selectedUploadUrl = '';
  let selectedUploadFile = null;
  let initialized = false;

  function isAuthenticated() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === '1';
    } catch (e) {
      return false;
    }
  }

  function setAuthenticated(value) {
    try {
      if (value) sessionStorage.setItem(AUTH_KEY, '1');
      else sessionStorage.removeItem(AUTH_KEY);
    } catch (e) {}
  }

  function showLogin() {
    if (loginScreen) loginScreen.style.display = 'flex';
    if (header) header.style.display = 'none';
    if (mainEl) mainEl.style.display = 'none';
    if (modal) {
      modal.classList.remove('active');
      modal.style.display = 'none';
    }
    if (loginUserInput) loginUserInput.focus();
  }

  async function showAdmin() {
    if (loginScreen) loginScreen.style.display = 'none';
    if (header) header.style.display = '';
    if (mainEl) mainEl.style.display = '';
    if (modal) modal.style.display = '';
    if (!initialized) {
      initialized = true;
      await init();
    }
  }

  function setupAuth() {
    if (loginForm) {
      loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const user = (loginUserInput.value || '').trim();
        const pass = loginPasswordInput.value || '';

        if (user === AUTH_USER && pass === AUTH_PASS) {
          setAuthenticated(true);
          if (loginError) loginError.style.display = 'none';
          loginPasswordInput.value = '';
          await showAdmin();
        } else if (loginError) {
          loginError.style.display = 'block';
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        setAuthenticated(false);
        showLogin();
      });
    }

    if (isAuthenticated()) showAdmin();
    else showLogin();
  }

  function resolveAdminAssetPath(src) {
    if (!src) return '';
    if (/^(https?:|data:|blob:|\/)/i.test(src)) return src;
    return '../' + src.replace(/^\.\//, '');
  }

  function normalizeCategoryKey(category) {
    return String(category || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function normalizeCategory(category) {
    const key = normalizeCategoryKey(category);
    const aliases = {
      all: 'all',
      todos: 'all',
      todas: 'all',
      hotdog: 'hotdogs',
      hotdogs: 'hotdogs',
      'hot dog': 'hotdogs',
      'hot dogs': 'hotdogs',
      classico: 'classicos',
      classicos: 'classicos',
      'classicos do rio grande do sul': 'classicos',
      burger: 'classicos',
      burgers: 'classicos',
      combo: 'combos',
      combos: 'combos',
      bebida: 'bebidas',
      bebidas: 'bebidas'
    };

    if (aliases[key]) return aliases[key];

    const matchingCategory = Object.entries(PD.catLabel).find(([cat, label]) => {
      return normalizeCategoryKey(cat) === key || normalizeCategoryKey(label) === key;
    });

    return matchingCategory ? matchingCategory[0] : key;
  }

  function setActiveCategory(category) {
    const normalizedCategory = normalizeCategory(category);
    currentCategory = normalizedCategory === 'all' ||
      Object.prototype.hasOwnProperty.call(PD.catLabel, normalizedCategory)
      ? normalizedCategory
      : 'all';

    tabsEl.querySelectorAll('.admin-tab').forEach(button => {
      const isActive = normalizeCategory(button.dataset.cat) === currentCategory;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    });
  }

  function getAdminCardBackground(category) {
    const colors = {
      hotdogs: 'rgba(255, 230, 120, 0.12)',
      classicos: 'rgba(255, 120, 120, 0.10)',
      combos: 'rgba(120, 220, 140, 0.10)',
      bebidas: 'rgba(180, 140, 100, 0.10)'
    };
    return colors[normalizeCategory(category)] || 'var(--dark-2)';
  }

  function isWhatsappUrl(url) {
    return /(wa\.me|whatsa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(url || '');
  }

  function resolveLinkType(product) {
    if (product && (product.linkType === 'whatsapp' || product.linkType === 'outros')) return product.linkType;
    return product && product.productUrl && !isWhatsappUrl(product.productUrl) ? 'outros' : 'whatsapp';
  }

  function syncLinkTypeFields() {
    const isWhatsapp = linkTypeSelect.value === 'whatsapp';
    productUrlGroup.style.display = isWhatsapp ? 'none' : 'block';
    productUrlInput.disabled = isWhatsapp;
    if (isWhatsapp) productUrlInput.value = '';
  }

  function syncFlagFields(product) {
    if (flagPromocaoInput) flagPromocaoInput.checked = !!(product && product.isPromocao);
    if (flagMaisPedidoInput) flagMaisPedidoInput.checked = !!(product && product.isMaisPedido);
    if (flagProdutoSemanaInput) flagProdutoSemanaInput.checked = !!(product && product.isProdutoSemana);
    if (flag50OffInput) flag50OffInput.checked = !!(product && product.is50Off);
  }

  function getFlagFields() {
    return {
      isPromocao: !!(flagPromocaoInput && flagPromocaoInput.checked),
      isMaisPedido: !!(flagMaisPedidoInput && flagMaisPedidoInput.checked),
      isProdutoSemana: !!(flagProdutoSemanaInput && flagProdutoSemanaInput.checked),
      is50Off: !!(flag50OffInput && flag50OffInput.checked)
    };
  }

  function setImagePreview(src) {
    const previewSrc = resolveAdminAssetPath(src);
    imgPreview.innerHTML = previewSrc ? `<img src="${previewSrc}" alt="Prévia da imagem">` : '';
    imgPreview.style.display = previewSrc ? 'block' : 'none';
  }

  function resetUploadPreview() {
    if (selectedUploadUrl) URL.revokeObjectURL(selectedUploadUrl);
    selectedUploadUrl = '';
    selectedUploadFile = null;
    imgUpload.value = '';
    imgUploadName.textContent = 'Use uma imagem existente da pasta img ou mantenha uma URL/caminho no campo acima.';
    setImagePreview(imgInput.value.trim());
  }

  async function resolveImageUrlBeforeSave(productName) {
    if (!selectedUploadFile) return imgInput.value.trim();
    if (!window.PDSupabase || !window.PDSupabase.uploadProductImage) {
      throw new Error('Upload online indisponivel. Verifique a conexao com o Supabase Storage.');
    }

    imgUploadName.textContent = 'Enviando imagem para o Supabase...';
    const publicUrl = await window.PDSupabase.uploadProductImage(selectedUploadFile, productName);
    imgInput.value = publicUrl;
    imgUploadName.textContent = 'Imagem enviada com sucesso.';
    setImagePreview(publicUrl);
    return publicUrl;
  }

  function showToast(message) {
    let toast = document.getElementById('admin-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'admin-toast';
      toast.className = 'admin-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = message;
    toast.classList.add('active');
    setTimeout(() => toast.classList.remove('active'), 2800);
  }

  function getBackupFileName() {
    const today = new Date().toISOString().slice(0, 10);
    return `pampa-dog-backup-${today}.json`;
  }

  function productToBackup(product) {
    return Object.assign({}, product, {
      nome: product.name || '',
      descricao: product.desc || '',
      valor: product.price,
      categoria: normalizeCategory(product.category),
      description: product.desc || '',
      image_url: product.imgCardapio || '',
      product_url: product.productUrl || '',
      link_type: product.linkType || 'whatsapp',
      is_promocao: !!product.isPromocao,
      is_mais_pedido: !!product.isMaisPedido,
      is_produto_semana: !!product.isProdutoSemana,
      is_delivery_off: !!product.is50Off,
      active: product.active !== false
    });
  }

  function backupProductToApp(product) {
    const name = product.name || product.nome || product.title || product.titulo || '';
    const desc = product.desc || product.description || product.descricao || '';
    const price = typeof product.price !== 'undefined' ? product.price : product.valor;
    const category = product.category || product.categoria || 'hotdogs';
    const imageUrl = product.imgCardapio || product.image_url || product.imageUrl || '';

    return Object.assign({}, product, {
      id: product.id || `prod-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name,
      desc,
      price,
      category: normalizeCategory(category),
      imgCardapio: imageUrl,
      imgHome: product.imgHome || '',
      imgHero: product.imgHero || '',
      productUrl: product.productUrl || product.product_url || '',
      linkType: product.linkType || product.link_type || 'whatsapp',
      isPromocao: typeof product.isPromocao !== 'undefined' ? !!product.isPromocao : !!product.is_promocao,
      isMaisPedido: typeof product.isMaisPedido !== 'undefined' ? !!product.isMaisPedido : !!product.is_mais_pedido,
      isProdutoSemana: typeof product.isProdutoSemana !== 'undefined' ? !!product.isProdutoSemana : !!product.is_produto_semana,
      is50Off: typeof product.is50Off !== 'undefined' ? !!product.is50Off : !!product.is_delivery_off,
      active: product.active !== false
    });
  }

  function parseBackupProducts(parsed) {
    const products = Array.isArray(parsed) ? parsed : parsed && Array.isArray(parsed.products) ? parsed.products : null;
    if (!products || !products.length) return null;

    const normalized = products.map(backupProductToApp).filter(product => {
      return product.name && product.category && Object.prototype.hasOwnProperty.call(PD.catLabel, product.category);
    });

    return normalized.length ? normalized : null;
  }

  // INICIALIZAÇÃO
  async function init() {
    renderTabs();
    bindEvents();
    renderList();
    if (PD.loadProductsOnline) {
      await PD.loadProductsOnline();
      renderList();
    }
  }

  // RENDER TABS
  function renderTabs() {
    let html = `<button class="admin-tab" type="button" data-cat="all">🌟 Todos</button>`;
    
    for (const [cat, label] of Object.entries(PD.catLabel)) {
      const mobileLabel = cat === 'classicos' ? 'Clássicos' : label;
      html += `<button class="admin-tab" type="button" data-cat="${normalizeCategory(cat)}">${PD.catEmoji[cat]} <span class="admin-tab-full">${label}</span><span class="admin-tab-short">${mobileLabel}</span></button>`;
    }
    
    tabsEl.innerHTML = html;
    setActiveCategory(currentCategory);
  }

  // RENDER LISTA DE PRODUTOS
  function renderList() {
    const products = PD.getProducts();
    setActiveCategory(currentCategory);
    let filtered = products.slice();
    
    if (currentCategory !== 'all') {
      filtered = products.filter(product => normalizeCategory(product.category) === currentCategory);
    }
    
    listEl.innerHTML = filtered.map(p => {
      const category = normalizeCategory(p.category);
      const cardBackground = getAdminCardBackground(category);
      const imgSrc = resolveAdminAssetPath(PD.getProductImage(p, 'cardapio'));
      const imgHtml = imgSrc 
        ? `<img src="${imgSrc}" style="width:100%;height:100%;object-fit:cover;">`
        : `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:24px;">${PD.getPlaceholder(p.category)}</div>`;

      return `
        <div class="admin-card" data-id="${p.id}" style="background:${cardBackground};">
          <div class="admin-card-header">
            <div class="admin-card-img">${imgHtml}</div>
            <div class="admin-card-info">
              <div class="admin-card-title">${p.name}</div>
              <div class="admin-card-cat">${PD.catLabel[normalizeCategory(p.category)]} • ${PD.displayPrice(p.price)}</div>
              <div class="admin-mobile-badges" aria-label="Indicadores ativos">
                ${p.isPromocao ? '<span>Promoção</span>' : ''}
                ${p.isMaisPedido ? '<span>Mais pedido</span>' : ''}
                ${p.isProdutoSemana ? '<span>Semana</span>' : ''}
                ${p.is50Off ? '<span>50% OFF</span>' : ''}
              </div>
            </div>
          </div>
          
          <div class="admin-switches">
            <div class="switch-group">
              <span>🔥 Promoção</span>
              <label class="switch">
                <input type="checkbox" data-id="${p.id}" data-flag="isPromocao" ${p.isPromocao ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="switch-group">
              <span>⭐ Mais Pedido</span>
              <label class="switch">
                <input type="checkbox" data-id="${p.id}" data-flag="isMaisPedido" ${p.isMaisPedido ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
            
            <div class="switch-group">
              <span>🌟 Produto da Semana</span>
              <label class="switch">
                <input type="checkbox" data-id="${p.id}" data-flag="isProdutoSemana" ${p.isProdutoSemana ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>

            <div class="switch-group">
              <span>Entrega 50% OFF</span>
              <label class="switch">
                <input type="checkbox" data-id="${p.id}" data-flag="is50Off" ${p.is50Off ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="admin-actions">
            <button class="btn btn-outline" type="button" style="width:100%; padding:8px;" onclick="window.editProduct('${p.id}')" aria-label="Editar ${p.name}">
              <span aria-hidden="true">&#9998;&#65039;</span> Editar Dados
            </button>
          </div>
        </div>
      `;
    }).join('');
    
    // Bind flags
    listEl.querySelectorAll('input[type="checkbox"]').forEach(chk => {
      chk.addEventListener('change', async (e) => {
        const id = e.target.getAttribute('data-id');
        const flag = e.target.getAttribute('data-flag');
        await PD.toggleFlag(id, flag);
        // showToast('Atualizado!'); // Opcional
      });
    });

    listEl.querySelectorAll('.admin-card').forEach(card => {
      card.addEventListener('click', (event) => {
        if (!window.matchMedia('(max-width: 767px)').matches) return;
        if (event.target.closest('button, input, label, a')) return;
        window.editProduct(card.getAttribute('data-id'));
      });
    });
  }

  // EVENTOS GERAIS
  function bindEvents() {
    tabsEl.addEventListener('click', event => {
      const categoryButton = event.target.closest('.admin-tab');
      if (!categoryButton || !tabsEl.contains(categoryButton)) return;

      setActiveCategory(categoryButton.dataset.cat);
      renderList();
    });

    document.getElementById('btn-backup-toggle').addEventListener('click', () => {
      const panel = document.getElementById('backup-panel');
      panel.style.display = panel.style.display === 'none' ? 'flex' : 'none';
    });

    if (mobileFab && mobileFabMenu) {
      mobileFab.addEventListener('click', () => {
        mobileFabMenu.classList.toggle('active');
      });
    }

    if (mobileAddBtn) {
      mobileAddBtn.addEventListener('click', () => {
        if (mobileFabMenu) mobileFabMenu.classList.remove('active');
        document.getElementById('btn-add').click();
      });
    }

    if (mobileBackupBtn) {
      mobileBackupBtn.addEventListener('click', () => {
        if (mobileFabMenu) mobileFabMenu.classList.remove('active');
        const panel = document.getElementById('backup-panel');
        if (panel && panel.style.display === 'none') {
          document.getElementById('btn-backup-toggle').click();
        }
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    }

    document.getElementById('close-modal').addEventListener('click', closeModal);
    document.getElementById('btn-cancel').addEventListener('click', closeModal);
    linkTypeSelect.addEventListener('change', syncLinkTypeFields);

    imgInput.addEventListener('input', () => {
      imgUploadName.textContent = 'Use uma imagem existente da pasta img ou mantenha uma URL/caminho no campo acima.';
      setImagePreview(imgInput.value.trim());
    });

    imgUpload.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      if (selectedUploadUrl) URL.revokeObjectURL(selectedUploadUrl);
      selectedUploadFile = file;
      selectedUploadUrl = URL.createObjectURL(file);
      imgUploadName.textContent = `Selecionada: ${file.name}`;
      imgPreview.innerHTML = `<img src="${selectedUploadUrl}" alt="Prévia da imagem">`;
      imgPreview.style.display = 'block';
    });
    
    // Adicionar Produto
    document.getElementById('btn-add').addEventListener('click', () => {
      document.getElementById('edit-id').value = '';
      document.getElementById('edit-category').value = currentCategory === 'all' ? 'hotdogs' : currentCategory;
      document.getElementById('edit-name').value = '';
      document.getElementById('edit-desc').value = '';
      document.getElementById('edit-price').value = '';
      linkTypeSelect.value = 'whatsapp';
      productUrlInput.value = '';
      syncLinkTypeFields();
      syncFlagFields(null);
      document.getElementById('edit-img-cardapio').value = '';
      resetUploadPreview();
      
      document.getElementById('btn-delete').style.display = 'none';
      modal.classList.add('active');
    });

    // Excluir Produto
    document.getElementById('btn-delete').addEventListener('click', async () => {
      const id = document.getElementById('edit-id').value;
      if (id && confirm('Tem certeza que deseja excluir este produto?')) {
        const deleteButton = document.getElementById('btn-delete');
        deleteButton.disabled = true;
        try {
          await PD.deleteProduct(id);
          if (PD.loadProductsOnline) await PD.loadProductsOnline();
          closeModal();
          renderList();
          showToast('Produto excluído com sucesso.');
        } catch (error) {
          console.error('[Pampa Dog] Falha ao excluir produto.', error);
          alert(error.message || 'Não foi possível excluir o produto. Tente novamente.');
        } finally {
          deleteButton.disabled = false;
        }
      }
    });

    // Exportar
    document.getElementById('btn-export').addEventListener('click', () => {
      const products = PD.getProducts().map(productToBackup);
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(products, null, 2));
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", getBackupFileName());
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    });

    // Importar
    document.getElementById('input-import').addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async function(evt) {
        try {
          const contents = evt.target.result;
          const parsed = JSON.parse(contents);
          const products = parseBackupProducts(parsed);
          if (products) {
             const ok = confirm('Importar este backup substituirá os produtos atuais. Deseja continuar?');
             if (!ok) return;
             if (PD.replaceProductsOnline) await PD.replaceProductsOnline(products);
             else throw new Error('Integração Supabase indisponível para importar backup.');
             if (PD.loadProductsOnline) await PD.loadProductsOnline();
             renderList();
             alert('Produtos importados com sucesso!');
          } else {
             alert('Arquivo inválido ou vazio.');
          }
        } catch(err) {
          console.error(err);
          alert('Não foi possível importar o backup no Supabase. Nenhuma alteração definitiva foi confirmada.');
        }
        e.target.value = '';
      };
      reader.readAsText(file);
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const id = document.getElementById('edit-id').value;
      const isNewProduct = !id;
      let original = id ? PD.getProductById(id) : null;
      
      if (!original) {
        original = {
          id: 'prod-' + Date.now(),
          isPromocao: false,
          isMaisPedido: false,
          isProdutoSemana: false,
          is50Off: false
        };
      }
      
      let rawPrice = document.getElementById('edit-price').value.replace(',', '.');
      let parsedPrice = parseFloat(rawPrice);
      let imageUrl;

      try {
        imageUrl = await resolveImageUrlBeforeSave(document.getElementById('edit-name').value);
      } catch (err) {
        alert(err.message || 'Erro ao enviar imagem para o Supabase.');
        return;
      }
      
      const updated = Object.assign({}, original, {
        category: document.getElementById('edit-category').value,
        name: document.getElementById('edit-name').value,
        desc: document.getElementById('edit-desc').value,
        price: Number.isFinite(parsedPrice) ? parsedPrice : rawPrice.trim(),
        linkType: linkTypeSelect.value,
        productUrl: linkTypeSelect.value === 'outros' ? productUrlInput.value.trim() : '',
        imgCardapio: imageUrl,
        imgHome: '',
        imgHero: original.imgHero || '',
        ...getFlagFields()
      });
      
      await PD.updateProduct(updated);
      closeModal();
      renderList();
      if (isNewProduct) showToast('Mais um Pampa criado com sucesso! ⭐');
    });
  }

  // EXPORT FUNÇÃO GLOBAL PARA ONCLICK NO HTML
  window.editProduct = function(id) {
    const p = PD.getProductById(id);
    if (!p) return;
    
    document.getElementById('edit-id').value = p.id;
    document.getElementById('edit-category').value = normalizeCategory(p.category);
    document.getElementById('edit-name').value = p.name;
    document.getElementById('edit-desc').value = p.desc;
    document.getElementById('edit-price').value = typeof p.price === 'number' ? p.price.toFixed(2).replace('.', ',') : (p.price || '');
    linkTypeSelect.value = resolveLinkType(p);
    productUrlInput.value = linkTypeSelect.value === 'outros' ? (p.productUrl || '') : '';
    syncLinkTypeFields();
    syncFlagFields(p);
    document.getElementById('edit-img-cardapio').value = p.imgCardapio || '';
    resetUploadPreview();
    
    document.getElementById('btn-delete').style.display = 'inline-block';
    modal.classList.add('active');
  };

  function closeModal() {
    modal.classList.remove('active');
    resetUploadPreview();
  }

  // START
  setupAuth();
});
