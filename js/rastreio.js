/* Rastreamento comum a todas as páginas: pixel da Meta, pixel do UTMify,
   repasse de UTMs, e-mail de suporte e nome da revisora no rodapé.
   Nada aqui envia dado pessoal: o nome digitado no quiz nunca passa por este arquivo. */
(function () {
  'use strict';

  var C = window.CONFIG || {};

  function preenchido(v) {
    return typeof v === 'string' && v.trim() !== '' && v.indexOf('PREENCHER') === -1;
  }
  window.ppPreenchido = preenchido;

  /* ---------- Pixel da Meta (só carrega com PIXEL_ID preenchido) ---------- */
  if (preenchido(C.PIXEL_ID)) {
    /* Código base padrão da Meta */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
      n.queue = []; t = b.createElement(e); t.async = !0;
      t.src = v; s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

    /* Desliga a coleta automática (cliques e metadados da página),
       para o pixel não ler o campo de nome do quiz. */
    window.fbq('set', 'autoConfig', false, C.PIXEL_ID);
    window.fbq('init', C.PIXEL_ID);
    window.fbq('track', 'PageView');
  }

  /* ---------- Pixel do UTMify (só carrega com UTMIFY_PIXEL_ID preenchido) ---------- */
  if (preenchido(C.UTMIFY_PIXEL_ID)) {
    window.pixelId = C.UTMIFY_PIXEL_ID;
    var a = document.createElement('script');
    a.setAttribute('async', '');
    a.setAttribute('defer', '');
    a.setAttribute('src', 'https://cdn.utmify.com.br/scripts/pixel/pixel.js');
    document.head.appendChild(a);
  }

  /* ---------- Envio de eventos (seguro mesmo sem pixel) ---------- */
  window.ppTrack = function (tipo, evento, params) {
    try {
      if (typeof window.fbq !== 'function') return;
      if (params) window.fbq(tipo, evento, params);
      else window.fbq(tipo, evento);
    } catch (e) { /* o rastreamento nunca pode quebrar a página */ }
  };

  /* ---------- Parâmetros de rastreamento repassados ao checkout ---------- */
  var EXTRAS = ['fbclid', 'gclid', 'ttclid', 'src', 'sck', 'xcod'];
  function ehRastreio(chave) {
    var k = String(chave).toLowerCase();
    return k.indexOf('utm_') === 0 || EXTRAS.indexOf(k) !== -1;
  }

  window.ppParametros = function () {
    var lista = [];
    try {
      new URLSearchParams(window.location.search).forEach(function (valor, chave) {
        if (valor && ehRastreio(chave)) lista.push([chave, valor]);
      });
    } catch (e) { /* navegador muito antigo: segue sem parâmetros */ }
    /* Guarda só nesta aba (sessionStorage), para quem recarrega a página */
    try {
      if (lista.length) sessionStorage.setItem('pp_params', JSON.stringify(lista));
      else lista = JSON.parse(sessionStorage.getItem('pp_params') || '[]') || [];
    } catch (e) { /* armazenamento bloqueado */ }
    return lista;
  };

  /* Só acrescenta o que falta: se o script do UTMify já mexeu em algum parâmetro
     do link (ele reescreve o utm_content, por exemplo), a versão dele é mantida. */
  window.ppComParametros = function (url) {
    var u;
    try { u = new URL(url, window.location.href); } catch (e) { return url; }
    window.ppParametros().forEach(function (p) {
      if (!u.searchParams.has(p[0])) u.searchParams.set(p[0], p[1]);
    });
    return u.toString();
  };

  /* ---------- E-mail de suporte no rodapé ---------- */
  function preencherSuporte() {
    var email = C.SUPORTE_EMAIL || '';
    /* Sem e-mail no config, a linha de suporte some (em vez de mostrar "PREENCHER" ao público) */
    var linhas = document.querySelectorAll('[data-suporte-linha]');
    for (var j = 0; j < linhas.length; j++) linhas[j].hidden = !preenchido(email);
    var nos = document.querySelectorAll('[data-suporte-email]');
    for (var i = 0; i < nos.length; i++) {
      nos[i].textContent = email;
      if (nos[i].tagName === 'A') nos[i].setAttribute('href', 'mailto:' + email);
    }
  }
  /* ---------- Nutricionista revisora (rodapé e FAQ) ---------- */
  function preencherRevisora() {
    if (!preenchido(C.REVISORA)) return; /* fica o aviso "[NOME DA NUTRICIONISTA, CRN — PREENCHER]" */
    var nos = document.querySelectorAll('[data-revisora]');
    for (var i = 0; i < nos.length; i++) nos[i].textContent = C.REVISORA.trim();
  }

  /* ---------- Taxa de serviço da Cakto perto de cada preço (.condicao) e no FAQ do preço ---------- */
  function avisoTaxa() {
    var taxa = (C.TAXA_SERVICO || '').trim();
    if (!taxa) return;
    var conds = document.querySelectorAll('.condicao');
    for (var i = 0; i < conds.length; i++) {
      if (conds[i].nextElementSibling && conds[i].nextElementSibling.className === 'taxa-aviso') continue;
      var p = document.createElement('p');
      p.className = 'taxa-aviso';
      p.textContent = '+ R$ ' + taxa + ' de taxa de serviço da plataforma, cobrada no checkout';
      p.style.cssText = 'font-size:13px;opacity:.75;margin:4px 0 10px;';
      conds[i].parentNode.insertBefore(p, conds[i].nextSibling);
    }
    var faqs = document.querySelectorAll('[data-faq-preco]');
    for (var j = 0; j < faqs.length; j++) faqs[j].textContent += ' No checkout entra também a taxa de serviço da plataforma (R$ ' + taxa + ').';
  }

  function preencherRodape() { preencherSuporte(); preencherRevisora(); avisoTaxa(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', preencherRodape);
  else preencherRodape();
})();
