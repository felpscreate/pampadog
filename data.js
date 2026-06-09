/**
 * PAMPA DOG - data.js
 * Módulo de gerenciamento de produtos, flags e renderização dinâmica.
 * Carregado em: index.html, cardapio.html, Admin/admin.html
 */
'use strict';

var PD = (function () {

  var STORAGE_KEY = 'pampaDog_v1_products';
  var WHATSAPP_BASE_URL = 'https://api.whatsapp.com/send/?phone=553899063376&text&type=phone_number&app_absent=0';
  var onlineProducts = null;
  var productsLoadPromise = null;
  var productsSource = 'fallback';

  /* ============================================================
     DADOS PADRÃO — editáveis pelo Admin
     ============================================================ */
  var DEFAULT_PRODUCTS = [
    // COMBOS
    { id: "hd-tradicional", name: "Dupla Franguito", desc: "Franguito + Franguito Bacon. Dois lanches com pão no vapor, recheados com strogonoff de frango cremoso, salsicha, tomate fresco, cebola, milho, batata palha crocante e maionese especial gaúcha. A diferença é que o Franguito no Bacon recebe bacon crocante.", price: 38.9, category: "combos", imgCardapio: "img/hotdog_tradicional.png", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "hd-especial", name: "Dupla Tchê Cremoso", desc: "Tchê Cremoso + Tchê Cremoso Bacon. Dois lanches com pão no vapor, salsicha, tomate fresco, cebola, molho de tomate, purê de batata cremoso, carne moída especial, salsinha, milho, batata palha crocante e maionese especial gaúcha. A versão Bacon recebe bacon crocante.", price: 47.9, category: "combos", imgCardapio: "img/pampa_dog_especial.png", imgHome: "img/hero1.png", isPromocao: true, isMaisPedido: true, isProdutoSemana: true, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "hd-bacon", name: "Dupla Bão Demais", desc: "Bão Demais + Bão Demais com Bacon. Dois clássicos preparados com pão no vapor, salsicha Perdigão, tomate fresco, cebola, molho de tomate, mostarda, salsinha, milho, batata palha crocante e maionese especial gaúcha.", price: 34.9, category: "combos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "hd-cheddar", name: "Dupla Frangolino", desc: "Dois lanches com pão no vapor, salsicha, frango temperado, purê cremoso, tomate, cebola, molho de tomate, salsinha, milho, batata palha crocante e maionese especial gaúcha. Um tradicional e outro com bacon crocante.", price: 42.9, category: "combos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "bg-campeiro", name: "Combo Família", desc: "Pampinha Feliz, Bem Capaz e O Loco Tchê completos com tomate, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha crocante, queijo parmesão ralado e maionese especial gaúcha. Acompanha Coca-Cola 1 litro.", price: 69.9, category: "combos", imgCardapio: "img/burger_campeiro.png", imgHome: "img/burger_campeiro.png", isPromocao: true, isMaisPedido: false, isProdutoSemana: true, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "bg-smash", name: "Combo Pampa Gaúcho", desc: "Acebolado Supreme + BahBacon acompanhados de Mate Couro 1 litro. Ambos preparados com salsicha, tomate fresco, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha crocante, queijo parmesão ralado e maionese especial gaúcha.", price: 69.9, category: "combos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    // HOT DOGS
    { id: "bg-xtudo", name: "Frangolino (Purê e Franguinho)", desc: "Pão no vapor, salsicha Perdigão, tomate fresco, cebola, molho de tomate, purê de batata cremoso, frango suculento, salsinha, milho, batata palha crocante e maionese especial gaúcha.", price: 22.5, category: "hotdogs", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "bg-chicken", name: "Tchê Cremoso (Purê e Carne Moída)", desc: "Pão no vapor, salsicha, carne moída ao molho, purê de batata cremoso, tomate, cebola, milho, salsinha, batata palha crocante e maionese especial gaúcha.", price: 23.9, category: "hotdogs", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "cb-dog-batata", name: "Bão Demais", desc: "Pão no vapor, salsicha Perdigão, tomate fresco, cebola picada, molho de tomate, mostarda, salsinha, milho verde, batata palha crocante e maionese especial gaúcha.", price: 17.9, category: "hotdogs", imgCardapio: "img/batata_refri.png", imgHome: "", isPromocao: true, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "cb-burger-batata", name: "Franguito", desc: "Pão no vapor, strogonoff de frango, salsicha Perdigão, tomate fresco, cebola crua picada, milho verde, batata palha crocante e maionese especial gaúcha.", price: 21.9, category: "hotdogs", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "cb-familia", name: "Bão Demais com Bacon", desc: "Pão no vapor, salsicha Perdigão, tomate fresco, cebola picada, molho de tomate, mostarda, milho verde, batata palha crocante, bacon crocante e maionese especial gaúcha.", price: 21.9, category: "hotdogs", imgCardapio: "img/combo_familia.png", imgHome: "img/combo_familia.png", isPromocao: true, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "cb-casal", name: "Tchê Cremoso Bacon", desc: "Pão no vapor, salsicha, tomate fresco, cebola, molho vermelho, purê de batata cremoso, carne moída especial, milho, batata palha crocante, bacon crocante e maionese especial gaúcha.", price: 27.9, category: "hotdogs", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "beb-refri", name: "Franguito Bacon", desc: "Pão no vapor, strogonoff de frango, salsicha Perdigão, tomate fresco, cebola, milho verde, batata palha crocante, bacon crocante e maionese especial gaúcha.", price: 23.9, category: "hotdogs", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    // CL?SSICOS
    { id: "beb-suco", name: "Pampa Insano", desc: "Pão gigante de 23 cm, 3 salsichas Perdigão, tomate fresco, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha crocante, queijo parmesão ralado e maionese especial gaúcha. Serve até 2 pessoas.", price: 36.9, category: "classicos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "beb-agua", name: "BahBacon", desc: "Pão no vapor, salsicha Perdigão, tomate fresco, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha crocante, queijo parmesão ralado, bacon crocante e maionese especial gaúcha.", price: 32.9, category: "classicos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "beb-milk", name: "Pampinha Feliz", desc: "Pão pequeno, 1 salsicha, tomate, cebola, molho vermelho, mostarda, ovo picado, salsinha, milho, batata palha, queijo ralado e maionese especial gaúcha.", price: 16.9, category: "classicos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "add-bacon", name: "Bem Capaz", desc: "Pão no vapor com 1 salsicha, tomate, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha, queijo ralado e maionese especial gaúcha.", price: 22.9, category: "classicos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "add-cheddar", name: "O Loco Tchê", desc: "Pão no vapor com 2 salsichas, tomate, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha, queijo ralado e maionese especial gaúcha.", price: 27.9, category: "classicos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "add-batata", name: "Prime Frango", desc: "Pão no vapor, strogonoff de frango, salsicha Perdigão, tomate fresco, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha, queijo parmesão ralado e maionese especial gaúcha.", price: 30.9, category: "classicos", imgCardapio: "img/batata_refri.png", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "add-ovo", name: "Barbaridade Tchê", desc: "Pão no vapor, linguiça calabresa Sadia, tomate, cebola, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha, queijo ralado e maionese especial gaúcha.", price: 28.9, category: "classicos", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", linkType: "whatsapp", is50Off: false },
    { id: "cla-acebolado-supreme", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Acebolado Supreme", desc: "Carne acebolada amanteigada, salsicha Perdigão, tomate fresco, molho de tomate, mostarda, ovo cozido, salsinha, milho, batata palha crocante, queijo parmesão ralado e maionese especial gaúcha.", price: 32.9, category: "classicos", linkType: "whatsapp", is50Off: false },
    // BEBIDAS
    { id: "beb-suco-natural-maracuja-500ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Suco Natural Maracujá 500ml", desc: "Gelado.", price: 9, category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-suco-natural-goiaba-500ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Suco Natural Goiaba 500ml", desc: "Gelado.", price: 9, category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-suco-natural-caju-500ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Suco Natural Cajú 500ml", desc: "Gelado.", price: 9, category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-agua-500ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Água 500ml", desc: "Escolha entre água com ou sem gás.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-refrigerante-lata", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Refrigerante Lata", desc: "Escolha o seu refrigerante.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-refrigerante-600ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Refrigerante 600ml", desc: "Escolha o seu refrigerante.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-refrigerante-1l", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Refrigerante 1L", desc: "Escolha o seu refrigerante.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-refrigerante-1-5l", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Refrigerante 1,5L", desc: "Escolha o seu refrigerante.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-refrigerante-2l", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Refrigerante 2L", desc: "Escolha o seu refrigerante.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-del-valle-kapo-200ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Del Valle Kapo 200ml", desc: "Escolha o sabor.", price: "Consultar", category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-h2o-zero-acucar-500ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "H2O Zero Açúcar 500ml", desc: "Bebida refrescante.", price: 8, category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-h2o-limoneto", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "H2O Limoneto", desc: "Bebida refrescante sabor limão.", price: 8.5, category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-heineken-473ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Heineken 473ml", desc: "Cerveja gelada.", price: 10, category: "bebidas", linkType: "whatsapp", is50Off: false },
    { id: "beb-brahma-latao-550ml", imgCardapio: "", imgHome: "", isPromocao: false, isMaisPedido: false, isProdutoSemana: false, productUrl: "", imgHero: "", name: "Brahma Latão 550ml", desc: "Cerveja gelada.", price: 10, category: "bebidas", linkType: "whatsapp", is50Off: false }
  ];

  /* ============================================================
     METADADOS
     ============================================================ */
  var catEmoji  = { hotdogs: '🌭', classicos: '🌟', combos: '🎁', bebidas: '🥤' };
  var catLabel  = { hotdogs: 'Hot Dogs', classicos: 'Clássicos do Rio Grande do Sul', combos: 'Combos', bebidas: 'Bebidas' };
  var catHolder = { hotdogs: '🌭', classicos: '🌟', combos: '🎁', bebidas: '🥤' };
  var visibleCategories = Object.keys(catLabel);
  var defaultProductMap = {};
  DEFAULT_PRODUCTS.forEach(function(p) {
    defaultProductMap[p.id] = Object.assign({}, p, { category: normalizeCategory(p.category) });
  });

  /* ============================================================
     CRUD — localStorage
     ============================================================ */
  function readStoredProducts() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) {
        var parsed = JSON.parse(stored);
        var products = sanitizeStoredProducts(Array.isArray(parsed) ? parsed : []);
        if (JSON.stringify(parsed) !== JSON.stringify(products)) {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
        }
        return products;
      }
    } catch (e) {}
    return null;
  }

  function writeProductsCache(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {}
  }

  function setOnlineProducts(products, source) {
    onlineProducts = normalizeProducts(products);
    productsSource = source || 'supabase';
    writeProductsCache(onlineProducts);
    return onlineProducts;
  }

  function getProducts() {
    if (onlineProducts) return onlineProducts;
    var storedProducts = readStoredProducts();
    if (storedProducts) return storedProducts;
    return getDefaultProducts();
  }

  function saveProducts(products) {
    var normalized = normalizeProducts(products);
    onlineProducts = normalized;
    productsSource = productsSource === 'supabase' ? 'supabase' : 'cache';
    writeProductsCache(normalized);
    refreshDynamicViews();
    return normalized;
  }

  function loadProductsOnline() {
    if (!window.PDSupabase) return Promise.resolve(getProducts());
    if (productsLoadPromise) return productsLoadPromise;

    productsLoadPromise = window.PDSupabase.listProducts()
      .then(function(products) {
        if (Array.isArray(products)) {
          setOnlineProducts(products, 'supabase');
          refreshDynamicViews();
        }
        return getProducts();
      })
      .catch(function(error) {
        productsSource = 'fallback';
        console.warn('[Pampa Dog] Supabase indisponivel, usando fallback local.', error);
        return getProducts();
      })
      .finally(function() {
        productsLoadPromise = null;
      });

    return productsLoadPromise;
  }

  function saveProductsOnline(products) {
    var normalized = saveProducts(products);
    if (!window.PDSupabase) return Promise.resolve(normalized);

    var persistOnline = window.PDSupabase.upsertProducts;
    return persistOnline(normalized)
      .then(function(savedProducts) {
        if (Array.isArray(savedProducts) && savedProducts.length) {
          setOnlineProducts(savedProducts, 'supabase');
          refreshDynamicViews();
        }
        return getProducts();
      })
      .catch(function(error) {
        console.warn('[Pampa Dog] Falha ao salvar no Supabase, mantendo cache local.', error);
        return normalized;
      });
  }

  function replaceProductsOnline(products) {
    var normalized = normalizeProducts(products);
    if (!window.PDSupabase || !window.PDSupabase.replaceProducts) {
      return Promise.reject(new Error('Supabase indisponivel para restaurar backup.'));
    }

    return window.PDSupabase.replaceProducts(normalized)
      .then(function(savedProducts) {
        if (Array.isArray(savedProducts)) {
          setOnlineProducts(savedProducts, 'supabase');
          refreshDynamicViews();
        }
        return getProducts();
      });
  }

  function hasSavedProducts() {
    try {
      return localStorage.getItem(STORAGE_KEY) !== null;
    } catch (e) {
      return false;
    }
  }

  function normalizeCategory(category) {
    if (category === 'burgers') return 'classicos';
    return category;
  }

  function normalizeProducts(products) {
    return products.map(function(p) {
      var product = Object.assign({}, p, { category: normalizeCategory(p.category) });
      product.imgCardapio = normalizeProductImage(product.imgCardapio);
      product.imgHome = normalizeProductImage(product.imgHome);
      product.imgHero = normalizeProductImage(product.imgHero);
      product.linkType = normalizeLinkType(product);
      if (product.linkType === 'whatsapp') product.productUrl = '';
      product.is50Off = !!product.is50Off;
      return product;
    }).filter(function(p) {
      return visibleCategories.indexOf(p.category) !== -1;
    });
  }

  function isWhatsappUrl(url) {
    return /(wa\.me|whatsa\.me|api\.whatsapp\.com|web\.whatsapp\.com)/i.test(url || '');
  }

  function normalizeLinkType(product) {
    if (product.linkType === 'whatsapp' || product.linkType === 'outros') return product.linkType;
    return product.productUrl && !isWhatsappUrl(product.productUrl) ? 'outros' : 'whatsapp';
  }

  function isLogoImage(src) {
    return /(^|\/)logo\.png(\?.*)?$/i.test(String(src || '').trim());
  }

  function normalizeProductImage(src) {
    var value = String(src || '').trim();
    return isLogoImage(value) ? '' : value;
  }

  function sanitizeStoredProducts(products) {
    var normalized = normalizeProducts(products);
    var hasCustom = normalized.some(function(p) { return !defaultProductMap[p.id]; });
    var onlyUnchangedDefaults = normalized.length > 0 && normalized.every(isUnchangedDefaultProduct);

    if (hasCustom || onlyUnchangedDefaults) {
      return normalized.filter(function(p) { return !isUnchangedDefaultProduct(p); });
    }

    return normalized;
  }

  function isUnchangedDefaultProduct(product) {
    var def = defaultProductMap[product.id];
    if (!def) return false;

    return product.name === def.name
      && product.desc === def.desc
      && samePrice(product.price, def.price)
      && normalizeCategory(product.category) === def.category
      && (product.imgCardapio || '') === (def.imgCardapio || '')
      && (product.imgHome || '') === (def.imgHome || '')
      && (product.imgHero || '') === (def.imgHero || '')
      && !!product.isPromocao === !!def.isPromocao
      && !!product.isMaisPedido === !!def.isMaisPedido
      && !!product.isProdutoSemana === !!def.isProdutoSemana
      && !!product.is50Off === !!def.is50Off
      && (product.linkType || '') === (def.linkType || '')
      && (product.productUrl || '') === (def.productUrl || '');
  }

  function samePrice(a, b) {
    var numA = Number(a);
    var numB = Number(b);
    if (Number.isFinite(numA) && Number.isFinite(numB)) return numA === numB;
    return String(a || '') === String(b || '');
  }

  function getDefaultProducts() {
    return normalizeProducts(DEFAULT_PRODUCTS.map(function(p){ return Object.assign({}, p); }));
  }

  function deleteProduct(id) {
    var products = getProducts().filter(function(p){ return p.id !== id; });
    saveProducts(products);
    if (!window.PDSupabase) return Promise.resolve(products);
    return window.PDSupabase.deleteProduct(id)
      .then(function() { return products; })
      .catch(function(error) {
        console.warn('[Pampa Dog] Falha ao excluir no Supabase, mantendo cache local.', error);
        return products;
      });
  }

  function getProductById(id) {
    return getProducts().filter(function(p){ return p.id === id; })[0] || null;
  }

  function updateProduct(updated) {
    var products = getProducts();
    var idx = -1;
    products.forEach(function(p, i){ if (p.id === updated.id) idx = i; });
    if (idx >= 0) products[idx] = updated;
    else products.push(updated);
    saveProducts(products);
    if (!window.PDSupabase) return Promise.resolve(updated);
    return window.PDSupabase.updateProduct(updated)
      .then(function(savedProduct) {
        var current = getProducts();
        var savedIdx = -1;
        current.forEach(function(p, i) {
          if (p.id === updated.id || p.id === savedProduct.id) savedIdx = i;
        });
        if (savedIdx >= 0) current[savedIdx] = savedProduct;
        else current.push(savedProduct);
        setOnlineProducts(current, 'supabase');
        refreshDynamicViews();
        return savedProduct;
      })
      .catch(function(error) {
        console.warn('[Pampa Dog] Falha ao salvar no Supabase, mantendo cache local.', error);
        return updated;
      });
  }

  function toggleFlag(id, flag) {
    var products = getProducts();
    var changed = null;
    products.forEach(function(p){
      if (p.id === id) {
        p[flag] = !p[flag];
        changed = p;
      }
    });
    saveProducts(products);
    if (!changed || !window.PDSupabase) return Promise.resolve(changed);
    return window.PDSupabase.updateProduct(changed)
      .then(function(savedProduct) { return savedProduct; })
      .catch(function(error) {
        console.warn('[Pampa Dog] Falha ao atualizar destaque no Supabase, mantendo cache local.', error);
        return changed;
      });
  }

  function refreshDynamicViews() {
    renderProdutosSemana();
    renderHomePromos();
    applyCardapioOverrides();
  }

  /* ============================================================
     UTILITÁRIOS
     ============================================================ */
  function getProductImage(product, type) {
    var homeImg = (product.imgHome || '').trim();
    var cardapioImg = (product.imgCardapio || '').trim();
    if (type === 'home') return homeImg || cardapioImg || '';
    return cardapioImg || '';
  }

  function formatPrice(price) {
    var value = Number(price);
    if (!Number.isFinite(value)) return String(price || '');
    return value.toFixed(2).replace('.', ',');
  }

  function displayPrice(price) {
    var formatted = formatPrice(price);
    return Number.isFinite(Number(price)) ? 'R$ ' + formatted : formatted;
  }

  function getPlaceholder(category) {
    return catHolder[category] || '🌭';
  }

  function buildImgHtml(src, alt, category) {
    src = normalizeProductImage(src);
    if (src) {
      return '<img src="' + src + '" alt="' + (alt||'') + '" loading="lazy" '
           + 'style="width:100%;height:100%;max-width:100%;max-height:100%;object-fit:cover;transition:transform 0.5s ease;" />';
    }
    return '<div class="food-placeholder">' + getPlaceholder(category) + '</div>';
  }

  function deliveryOffBadgeHtml(product) {
    return product.is50Off
      ? '<div class="delivery-off-badge"><span>&#x1F6F5; 50% OFF na taxa de entrega</span><span>&#x1F32D; Em pedidos acima de R$ 45,00</span></div>'
      : '';
  }

  function buildProductUrl(product) {
    if (normalizeLinkType(product) !== 'outros') return buildWhatsappUrl(product);
    return product.productUrl || buildWhatsappUrl(product);
  }

  function buildWhatsappUrl(product) {
    var msg = 'Ol\u00e1! Gostaria de fazer um pedido:\n\n'
      + '\u{1F32D} Produto: ' + product.name + '\n'
      + '\u{1F4B0} Valor: ' + displayPrice(product.price) + '\n\n'
      + 'Pode me ajudar?';
    return WHATSAPP_BASE_URL.replace('text', 'text=' + encodeURIComponent(msg));
  }
  /* ============================================================
     RENDER: HERO CAROUSEL (index.html)
     ============================================================ */
  function renderHeroCarousel() {
    var carousel = document.querySelector('.hero .carousel');
    var dotsWrap = document.querySelector('.hero .carousel-dots');
    if (!carousel || !dotsWrap) return;

    var featured = getProducts().filter(function(p) {
      var img = (p.imgHero || '').trim();
      var hasFlag = p.isPromocao || p.isMaisPedido || p.isProdutoSemana;
      return hasFlag && !!img;
    });

    if (!featured.length) return;

    carousel.innerHTML = featured.map(function(p, i) {
      var src = (p.imgHero || '').trim();
      return '<div class="carousel-slide' + (i === 0 ? ' active' : '') + '">'
        + '<img src="' + src + '" alt="' + p.name + '" loading="' + (i === 0 ? 'eager' : 'lazy') + '" />'
        + '<div class="carousel-overlay"></div>'
      + '</div>';
    }).join('');

    dotsWrap.innerHTML = featured.map(function(_, i) {
      return '<button class="carousel-dot' + (i === 0 ? ' active' : '') + '" aria-label="Slide ' + (i + 1) + '"></button>';
    }).join('');
  }

  /* ============================================================
     RENDER: PRODUTOS DA SEMANA (index.html)
     ============================================================ */
  function renderProdutosSemana() {
    var section = document.getElementById('produtos-semana');
    if (!section) return;

    var semana = getProducts().filter(function(p){ return p.isProdutoSemana || p.isPromocao || p.isMaisPedido; });

    if (!semana.length) {
      section.style.display = 'none';
      return;
    }
    section.style.display = '';

    var container = document.getElementById('semana-carousel-container');
    if (!container) return;

    if (semana.length === 1) {
      /* --- Destaque fixo único --- */
      var p = semana[0];
      var src = getProductImage(p, 'home');
      container.innerHTML =
        '<div class="semana-single" data-promocao="' + p.isPromocao + '" data-mais-pedido="' + p.isMaisPedido + '" data-semana="' + p.isProdutoSemana + '">'
          + '<div class="semana-img-wrap">' + buildImgHtml(src, p.name, p.category) + '</div>'
          + '<div class="semana-info">'
            + '<div class="semana-badges">'
              + (p.isProdutoSemana ? '<span class="semana-badge produto-semana">🌟 Produto da Semana</span>' : '')
              + (p.isMaisPedido ? '<span class="semana-badge mais-pedido">⭐ Mais Pedido</span>' : '')
              + (p.isPromocao   ? '<span class="semana-badge promocao">🔥 Promoção</span>' : '')
            + '</div>'
            + '<h3 class="semana-name">' + p.name + '</h3>'
            + '<p class="semana-desc">' + p.desc + '</p>'
            + deliveryOffBadgeHtml(p)
            + '<div class="semana-price">' + displayPrice(p.price) + '</div>'
            + '<a href="' + buildProductUrl(p) + '" target="_blank" rel="noopener" '
            +    'class="btn btn-primary btn-lg" data-action="pedido" data-item="' + p.name + '">'
            +   '🛵 Pedir agora'
            + '</a>'
          + '</div>'
        + '</div>';
    } else {
      /* --- Carrossel com múltiplos produtos --- */
      var slidesHtml = semana.map(function(p, i) {
        var src = getProductImage(p, 'home');
        return '<div class="semana-slide' + (i === 0 ? ' active' : '') + '" data-idx="' + i + '" '
             + 'data-promocao="' + p.isPromocao + '" '
             + 'data-mais-pedido="' + p.isMaisPedido + '" '
             + 'data-semana="' + p.isProdutoSemana + '">'
          + '<div class="semana-img-wrap">' + buildImgHtml(src, p.name, p.category) + '</div>'
          + '<div class="semana-info">'
            + '<div class="semana-badges">'
              + (p.isProdutoSemana ? '<span class="semana-badge produto-semana">🌟 Produto da Semana</span>' : '')
              + (p.isMaisPedido ? '<span class="semana-badge mais-pedido">⭐ Mais Pedido</span>' : '')
              + (p.isPromocao   ? '<span class="semana-badge promocao">🔥 Promoção</span>' : '')
            + '</div>'
            + '<h3 class="semana-name">' + p.name + '</h3>'
            + '<p class="semana-desc">' + p.desc + '</p>'
            + deliveryOffBadgeHtml(p)
            + '<div class="semana-price">' + displayPrice(p.price) + '</div>'
            + '<a href="' + buildProductUrl(p) + '" target="_blank" rel="noopener" '
            +    'class="btn btn-primary btn-lg" data-action="pedido" data-item="' + p.name + '">'
            +   '🛵 Pedir agora'
            + '</a>'
          + '</div>'
        + '</div>';
      }).join('');

      var dotsHtml = semana.map(function(_, i) {
        return '<button class="semana-dot' + (i === 0 ? ' active' : '') + '" '
             + 'data-idx="' + i + '" aria-label="Produto ' + (i + 1) + '"></button>';
      }).join('');

      container.innerHTML =
        '<div class="semana-track">' + slidesHtml + '</div>'
        + '<div class="semana-controls">'
          + '<button class="semana-arrow" id="semana-prev" aria-label="Anterior">&#8592;</button>'
          + '<div class="semana-dots">' + dotsHtml + '</div>'
          + '<button class="semana-arrow" id="semana-next" aria-label="Próximo">&#8594;</button>'
        + '</div>';

      _initSemanaCarousel(section);
    }
  }

  function _initSemanaCarousel(section) {
    var slides = Array.from(section.querySelectorAll('.semana-slide'));
    var dots   = Array.from(section.querySelectorAll('[data-idx]'));
    var current = 0;
    var timer;

    function getVisibleIndices() {
      return slides.map(function(s, i) { return s.style.display !== 'none' ? i : -1; }).filter(function(i) { return i !== -1; });
    }

    function goTo(idx) {
      var visible = getVisibleIndices();
      if (!visible.length) return;
      
      slides.forEach(function(s) { s.classList.remove('active'); });
      dots.forEach(function(d) { if (d) d.classList.remove('active'); });

      var currPos = visible.indexOf(current);
      var nextPos = currPos;

      if (currPos === -1) {
         nextPos = 0;
      } else {
         if (idx === 'next') nextPos = (currPos + 1) % visible.length;
         else if (idx === 'prev') nextPos = (currPos - 1 + visible.length) % visible.length;
         else {
            if (visible.indexOf(idx) !== -1) nextPos = visible.indexOf(idx);
            else nextPos = 0;
         }
      }

      current = visible[nextPos];
      slides[current].classList.add('active');
      if (dots[current]) dots[current].classList.add('active');
    }

    function startAuto() {
      clearInterval(timer);
      timer = setInterval(function () { goTo('next'); }, 4500);
    }

    section._goTo = goTo;
    section._startAuto = startAuto;

    goTo('refresh'); // ativa o primeiro

    var prev = section.querySelector('#semana-prev');
    var next = section.querySelector('#semana-next');
    if (prev) prev.addEventListener('click', function () { goTo('prev'); startAuto(); });
    if (next) next.addEventListener('click', function () { goTo('next'); startAuto(); });

    dots.forEach(function (d) {
      d.addEventListener('click', function () {
        goTo(parseInt(d.getAttribute('data-idx'), 10));
        startAuto();
      });
    });

    section.addEventListener('mouseenter', function () { clearInterval(timer); });
    section.addEventListener('mouseleave', startAuto);

    var touchX = 0;
    section.addEventListener('touchstart', function (e) { touchX = e.touches[0].clientX; }, { passive: true });
    section.addEventListener('touchend', function (e) {
      var diff = touchX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) { diff > 0 ? goTo('next') : goTo('prev'); startAuto(); }
    }, { passive: true });

    startAuto();
  }

  function applyHomeFilter(filterType) {
    var section = document.getElementById('produtos-semana');
    if (!section) return;
    var slides = Array.from(section.querySelectorAll('.semana-slide, .semana-single'));
    var dots   = Array.from(section.querySelectorAll('.semana-dot'));

    slides.forEach(function(slide, idx) {
      var show = false;
      if (filterType === 'all') show = true;
      else if (filterType === 'promocao' && slide.getAttribute('data-promocao') === 'true') show = true;
      else if (filterType === 'mais-pedido' && slide.getAttribute('data-mais-pedido') === 'true') show = true;
      else if (filterType === 'semana' && slide.getAttribute('data-semana') === 'true') show = true;
      
      if (show) {
        slide.style.display = '';
        if (dots[idx]) dots[idx].style.display = '';
      } else {
        slide.style.display = 'none';
        if (dots[idx]) dots[idx].style.display = 'none';
      }
    });

    if (section._goTo) {
       section._goTo('refresh');
       section._startAuto();
    }
  }

  /* ============================================================
     RENDER: PROMOÇÕES (index.html)
     ============================================================ */
  function renderHomePromos() {
    var container = document.getElementById('promo-cards-container');
    if (!container) return;

    var promos = getProducts().filter(function (p) { return p.isPromocao; });

    if (!promos.length) {
      container.innerHTML =
        '<p style="color:var(--gray);text-align:center;padding:60px 0;grid-column:1/-1;">'
        + 'Nenhuma promoção ativa no momento. '
        + '<a href="Admin/admin.html" style="color:var(--red);font-weight:700;">Acesse o Admin</a> para ativar.</p>';
      return;
    }

    container.innerHTML = promos.map(function (p) {
      var src = getProductImage(p, 'cardapio');
      var badge = p.isMaisPedido ? '⭐ Mais Pedido' : '🔥 Promoção';
      var badgeClass = p.isMaisPedido ? 'mais-pedido' : 'promocao';
      return '<article class="promo-card reveal" id="dyn-card-' + p.id + '">'
        + '<div class="card-img-wrap">'
          + buildImgHtml(src, p.name, p.category)
          + '<span class="card-badge ' + badgeClass + '">' + badge + '</span>'
        + '</div>'
        + '<div class="card-body">'
          + '<h3 class="card-name">' + p.name + '</h3>'
          + '<p class="card-desc">' + p.desc + '</p>'
          + deliveryOffBadgeHtml(p)
          + '<div class="card-footer">'
            + '<div class="card-price">' + displayPrice(p.price) + '</div>'
            + '<a href="' + buildProductUrl(p) + '" target="_blank" rel="noopener" '
            +    'class="btn btn-primary btn-sm" data-action="pedido" data-item="' + p.name + '">Pedir</a>'
          + '</div>'
        + '</div>'
      + '</article>';
    }).join('');
  }

  /* ============================================================
     APPLY: CARDÁPIO — imagens e selos dinâmicos (cardapio.html)
     ============================================================ */
  function applyCardapioOverrides() {
    var products = getProducts();
    var activeIds = products.map(function(p){ return p.id; });

    Array.from(document.querySelectorAll('[data-product-id]')).forEach(function(card) {
      var id = card.getAttribute('data-product-id');
      if (activeIds.indexOf(id) === -1) {
        card.remove();
      }
    });

    products.forEach(function (p) {
      var card = document.querySelector('[data-product-id="' + p.id + '"]');
      if (card) {
        var currentSection = card.closest('.menu-section[data-cat]');
        if (currentSection && currentSection.getAttribute('data-cat') !== p.category) {
          card.remove();
          card = null;
        }
      }
      if (!card) {
        var section = document.querySelector('.menu-section[data-cat="' + p.category + '"] .menu-grid');
        if (!section) return;
        section.insertAdjacentHTML('beforeend',
          '<article class="menu-card reveal visible" id="menu-' + p.id + '" data-product-id="' + p.id + '">'
            + '<div class="menu-card-img">' + buildImgHtml(p.imgCardapio || '', p.name, p.category) + '</div>'
            + '<div class="menu-card-body">'
              + '<h3 class="menu-card-name">' + p.name + '</h3>'
              + '<p class="menu-card-desc">' + p.desc + '</p>'
              + deliveryOffBadgeHtml(p)
              + '<div class="menu-card-footer">'
                + '<div class="menu-price">' + displayPrice(p.price) + '</div>'
                + '<a href="' + buildProductUrl(p) + '" target="_blank" rel="noopener" '
                + 'class="btn btn-primary btn-sm" data-action="pedido" data-item="' + p.name + '">Pedir agora</a>'
              + '</div>'
            + '</div>'
          + '</article>');
        card = document.querySelector('[data-product-id="' + p.id + '"]');
      }
      if (!card) return;

      // Atualiza imagem se definida no admin
      var imgWrap = card.querySelector('.menu-card-img');
      if (imgWrap && p.imgCardapio) {
        var existingImg = imgWrap.querySelector('img');
        if (existingImg) {
          existingImg.src = p.imgCardapio;
        } else {
          imgWrap.innerHTML = '';
          imgWrap.style.cssText = '';
          imgWrap.insertAdjacentHTML('beforeend',
            '<img src="' + p.imgCardapio + '" alt="' + p.name + '" loading="lazy" '
            + 'style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s ease;" />');
        }
      }

      // Atualiza/remove selo
      var old = card.querySelector('.dyn-badge');
      if (old) old.remove();

      if (p.isMaisPedido || p.isPromocao) {
        var wrapEl = card.querySelector('.menu-card-img');
        if (wrapEl) {
          wrapEl.style.position = 'relative';
          var badge = document.createElement('span');
          badge.className = 'card-badge dyn-badge ' + (p.isMaisPedido ? 'mais-pedido' : 'promocao');
          badge.style.cssText = 'position:absolute;top:12px;right:12px;z-index:2;';
          badge.textContent = p.isMaisPedido ? '⭐ Mais Pedido' : '🔥 Promoção';
          wrapEl.appendChild(badge);
        }
      }

      var oldDeliveryBadge = card.querySelector('.delivery-off-badge');
      if (oldDeliveryBadge) oldDeliveryBadge.remove();
      if (p.is50Off) {
        var descEl = card.querySelector('.menu-card-desc, .card-desc, .semana-desc');
        if (descEl) descEl.insertAdjacentHTML('afterend', deliveryOffBadgeHtml(p));
      }

      // Atualiza URL de pedido
      var btn = card.querySelector('[data-action="pedido"]');
      if (btn) {
        btn.href = buildProductUrl(p);
      }
    });
  }

  window.addEventListener('storage', function(e) {
    if (e.key === STORAGE_KEY) {
      refreshDynamicViews();
    }
  });

  /* ============================================================
     API PÚBLICA
     ============================================================ */
  return {
    getProducts:            getProducts,
    saveProducts:           saveProducts,
    saveProductsOnline:     saveProductsOnline,
    replaceProductsOnline:  replaceProductsOnline,
    loadProductsOnline:     loadProductsOnline,
    deleteProduct:          deleteProduct,
    getProductById:         getProductById,
    updateProduct:          updateProduct,
    toggleFlag:             toggleFlag,
    getProductImage:        getProductImage,
    formatPrice:            formatPrice,
    displayPrice:           displayPrice,
    buildProductUrl:        buildProductUrl,
    WHATSAPP_BASE_URL:      WHATSAPP_BASE_URL,
    getPlaceholder:         getPlaceholder,
    catEmoji:               catEmoji,
    catLabel:               catLabel,
    renderHeroCarousel:     renderHeroCarousel,
    renderProdutosSemana:   renderProdutosSemana,
    applyHomeFilter:        applyHomeFilter,
    renderHomePromos:       renderHomePromos,
    applyCardapioOverrides: applyCardapioOverrides,
    DEFAULT_PRODUCTS:       DEFAULT_PRODUCTS
  };
})();
