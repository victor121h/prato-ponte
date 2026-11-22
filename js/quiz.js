/* Quiz "Teste do Prato Ponte" + resultado (3 pontes) + mini VSL + oferta (tudo na mesma página).
   O estado fica no localStorage deste aparelho (inclusive o nome da criança),
   e o nome nunca vai para o pixel, para a URL nem para o checkout. */
(function () {
  'use strict';

  var C = window.CONFIG || {};
  var track = window.ppTrack || function () {};
  var preenchido = window.ppPreenchido || function (v) {
    return typeof v === 'string' && v.trim() !== '' && v.indexOf('PREENCHER') === -1;
  };
  var CHAVE = 'pp_quiz_v1';

  /* Tempos da oferta. Vídeo editado (video/vsl.mp4): 256,8 s (4:17), conferido pela transcrição.
     A Lívia começa a apresentar o Prato Ponte aos 187 s ("Foi pra isso que a gente criou
     o Prato Ponte. Você recebe...") e fala o preço aos ~230 s. Abre o que vier primeiro.
     Mesmo critério dos produtos 1 e 3: a oferta aparece quando a apresentação começa. */
  var OFERTA_NO_VIDEO_S = 187;   // segundos de vídeo assistido COM SOM
  var OFERTA_NA_PAGINA_S = 210;  // segundos desde que o resultado apareceu
  var PRECO = 27;
  var VIDEO_SRC = 'video/vsl.mp4';
  var VIDEO_POSTER = 'img/livia-poster.jpg';

  var ICONE_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  /* ---------- Perguntas (texto palavra por palavra do briefing, seção 7) ---------- */
  var OP_COME = ['Arroz', 'Feijão', 'Macarrão', 'Batata ou mandioca', 'Frango', 'Carne moída ou bife', 'Ovo', 'Pão', 'Banana', 'Maçã', 'Leite, iogurte ou mingau', 'Biscoito ou bolacha', 'Quase nada disso'];
  var OP_ALVOS = ['Cenoura', 'Abóbora', 'Brócolis', 'Abobrinha ou chuchu', 'Folhas (alface, couve)', 'Tomate', 'Feijão', 'Carne', 'Frango', 'Peixe', 'Ovo', 'Frutas novas'];

  /* Telas na ordem. "nome" é o nome da etapa enviado ao pixel (nunca o nome da criança).
     "pergunta" é o número da pergunta no briefing; "rastrear" manda a resposta como dado (seção 8). */
  var TELAS = [
    { id: 'capa', tipo: 'capa', nome: 'capa' },
    { id: 'idade', tipo: 'unica', nome: 'idade', pergunta: 1, rastrear: true, titulo: 'Quantos anos tem a criança?',
      opcoes: ['2 anos', '3 anos', '4 anos', '5 anos', '6 anos ou mais'] },
    { id: 'quem', tipo: 'unica', nome: 'quem_responde', pergunta: 2, titulo: 'Quem está respondendo?',
      opcoes: ['Mãe', 'Pai', 'Avó ou avô', 'Outro cuidador'] },
    { id: 'come', tipo: 'multipla', nome: 'ja_come_bem', pergunta: 3, rastrear: true, titulo: 'Quais destes a criança já come bem?',
      opcoes: OP_COME, exclusiva: 'Quase nada disso' },
    { id: 'refeicao', tipo: 'multipla', nome: 'hora_da_refeicao', pergunta: 4, rastrear: true, titulo: 'O que mais acontece na hora da refeição?',
      opcoes: ['Recusa antes de provar', 'Come sempre as mesmas coisas', 'Tira o que é verde do prato', 'Come muito pouco', 'Só quer leite, iogurte ou mingau', 'Só quer biscoito, salgadinho ou miojo', 'Demora muito ou levanta da mesa'] },
    { id: 'alvos', tipo: 'multipla', nome: 'quer_que_aceite', pergunta: 5, rastrear: true, max: 3, titulo: 'Quais alimentos você mais queria que ela aceitasse?',
      opcoes: OP_ALVOS },
    { id: 'desde', tipo: 'unica', nome: 'desde_quando', pergunta: 6, titulo: 'Desde quando é assim?',
      opcoes: ['Desde a introdução alimentar', 'Começou perto dos 2 anos', 'Começou depois dos 3', 'Não sei dizer'] },
    { id: 'pediatra', tipo: 'unica', nome: 'pediatra_acompanha', pergunta: 7, titulo: 'O pediatra acompanha o peso e o crescimento?',
      opcoes: ['Sim, e está tudo dentro do esperado', 'Sim, e pediu para ficar de olho', 'Faz um tempo que não levo'] },
    { id: 'reforco1', tipo: 'reforco1', nome: 'reforco_1' },
    { id: 'recusa', tipo: 'unica', nome: 'na_hora_da_recusa', pergunta: 8, titulo: 'Na hora da recusa, o que acaba acontecendo?',
      opcoes: ['Insisto até ela comer', 'Faço aviãozinho ou dou o celular', 'Troco por outra coisa para ela não ficar sem comer', 'Desisto e faço o de sempre', 'Fico sem saber o que fazer'] },
    { id: 'sente', tipo: 'unica', nome: 'como_se_sente', pergunta: 9, titulo: 'Como você se sente depois de uma refeição difícil?',
      opcoes: ['Frustrada', 'Preocupada com a saúde dela', 'Culpada', 'Cansada de cozinhar à toa'] },
    { id: 'tentou', tipo: 'multipla', nome: 'ja_tentou', pergunta: 10, rastrear: true, titulo: 'O que você já tentou?',
      opcoes: ['Esconder legume na comida', 'Prato colorido e divertido', 'Deixar sem comer até ter fome', 'Vitamina ou remédio de apetite receitado', 'Vídeos e receitas da internet', 'Consulta com profissional', 'Ainda não tentei nada'],
      exclusiva: 'Ainda não tentei nada' },
    { id: 'palpites', tipo: 'unica', nome: 'palpites_da_familia', pergunta: 11, titulo: 'Os palpites da família te incomodam?',
      opcoes: ['Muito, todo mundo acha que é culpa minha', 'Às vezes', 'Me incomoda mais a escola', 'Não ligo, mas me preocupo'] },
    { id: 'reforco2', tipo: 'reforco2', nome: 'reforco_2' },
    { id: 'crenca', tipo: 'unica', nome: 'crenca_ponte', pergunta: 12, titulo: 'Você concorda que fica mais fácil a criança provar algo novo quando ele aparece junto de uma comida que ela já gosta?',
      opcoes: ['Concordo totalmente', 'Concordo', 'Faz sentido, quero ver'] },
    { id: 'mudaria', tipo: 'unica', nome: 'o_que_mudaria', pergunta: 13, titulo: 'Se a hora de comer ficasse mais tranquila, o que mudaria aí?',
      opcoes: ['Eu ia me preocupar bem menos', 'Ia parar de cozinhar duas comidas', 'A família ia parar de palpitar', 'Tudo isso'] },
    { id: 'tempo', tipo: 'unica', nome: 'tempo_para_cozinhar', pergunta: 14, titulo: 'Quanto tempo você tem para cozinhar no dia?',
      opcoes: ['Até 20 minutos', 'De 20 a 40 minutos', 'Mais de 40 minutos', 'Prefiro adiantar no fim de semana'] },
    { id: 'nome', tipo: 'nome', nome: 'nome_da_crianca', pergunta: 15 },
    { id: 'carregando', tipo: 'carregando', nome: 'carregamento' },
    { id: 'resultado', tipo: 'resultado', nome: 'resultado' }
  ];

  /* ---------- Regra das pontes (briefing, tabela 7.1; a nutricionista revisa antes de subir) ---------- */
  /* Opção da pergunta 3 → base usada na tabela */
  var BASE_DA_OPCAO = {
    'Arroz': 'arroz', 'Feijão': 'feijao', 'Macarrão': 'macarrao', 'Batata ou mandioca': 'batata',
    'Frango': 'frango', 'Carne moída ou bife': 'carne', 'Ovo': 'ovo', 'Pão': 'pao',
    'Banana': 'banana', 'Maçã': 'maca', 'Leite, iogurte ou mingau': 'leite'
  };
  var NOME_BASE = {
    arroz: 'Arroz', feijao: 'Feijão', macarrao: 'Macarrão', batata: 'Batata ou mandioca', frango: 'Frango',
    carne: 'Carne', ovo: 'Ovo', pao: 'Pão', banana: 'Banana', maca: 'Maçã', leite: 'Leite, iogurte ou mingau'
  };
  /* Alvo: nome curto, artigo (para o carregamento), emoji do "Depois", texto do "Depois",
     base que a criança já come e que torna o alvo redundante, e as pontes na ordem da tabela. */
  var ALVOS = {
    'Cenoura': { nome: 'cenoura', art: 'a', emoji: '🥕', depois: 'Palitinhos de cenoura cozida, sozinhos, ao lado',
      pontes: [['arroz', 'Arroz com 1 colher de chá de cenoura ralada fina'], ['batata', 'Purê de batata com um pouco de cenoura cozida'], ['macarrao', 'Macarrão com fitas finas de cenoura'], ['frango', 'Frango desfiado com cenoura ralada']] },
    'Abóbora': { nome: 'abóbora', art: 'a', emoji: '🍽️', depois: 'Cubinhos de abóbora cozida, sozinhos, ao lado',
      pontes: [['batata', 'Purê meio batata, meio abóbora'], ['feijao', 'Feijão com cubinhos de abóbora'], ['arroz', 'Arroz com abóbora amassada (fica amarelinho)']] },
    'Brócolis': { nome: 'brócolis', art: 'o', emoji: '🥦', depois: 'Floretes de brócolis cozido, sozinhos, ao lado',
      pontes: [['arroz', 'Arroz com brócolis bem picadinho (as “arvorezinhas”)'], ['macarrao', 'Macarrão com floretes pequenos de brócolis'], ['ovo', 'Omelete com brócolis picado'], ['batata', 'Batata e brócolis assados juntos']] },
    'Abobrinha ou chuchu': { nome: 'abobrinha ou chuchu', art: 'a', emoji: '🥒', depois: 'Rodelinhas de abobrinha ou chuchu, sozinhas, ao lado',
      pontes: [['batata', 'Palitos de abobrinha assados como batata'], ['carne', 'Carne moída com abobrinha ralada'], ['frango', 'Frango desfiado com chuchu ralado']] },
    'Folhas (alface, couve)': { nome: 'folhas', art: 'as', emoji: '🥬', depois: 'Uma folha de alface ou couve, sozinha, ao lado',
      pontes: [['feijao', 'Feijão com couve bem fininha'], ['pao', 'Sanduíche com 1 folha de alface'], ['arroz', 'Arroz com couve picadinha']] },
    'Tomate': { nome: 'tomate', art: 'o', emoji: '🍅', depois: 'Tomate em pedacinhos, sem pele, sozinho, ao lado',
      pontes: [['macarrao', 'Macarrão com molho de tomate caseiro'], ['pao', 'Pão com tomate picadinho e queijo'], ['arroz', 'Arroz com tomate sem pele']] },
    'Feijão': { nome: 'feijão', art: 'o', emoji: '🍽️', ja: 'feijao', depois: 'Feijão sozinho, numa conchinha ao lado',
      pontes: [['arroz', 'Um pouco de caldo de feijão no arroz'], ['macarrao', 'Sopa de feijão com macarrãozinho'], ['carne', 'Feijão com carne desfiada']] },
    'Carne': { nome: 'carne', art: 'a', emoji: '🍽️', ja: 'carne', depois: 'Carne moída ou desfiada, sozinha, ao lado',
      pontes: [['macarrao', 'Macarrão à bolonhesa'], ['arroz', 'Arroz com carne moída soltinha'], ['feijao', 'Feijão com carne desfiada']] },
    'Frango': { nome: 'frango', art: 'o', emoji: '🍗', ja: 'frango', depois: 'Frango desfiado, sozinho, ao lado',
      pontes: [['arroz', 'Arroz com frango desfiado'], ['macarrao', 'Macarrão com frango desfiado'], ['batata', 'Purê de batata com frango desfiado por cima']] },
    'Peixe': { nome: 'peixe', art: 'o', emoji: '🐟', depois: 'Peixe desfiado, sem espinha, sozinho, ao lado',
      pontes: [['frango', 'Iscas de peixe empanadas no forno, no mesmo formato do frango'], ['batata', 'Bolinho de peixe com batata'], ['arroz', 'Arroz com peixe desfiado']] },
    'Ovo': { nome: 'ovo', art: 'o', emoji: '🥚', ja: 'ovo', depois: 'Ovo mexido ou cozido, sozinho, ao lado',
      pontes: [['pao', 'Pão com ovo mexido'], ['arroz', 'Arroz com ovo mexido'], ['batata', 'Batata com ovo cozido picado']] },
    'Frutas novas': { nome: 'frutas novas', art: 'as', emoji: '🥭', depois: 'A fruta nova em pedacinhos, sozinha, ao lado',
      pontes: [['banana', 'Banana com rodelas de uma fruta parecida (mamão, manga)'], ['maca', 'Maçã e pera cortadas do mesmo jeito'], ['leite', 'Iogurte natural com fruta amassada']] }
  };
  var ORDEM_EXTRA = ['Cenoura', 'Abóbora', 'Brócolis', 'Abobrinha ou chuchu', 'Folhas (alface, couve)', 'Tomate', 'Feijão', 'Carne', 'Frango', 'Peixe', 'Ovo', 'Frutas novas'];

  function primeiraMaiuscula(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : t; }

  /* Bases que a criança já come, na ordem da lista da pergunta 3 */
  function basesSeguras(r) {
    var come = Array.isArray(r.come) ? r.come : [];
    if (come.indexOf('Quase nada disso') !== -1) return [];
    return OP_COME.filter(function (o) { return come.indexOf(o) !== -1 && BASE_DA_OPCAO[o]; })
      .map(function (o) { return BASE_DA_OPCAO[o]; });
  }

  /* Monta sempre 3 cartões:
     1) para cada alimento marcado na pergunta 5 (até 3), a primeira comida segura com ponte; sem nenhuma, a ponte reserva;
     2) faltando cartão, a próxima comida segura com ponte para os mesmos alimentos;
     3) ainda faltando, uma ponte extra para outro alimento comum, a partir do que a criança já come;
     4) por fim, a ponte reserva para outro alimento comum. */
  function montarPontes(r) {
    var alvos = (Array.isArray(r.alvos) ? r.alvos : []).filter(function (a) { return ALVOS[a]; }).slice(0, 3);
    var bases = basesSeguras(r);
    var cartoes = [];
    var usadas = {};
    function chave(a, b) { return a + '|' + b; }
    function achar(alvo) {
      var lista = ALVOS[alvo].pontes;
      for (var i = 0; i < bases.length; i++) {
        for (var j = 0; j < lista.length; j++) {
          if (lista[j][0] === bases[i] && !usadas[chave(alvo, bases[i])]) return lista[j];
        }
      }
      return null;
    }
    function add(alvo, ponte, extra) {
      var a = ALVOS[alvo];
      if (ponte) {
        usadas[chave(alvo, ponte[0])] = true;
        cartoes.push({ alvo: alvo, segura: NOME_BASE[ponte[0]], pontinha: ponte[1], depois: a.depois, emoji: a.emoji, extra: extra });
      } else {
        usadas[chave(alvo, 'reserva')] = true;
        cartoes.push({ alvo: alvo, segura: 'A comida de sempre', pontinha: primeiraMaiuscula(a.nome) + ' num potinho separado, ao lado da comida de sempre, só para olhar. Sem pedir para provar', depois: a.depois, emoji: a.emoji, extra: extra, reserva: true });
      }
    }
    alvos.forEach(function (alvo) { add(alvo, achar(alvo), false); });
    var mudou = true;
    while (cartoes.length < 3 && mudou) {
      mudou = false;
      for (var i = 0; i < alvos.length && cartoes.length < 3; i++) {
        var p = achar(alvos[i]);
        if (p) { add(alvos[i], p, false); mudou = true; }
      }
    }
    var jaUsados = alvos.slice();
    for (var k = 0; k < ORDEM_EXTRA.length && cartoes.length < 3; k++) {
      var alvo = ORDEM_EXTRA[k];
      if (jaUsados.indexOf(alvo) !== -1) continue;
      if (ALVOS[alvo].ja && bases.indexOf(ALVOS[alvo].ja) !== -1) continue; /* a criança já come isso */
      var pe = achar(alvo);
      if (pe) { add(alvo, pe, true); jaUsados.push(alvo); }
    }
    for (var m = 0; m < ORDEM_EXTRA.length && cartoes.length < 3; m++) {
      if (jaUsados.indexOf(ORDEM_EXTRA[m]) !== -1) continue;
      add(ORDEM_EXTRA[m], null, true);
      jaUsados.push(ORDEM_EXTRA[m]);
    }
    return cartoes;
  }

  function indice(id) {
    for (var i = 0; i < TELAS.length; i++) if (TELAS[i].id === id) return i;
    return -1;
  }
  var I_PRIMEIRA = 1;
  var I_NOME = indice('nome');
  var I_RESULTADO = indice('resultado');

  /* ---------- Estado ---------- */
  function novoEstado() {
    return { tela: 0, respostas: {}, nome: '', resultadoEm: 0, ofertaAberta: false, enviadas: {} };
  }
  function lerEstado() {
    try {
      var s = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (s && typeof s.tela === 'number' && s.tela >= 0 && s.tela < TELAS.length &&
          s.respostas && typeof s.respostas === 'object') {
        if (typeof s.nome !== 'string') s.nome = '';
        if (!s.enviadas || typeof s.enviadas !== 'object') s.enviadas = {};
        return s;
      }
    } catch (e) { /* estado corrompido ou armazenamento bloqueado */ }
    return null;
  }
  function salvar() {
    try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) { /* segue sem salvar */ }
  }
  var estado = lerEstado() || novoEstado();

  /* Resposta como dado (perguntas 1, 3, 4, 5 e 10): um evento por opção marcada.
     Só reenvia se a resposta mudou (quem volta e avança de novo não duplica). */
  function rastrearResposta(t) {
    if (!t.rastrear) return;
    var resp = estado.respostas[t.id];
    var lista = Array.isArray(resp) ? resp : (resp ? [resp] : []);
    var assinatura = JSON.stringify(lista);
    if (!lista.length || estado.enviadas[t.id] === assinatura) return;
    estado.enviadas[t.id] = assinatura;
    salvar();
    lista.forEach(function (op) { track('trackCustom', 'Quiz_Resposta', { pergunta: t.pergunta, resposta: op }); });
  }

  /* ---------- DOM ---------- */
  function $(id) { return document.getElementById(id); }
  var telaCapa = $('tela-capa');
  var telaQuiz = $('tela-quiz');
  var telaCarregando = $('tela-carregando');
  var telaResultado = $('tela-resultado');
  var conteudo = $('quiz-conteudo');
  var barra = $('progresso-barra');
  var progresso = barra.parentNode;
  var btnVoltar = $('btn-voltar');

  function el(tag, attrs, filhos) {
    var n = document.createElement(tag);
    if (attrs) {
      for (var k in attrs) {
        if (!Object.prototype.hasOwnProperty.call(attrs, k)) continue;
        if (k === 'class') n.className = attrs[k];
        else if (k === 'text') n.textContent = attrs[k];
        else if (k === 'html') n.innerHTML = attrs[k];
        else n.setAttribute(k, attrs[k]);
      }
    }
    (filhos || []).forEach(function (f) {
      if (f) n.appendChild(typeof f === 'string' ? document.createTextNode(f) : f);
    });
    return n;
  }

  function juntar(lista) {
    if (lista.length <= 1) return lista.join('');
    return lista.slice(0, -1).join(', ') + ' e ' + lista[lista.length - 1];
  }

  /* ---------- Cartão de ponte ---------- */
  function cartaoPonte(c, titulo) {
    function passo(emoji, classe, rotulo, texto) {
      return el('li', null, [
        el('span', { class: 'bolinha', 'aria-hidden': 'true', text: emoji }),
        el('div', null, [
          el('span', { class: 'rotulo rotulo--' + classe, text: rotulo }),
          el('p', { text: texto })
        ])
      ]);
    }
    var filhos = [
      el('span', { class: 'ponte-topo', text: titulo }),
      el('ol', null, [
        passo('🟢', 'segura', 'Já come', c.segura),
        passo('🟠', 'pontinha', 'Pontinha', c.pontinha),
        passo(c.emoji, 'depois', 'Depois', c.depois)
      ])
    ];
    if (c.extra) filhos.push(el('p', { class: 'ponte-extra', text: c.reserva ? 'Ponte extra para um alimento que muitas crianças recusam.' : 'Ponte extra, a partir do que a criança já come.' }));
    return el('div', { class: 'ponte' }, filhos);
  }

  /* ---------- Navegação ---------- */
  var timerAvanco = null;

  function mostrar(i, modo) {
    i = Math.max(0, Math.min(i, TELAS.length - 1));
    var t = TELAS[i];
    if (timerAvanco) { clearTimeout(timerAvanco); timerAvanco = null; }
    estado.tela = i;
    salvar();

    /* Pixel primeiro, antes de qualquer campo ser preenchido na tela */
    if (modo === 'avancar' || modo === 'inicio') {
      track('trackCustom', 'Quiz_Etapa', { etapa: i + 1, nome: t.nome });
    }
    /* Histórico do navegador: o "voltar" do celular volta uma pergunta */
    try {
      if (modo === 'avancar') history.pushState({ tela: i }, '');
      else if (modo === 'inicio' || modo === 'voltar') history.replaceState({ tela: i }, '');
    } catch (e) { /* sem histórico, segue normal */ }

    pararCarregamento();
    var ehQuiz = ['capa', 'carregando', 'resultado'].indexOf(t.tipo) === -1;
    telaCapa.hidden = t.tipo !== 'capa';
    telaQuiz.hidden = !ehQuiz;
    telaCarregando.hidden = t.tipo !== 'carregando';
    telaResultado.hidden = t.tipo !== 'resultado';

    if (t.tipo !== 'resultado') pausarVideo();
    if (ehQuiz) desenharQuiz(t, i);
    else if (t.tipo === 'carregando') iniciarCarregamento();
    else if (t.tipo === 'resultado') mostrarResultado(modo);

    window.scrollTo(0, 0);
    document.documentElement.classList.remove('restaurando');
  }

  function avancar() {
    var atual = TELAS[estado.tela];
    if (atual) rastrearResposta(atual);
    mostrar(estado.tela + 1, 'avancar');
  }

  window.addEventListener('popstate', function (e) {
    var alvo = e.state && typeof e.state.tela === 'number' ? e.state.tela : 0;
    if (alvo < 0 || alvo >= TELAS.length) alvo = 0;
    if (TELAS[alvo].tipo === 'carregando') alvo = I_NOME; /* nunca volta para o carregamento */
    mostrar(alvo, 'historico');
  });

  /* ---------- Telas do quiz ---------- */
  function desenharQuiz(t, i) {
    var total = I_NOME - I_PRIMEIRA + 1;
    var pos = i - I_PRIMEIRA + 1;
    var pct = Math.round(pos / total * 100);
    barra.style.width = pct + '%';
    progresso.setAttribute('aria-valuenow', String(pct));
    progresso.setAttribute('aria-valuetext', 'Etapa ' + pos + ' de ' + total);

    conteudo.innerHTML = '';
    if (t.tipo === 'unica' || t.tipo === 'multipla') desenharPergunta(t);
    else if (t.tipo === 'reforco1') desenharReforco1();
    else if (t.tipo === 'reforco2') desenharReforco2();
    else if (t.tipo === 'nome') desenharNome();

    var h = conteudo.querySelector('h2');
    if (h) {
      h.setAttribute('tabindex', '-1');
      try { h.focus({ preventScroll: true }); } catch (e) { /* ok */ }
    }
  }

  function marcar(botao, ligado, multipla) {
    botao.classList.toggle('selecionada', ligado);
    botao.setAttribute(multipla ? 'aria-checked' : 'aria-pressed', ligado ? 'true' : 'false');
  }

  function botaoContinuar(texto, acao) {
    var b = el('button', { type: 'button', class: 'btn', text: texto || 'Continuar' });
    b.addEventListener('click', acao);
    return b;
  }

  function desenharPergunta(t) {
    var multipla = t.tipo === 'multipla';
    var resp = estado.respostas[t.id];
    var selecionadas = multipla ? (Array.isArray(resp) ? resp.slice() : []) : null;
    var tituloId = 'q-' + t.id;
    var btnCont = null;
    var avisoLimite = null;

    conteudo.appendChild(el('h2', { class: 'q-titulo', id: tituloId, text: t.titulo }));
    if (multipla) conteudo.appendChild(el('p', { class: 'q-dica', text: t.max ? 'Escolha até ' + t.max + '.' : 'Pode marcar mais de uma.' }));
    if (t.max) {
      avisoLimite = el('p', { class: 'q-limite', role: 'status', 'aria-live': 'polite' });
      avisoLimite.hidden = true;
      conteudo.appendChild(avisoLimite);
    }

    var lista = el('div', { class: 'opcoes', role: 'group', 'aria-labelledby': tituloId });

    function atualizar() {
      var filhos = lista.children;
      for (var k = 0; k < filhos.length; k++) {
        marcar(filhos[k], selecionadas.indexOf(filhos[k].getAttribute('data-op')) !== -1, true);
      }
      btnCont.disabled = selecionadas.length === 0;
    }

    t.opcoes.forEach(function (op) {
      var b = el('button', {
        type: 'button',
        class: 'opcao' + (multipla ? ' opcao--check' : ''),
        'data-op': op
      }, [el('span', { text: op }), el('span', { class: 'marca', 'aria-hidden': 'true', html: ICONE_CHECK })]);
      if (multipla) b.setAttribute('role', 'checkbox');
      marcar(b, multipla ? selecionadas.indexOf(op) !== -1 : resp === op, multipla);

      b.addEventListener('click', function () {
        if (multipla) {
          var k = selecionadas.indexOf(op);
          if (k === -1) {
            if (t.exclusiva) {
              if (op === t.exclusiva) selecionadas = [];
              else selecionadas = selecionadas.filter(function (x) { return x !== t.exclusiva; });
            }
            if (t.max && selecionadas.length >= t.max) {
              avisoLimite.textContent = 'Você já marcou ' + t.max + '. Desmarque um para trocar.';
              avisoLimite.hidden = false;
              return;
            }
            selecionadas.push(op);
          } else {
            selecionadas.splice(k, 1);
          }
          if (avisoLimite) avisoLimite.hidden = true;
          estado.respostas[t.id] = selecionadas.slice();
          salvar();
          atualizar();
        } else {
          if (timerAvanco) return; /* evita toque duplo */
          estado.respostas[t.id] = op;
          salvar();
          var filhos = lista.children;
          for (var j = 0; j < filhos.length; j++) marcar(filhos[j], filhos[j] === b, false);
          timerAvanco = setTimeout(function () { timerAvanco = null; avancar(); }, 260);
        }
      });
      lista.appendChild(b);
    });
    conteudo.appendChild(lista);

    if (multipla) {
      btnCont = botaoContinuar('Continuar', function () { if (selecionadas.length) avancar(); });
      conteudo.appendChild(el('div', { class: 'rodape-fixo' }, [btnCont]));
      atualizar();
    }
  }

  function desenharReforco1() {
    conteudo.appendChild(el('div', { class: 'reforco' }, [
      el('div', { class: 'reforco-icone', 'aria-hidden': 'true', text: '🔔' }),
      el('h2', { class: 'q-titulo', text: 'Respira: o que você descreveu é muito comum nessa idade.' }),
      el('p', { html: 'Entre os 2 e os 6 anos, quase toda criança passa a desconfiar de comida nova. É como um alarme que apita quando aparece algo que ela não conhece: o <strong>Alarme do Novo</strong> (os pesquisadores chamam de neofobia alimentar). Não é manha. E não é culpa sua.' }),
      el('p', { class: 'fonte', text: 'O Guia Alimentar do Ministério da Saúde avisa que é comum a criança começar a recusar alguns alimentos perto dos 2 anos.' })
    ]));
    conteudo.appendChild(el('div', { class: 'rodape-fixo' }, [botaoContinuar('Continuar', avancar)]));
  }

  function desenharReforco2() {
    conteudo.appendChild(el('div', { class: 'reforco' }, [
      el('h2', { class: 'q-titulo', text: 'Teoria você já viu. O que falta é a ponte.' }),
      cartaoPonte({
        segura: 'Arroz',
        pontinha: 'Arroz com 1 colher de chá de cenoura ralada bem fininha (e você conta que tem cenoura)',
        emoji: '🥕',
        depois: 'Palitinho de cenoura cozida ao lado do arroz'
      }, 'Exemplo de ponte · cenoura'),
      el('p', { html: 'Sem esconder e sem forçar: o novo chega colado no que ela já conhece, várias vezes. <strong>Isso é o Prato Ponte.</strong>' })
    ]));
    conteudo.appendChild(el('div', { class: 'rodape-fixo' }, [botaoContinuar('Continuar', avancar)]));
  }

  function limparNome(v) {
    v = String(v || '').replace(/\s+/g, ' ').trim().split(' ')[0].slice(0, 20);
    return v ? v.charAt(0).toUpperCase() + v.slice(1) : '';
  }

  function desenharNome() {
    conteudo.appendChild(el('h2', { class: 'q-titulo', id: 'q-nome', text: 'Como a criança se chama?' }));
    conteudo.appendChild(el('p', { class: 'q-dica', text: 'Só o primeiro nome. É opcional.' }));
    /* Campo fora de <form> e sem atributos de "nome", para nenhum script de terceiros identificar */
    var campo = el('input', {
      class: 'campo', id: 'q-apelido', type: 'text', maxlength: '20',
      autocomplete: 'off', autocapitalize: 'words', spellcheck: 'false',
      enterkeyhint: 'go', placeholder: 'Ex.: Lucas', 'aria-labelledby': 'q-nome'
    });
    campo.value = estado.nome || '';
    conteudo.appendChild(campo);
    conteudo.appendChild(el('p', { class: 'privacidade', text: '🔒 O nome fica só neste aparelho e não é enviado para lugar nenhum.' }));

    function concluir(nome) {
      estado.nome = nome;
      salvar();
      avancar();
    }
    var ver = botaoContinuar('Ver as pontes', function () { concluir(limparNome(campo.value)); });
    var pular = el('button', { type: 'button', class: 'link-discreto', text: 'pular' });
    pular.addEventListener('click', function () { concluir(''); });
    campo.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') { e.preventDefault(); concluir(limparNome(campo.value)); }
    });
    conteudo.appendChild(el('div', { class: 'acoes-nome' }, [ver, pular]));
  }

  /* ---------- Carregamento (~6 s) ---------- */
  var timersCarregando = [];
  function pararCarregamento() {
    timersCarregando.forEach(clearTimeout);
    timersCarregando = [];
  }
  function iniciarCarregamento() {
    prepararVideo(); /* o vídeo começa a baixar enquanto a animação roda */
    var r = estado.respostas;
    var alvos = Array.isArray(r.alvos) ? r.alvos : [];
    var a = ALVOS[alvos[0]];
    $('carregando-alvo').textContent = 'Montando as pontes até ' + (a ? a.art + ' ' + a.nome : 'os alimentos novos') + '...';
    $('carregando-idade').textContent = 'Ajustando o cardápio para ' + (r.idade || 'a idade da criança') + '...';
    var itens = telaCarregando.querySelectorAll('.passos-carregando li');
    for (var k = 0; k < itens.length; k++) itens[k].className = '';
    itens[0].className = 'ativo';
    function passo(ms, fn) { timersCarregando.push(setTimeout(fn, ms)); }
    passo(2000, function () { itens[0].className = 'feito'; itens[1].className = 'ativo'; });
    passo(4000, function () { itens[1].className = 'feito'; itens[2].className = 'ativo'; });
    passo(6000, function () { itens[2].className = 'feito'; });
    passo(6500, function () { mostrar(I_RESULTADO, 'avancar'); });
  }

  /* ---------- Resultado ---------- */
  function faixaDoCardapio(idade) {
    return idade === '2 anos' || idade === '3 anos' ? '2 a 3 anos' : '4 a 6 anos';
  }
  var TEMPO_TEXTO = {
    'Até 20 minutos': 'que ficam prontas em até 20 minutos',
    'De 20 a 40 minutos': 'que cabem em 20 a 40 minutos de cozinha',
    'Mais de 40 minutos': 'para quem tem mais de 40 minutos na cozinha',
    'Prefiro adiantar no fim de semana': 'com o que dá para adiantar no fim de semana'
  };

  function mostrarResultado(modo) {
    var r = estado.respostas;
    $('res-titulo').textContent = estado.nome
      ? 'As 3 primeiras pontes de ' + estado.nome + ' estão prontas'
      : 'As 3 primeiras pontes do seu filho estão prontas';
    $('res-idade').textContent = r.idade || 'não informada';

    var come = Array.isArray(r.come) ? r.come : [];
    var resCome = $('res-come');
    if (!come.length || come.indexOf('Quase nada disso') !== -1) {
      resCome.textContent = 'quase nada da lista. Tudo bem: a primeira ponte começa ao lado da comida de sempre.';
    } else {
      resCome.textContent = juntar(OP_COME.filter(function (o) { return come.indexOf(o) !== -1; }).map(function (o) { return o.toLowerCase(); })) + '.';
    }
    var alvos = (Array.isArray(r.alvos) ? r.alvos : []).filter(function (a) { return ALVOS[a]; });
    $('res-alvos').textContent = alvos.length ? juntar(alvos.map(function (a) { return ALVOS[a].nome; })) + '.' : 'legumes e verduras.';

    var caixa = $('res-pontes');
    caixa.innerHTML = '';
    montarPontes(r).forEach(function (c, i) {
      caixa.appendChild(cartaoPonte(c, 'Ponte ' + (i + 1) + ' · ' + primeiraMaiuscula(ALVOS[c.alvo].nome)));
    });

    var ped = $('res-pediatra');
    if (r.pediatra === 'Sim, e pediu para ficar de olho') {
      ped.textContent = 'Siga o acompanhamento do pediatra. O Prato Ponte pode ser usado junto, com o ok dele.';
      ped.hidden = false;
    } else if (r.pediatra === 'Faz um tempo que não levo') {
      ped.innerHTML = '';
      ped.appendChild(document.createTextNode('Vale marcar uma consulta de rotina. Os sinais de alerta estão '));
      ped.appendChild(el('a', { href: '#alerta', text: 'no fim desta página' }));
      ped.appendChild(document.createTextNode('.'));
      ped.hidden = false;
    } else {
      ped.hidden = true;
    }
    $('res-aviso-idade').hidden = r.idade !== '6 anos ou mais';

    $('oferta-faixa').textContent = faixaDoCardapio(r.idade);
    $('oferta-tempo').textContent = TEMPO_TEXTO[r.tempo] || 'que cabem no seu tempo de cozinha';
    desenharChips(alvos);

    if (!estado.resultadoEm) { estado.resultadoEm = Date.now(); salvar(); }
    if (modo !== 'historico') track('track', 'ViewContent', { content_name: 'Prato Ponte' });

    iniciarVideo();
    if (estado.ofertaAberta) abrirOferta('restaurada', true);
    else if (videoFalhou) abrirOferta('erro_video');
    else agendarOferta();

    try { $('res-titulo').focus({ preventScroll: true }); } catch (e) { /* ok */ }
  }

  function desenharChips(alvos) {
    var caixa = $('chips-alimentos');
    caixa.innerHTML = '';
    ORDEM_EXTRA.forEach(function (a) {
      var seu = alvos.indexOf(a) !== -1;
      caixa.appendChild(el('span', { class: 'chip' + (seu ? ' sua' : ''), text: (seu ? '✓ ' : '') + primeiraMaiuscula(ALVOS[a].nome) }));
    });
    $('chips-legenda').hidden = alvos.length === 0;
  }

  /* ---------- Mini VSL ---------- */
  var video = $('vsl-video');
  var btnSom = $('vsl-som');
  var btnToque = $('vsl-toque');
  var barraVsl = $('vsl-barra');
  var progVsl = $('vsl-progresso');
  var comSom = false;
  var videoPreparado = false;

  function prepararVideo() {
    if (videoPreparado) return;
    videoPreparado = true;
    video.setAttribute('poster', VIDEO_POSTER);
    video.preload = 'auto';
    video.src = VIDEO_SRC;
  }
  function tocar() {
    var p = video.play();
    if (p && typeof p.catch === 'function') p.catch(function () { /* autoplay bloqueado: o botão "Toque para ouvir" continua lá */ });
  }
  function pausarVideo() { if (videoPreparado && !video.paused) video.pause(); }
  function iniciarVideo() {
    prepararVideo();
    if (!comSom) { video.muted = true; video.loop = true; }
    if (video.paused && !videoFalhou) tocar();
  }

  btnSom.addEventListener('click', function () {
    comSom = true;
    video.muted = false;
    video.loop = false;
    try { video.currentTime = 0; } catch (e) { /* ainda sem dados */ }
    tocar();
    btnSom.hidden = true;
    btnToque.hidden = false;
    barraVsl.hidden = false;
    track('trackCustom', 'VSL_Play');
  });

  btnToque.addEventListener('click', function () {
    if (video.ended) { try { video.currentTime = 0; } catch (e) { /* ok */ } }
    if (video.paused) tocar(); else video.pause();
  });
  video.addEventListener('play', function () {
    btnToque.classList.remove('pausado');
    btnToque.setAttribute('aria-label', 'Pausar o vídeo');
  });
  video.addEventListener('pause', function () {
    if (!comSom) return;
    btnToque.classList.add('pausado');
    btnToque.setAttribute('aria-label', 'Continuar o vídeo');
  });
  video.addEventListener('timeupdate', function () {
    if (!comSom) return;
    if (video.duration) progVsl.style.width = Math.min(100, video.currentTime / video.duration * 100) + '%';
    if (video.currentTime >= OFERTA_NO_VIDEO_S) abrirOferta('video');
  });
  video.addEventListener('ended', function () { if (comSom) abrirOferta('video'); });
  var videoFalhou = false;
  video.addEventListener('error', function () {
    if (!videoPreparado) return;
    videoFalhou = true;
    btnSom.hidden = true;
    btnToque.hidden = true;
    barraVsl.hidden = true;
    $('vsl-erro').hidden = false;
    /* sem vídeo, ninguém fica esperando: a oferta abre assim que o resultado estiver na tela */
    if (!telaResultado.hidden) abrirOferta('erro_video');
  });

  /* ---------- Oferta ---------- */
  var timerOferta = null;
  var ofertaVisivel = false;

  function agendarOferta() {
    if (ofertaVisivel || timerOferta) return;
    var falta = OFERTA_NA_PAGINA_S * 1000 - (Date.now() - (estado.resultadoEm || Date.now()));
    timerOferta = setTimeout(function () { timerOferta = null; abrirOferta('tempo'); }, Math.max(0, falta));
  }

  function abrirOferta(origem, silencioso) {
    if (ofertaVisivel) return;
    ofertaVisivel = true;
    if (timerOferta) { clearTimeout(timerOferta); timerOferta = null; }
    var oferta = $('oferta');
    oferta.hidden = false;
    $('ler-oferta').hidden = true;
    if (!silencioso) oferta.classList.add('oferta-abre');
    if (!estado.ofertaAberta) { estado.ofertaAberta = true; salvar(); }
    if (!silencioso) track('trackCustom', 'VSL_Oferta', { origem: origem });
    if (origem === 'link') {
      var topo = $('oferta-topo');
      if (topo && topo.scrollIntoView) topo.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  /* ---------- Checkout (Cakto) ---------- */
  var indoAoCheckout = false;
  function urlCheckout(base) {
    return window.ppComParametros ? window.ppComParametros(base) : base;
  }
  function irParaCheckout(e) {
    e.preventDefault();
    if (!preenchido(C.CHECKOUT_URL)) {
      if (window.console) console.warn('Prato Ponte: CHECKOUT_URL ainda não foi preenchido no config.js.');
      return;
    }
    if (indoAoCheckout) return;
    indoAoCheckout = true;
    /* Parte do link como está agora (com o que o UTMify tiver acrescentado) e completa o que faltar */
    var atual = this.getAttribute('href');
    var url = urlCheckout(atual && atual !== '#' ? atual : C.CHECKOUT_URL);
    track('track', 'InitiateCheckout', { value: PRECO, currency: 'BRL', content_name: 'Prato Ponte' });
    /* pequena espera só quando há pixel, para o evento sair antes de trocar de página */
    setTimeout(function () { window.location.href = url; }, typeof window.fbq === 'function' ? 300 : 0);
    setTimeout(function () { indoAoCheckout = false; }, 4000);
  }
  function configurarCheckout() {
    var links = document.querySelectorAll('[data-checkout]');
    var href = preenchido(C.CHECKOUT_URL) ? urlCheckout(C.CHECKOUT_URL) : '#';
    for (var k = 0; k < links.length; k++) {
      links[k].setAttribute('href', href);
      links[k].addEventListener('click', irParaCheckout);
    }
  }
  window.addEventListener('pageshow', function (e) { if (e.persisted) indoAoCheckout = false; });

  /* ---------- Início ---------- */
  function refazer() {
    pausarVideo();
    if (timerOferta) { clearTimeout(timerOferta); timerOferta = null; }
    estado = novoEstado();
    salvar();
    comSom = false;
    btnSom.hidden = !$('vsl-erro').hidden; /* se o vídeo falhou, o botão continua escondido */
    btnToque.hidden = true;
    barraVsl.hidden = true;
    progVsl.style.width = '0';
    ofertaVisivel = false;
    $('oferta').hidden = true;
    $('oferta').classList.remove('oferta-abre');
    $('ler-oferta').hidden = false;
    mostrar(0, 'avancar');
  }

  configurarCheckout();
  $('btn-comecar').addEventListener('click', avancar);
  $('btn-ler-oferta').addEventListener('click', function () { abrirOferta('link'); });
  $('btn-refazer').addEventListener('click', refazer);
  btnVoltar.addEventListener('click', function () {
    var anterior = estado.tela - 1;
    if (anterior < 0) anterior = 0;
    mostrar(anterior, 'voltar');
  });

  /* Para os testes e para a revisão da nutricionista: a regra das pontes fica acessível no console */
  window.ppMontarPontes = montarPontes;

  mostrar(estado.tela, 'inicio');
})();
