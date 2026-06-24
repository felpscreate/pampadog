/**
 * PAMPA DOG - supabase.js
 * Centraliza a conexao publica do catalogo de produtos.
 */
'use strict';

(function () {
  var SUPABASE_URL = 'https://fijcjkdsaigqwsoidmvv.supabase.co';
  var SUPABASE_PUBLISHABLE_KEY = 'sb_publishable_oQL8MQcSNimgIF4L3fs63Q_6-hkvpdq';
  var PRODUCTS_ENDPOINT = SUPABASE_URL + '/rest/v1/products';
  var STORAGE_BUCKET = 'produtos';
  var STORAGE_ENDPOINT = SUPABASE_URL + '/storage/v1/object/' + STORAGE_BUCKET;

  function headers(extra) {
    return Object.assign({
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY,
      'Content-Type': 'application/json',
      Prefer: 'return=representation'
    }, extra || {});
  }

  function isUuid(id) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id || '');
  }

  function request(url, options) {
    var controller = new AbortController();
    var timeout = setTimeout(function () { controller.abort(); }, 8000);
    var requestOptions = Object.assign({}, options || {}, { signal: controller.signal });
    return fetch(url, requestOptions).then(function (response) {
      if (!response.ok) {
        return response.text().then(function (body) {
          throw new Error('Supabase ' + response.status + ': ' + body);
        });
      }
      if (response.status === 204) return null;
      return response.json();
    }).finally(function() {
      clearTimeout(timeout);
    });
  }

  function storageHeaders(extra) {
    return Object.assign({
      apikey: SUPABASE_PUBLISHABLE_KEY,
      Authorization: 'Bearer ' + SUPABASE_PUBLISHABLE_KEY
    }, extra || {});
  }

  function slugify(value) {
    return String(value || 'produto')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'produto';
  }

  function getFileExtension(file) {
    var fromName = (file && file.name || '').split('.').pop();
    if (fromName && fromName !== file.name) return fromName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
    var mime = file && file.type || '';
    if (mime.indexOf('png') !== -1) return 'png';
    if (mime.indexOf('webp') !== -1) return 'webp';
    if (mime.indexOf('gif') !== -1) return 'gif';
    return 'jpg';
  }

  function buildPublicStorageUrl(path) {
    return SUPABASE_URL + '/storage/v1/object/public/' + STORAGE_BUCKET + '/'
      + path.split('/').map(encodeURIComponent).join('/');
  }

  function uploadProductImage(file, productName) {
    if (!file) return Promise.reject(new Error('Arquivo de imagem nao informado.'));

    var ext = getFileExtension(file);
    var path = slugify(productName) + '-' + Date.now() + '-' + Math.random().toString(16).slice(2) + '.' + ext;
    var url = STORAGE_ENDPOINT + '/' + encodeURIComponent(path);

    return request(url, {
      method: 'POST',
      headers: storageHeaders({
        'Content-Type': file.type || 'application/octet-stream',
        'x-upsert': 'false'
      }),
      body: file
    }).then(function() {
      return buildPublicStorageUrl(path);
    });
  }

  function normalizePrice(price) {
    var value = Number(String(price || '').replace(',', '.'));
    return Number.isFinite(value) ? value : null;
  }

  function toAppProduct(row) {
    var imageUrl = row.image_url || '';
    if (/(^|\/)logo\.png(\?.*)?$/i.test(String(imageUrl).trim())) imageUrl = '';

    return {
      id: row.id,
      name: row.name,
      desc: row.description || '',
      price: row.price === null || typeof row.price === 'undefined' ? 'Consultar' : Number(row.price),
      category: row.category || 'hotdogs',
      imgCardapio: imageUrl,
      imgHome: '',
      imgHero: '',
      productUrl: row.product_url || '',
      linkType: row.link_type || 'whatsapp',
      isPromocao: !!row.is_promocao,
      isMaisPedido: !!row.is_mais_pedido,
      isProdutoSemana: !!row.is_produto_semana,
      is50Off: !!row.is_delivery_off
    };
  }

  function toSupabaseProduct(product, includeId) {
    var linkType = product.linkType === 'outros' ? 'outros' : 'whatsapp';
    var payload = {
      name: product.name || '',
      description: product.desc || '',
      price: normalizePrice(product.price),
      category: product.category || 'hotdogs',
      image_url: product.imgCardapio || '',
      product_url: linkType === 'outros' ? (product.productUrl || '') : '',
      link_type: linkType,
      is_promocao: !!product.isPromocao,
      is_mais_pedido: !!product.isMaisPedido,
      is_produto_semana: !!product.isProdutoSemana,
      is_delivery_off: !!product.is50Off,
      active: true,
      updated_at: new Date().toISOString()
    };
    if (includeId && isUuid(product.id)) payload.id = product.id;
    return payload;
  }

  function listProducts() {
    var url = PRODUCTS_ENDPOINT + '?select=*&active=eq.true&order=created_at.asc';
    var requestHeaders = headers();
    delete requestHeaders.Prefer;
    return request(url, { method: 'GET', headers: requestHeaders })
      .then(function (rows) { return (rows || []).map(toAppProduct); });
  }

  function createProduct(product) {
    return request(PRODUCTS_ENDPOINT + '?select=*', {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify(toSupabaseProduct(product))
    }).then(function (rows) { return toAppProduct(rows[0]); });
  }

  function updateProduct(product) {
    if (!isUuid(product.id)) return createProduct(product);
    var url = PRODUCTS_ENDPOINT + '?id=eq.' + encodeURIComponent(product.id) + '&select=*';
    return request(url, {
      method: 'PATCH',
      headers: headers(),
      body: JSON.stringify(toSupabaseProduct(product))
    }).then(function (rows) {
      if (rows && rows[0]) return toAppProduct(rows[0]);
      return createProduct(Object.assign({}, product, { id: '' }));
    });
  }

  function deleteProduct(id) {
    if (!isUuid(id)) return Promise.reject(new Error('ID de produto invalido para exclusao.'));

    var supabaseClient = window.supabaseClient || window.pampaDogSupabaseClient || null;
    if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
      supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
      window.pampaDogSupabaseClient = supabaseClient;
    }

    if (supabaseClient && typeof supabaseClient.from === 'function') {
      return supabaseClient
        .from('products')
        .delete()
        .eq('id', id)
        .then(function(result) {
          if (result && result.error) throw result.error;
          return { id: id };
        });
    }

    var url = PRODUCTS_ENDPOINT + '?id=eq.' + encodeURIComponent(id);
    return request(url, {
      method: 'DELETE',
      headers: headers({ Prefer: 'return=minimal' })
    }).then(function() {
      return { id: id };
    });
  }

  function clearProductsCache() {
    try {
      localStorage.removeItem('pampaDog_v1_products');
    } catch (e) {}
  }

  function deactivateProductsExcept(ids) {
    var url = PRODUCTS_ENDPOINT + '?active=eq.true';
    if (ids && ids.length) {
      url += '&id=not.in.(' + ids.map(encodeURIComponent).join(',') + ')';
    }
    return request(url, {
      method: 'PATCH',
      headers: headers({ Prefer: 'return=minimal' }),
      body: JSON.stringify({ active: false, updated_at: new Date().toISOString() })
    });
  }

  function upsertProduct(product) {
    if (!isUuid(product.id)) return createProduct(product);
    return request(PRODUCTS_ENDPOINT + '?on_conflict=id&select=*', {
      method: 'POST',
      headers: headers({ Prefer: 'resolution=merge-duplicates,return=representation' }),
      body: JSON.stringify(toSupabaseProduct(product, true))
    }).then(function(rows) {
      if (!rows || !rows[0]) throw new Error('Produto nao retornado pelo Supabase.');
      return toAppProduct(rows[0]);
    });
  }

  function upsertProducts(products) {
    return products.reduce(function (promise, product) {
      return promise.then(function (saved) {
        return upsertProduct(product).then(function (item) {
          saved.push(item);
          return saved;
        });
      });
    }, Promise.resolve([]));
  }

  function replaceProducts(products) {
    return upsertProducts(products).then(function(savedProducts) {
      var savedIds = savedProducts.map(function(product) { return product.id; }).filter(isUuid);
      if (!savedIds.length) throw new Error('Nenhum produto foi salvo no Supabase.');
      return deactivateProductsExcept(savedIds).then(function() {
        return listProducts();
      });
    });
  }

  window.PDSupabase = {
    url: SUPABASE_URL,
    project: 'fijcjkdsaigqwsoidmvv',
    listProducts: listProducts,
    createProduct: createProduct,
    updateProduct: updateProduct,
    deleteProduct: deleteProduct,
    clearProductsCache: clearProductsCache,
    uploadProductImage: uploadProductImage,
    upsertProducts: upsertProducts,
    replaceProducts: replaceProducts,
    isUuid: isUuid
  };
})();
