/* =====================================================================
   CONFIG DO FUNIL · Prato Ponte
   ---------------------------------------------------------------------
   Este é o ÚNICO arquivo com dados de conta. Troque cada "PREENCHER".
   Enquanto um valor tiver a palavra PREENCHER, o site ignora o item
   (o pixel não carrega, o checkout não abre, a linha de suporte some etc.).
   Passo a passo no README.md.
   ===================================================================== */
window.CONFIG = {
  // Meta (Facebook): Gerenciador de Eventos > sua fonte de dados > ID do pixel (só números).
  PIXEL_ID: "1151759374007346", // PIXEL MÃE: o mesmo das campanhas da conta IU 1 e da Cakto (troca pedida pelo Victor em 22/11, 17h); antes era o PROSPE 28165559309792835

  // UTMify: o valor de window.pixelId que aparece no código do pixel do UTMify.
  UTMIFY_PIXEL_ID: "6b033c548d2ea0bfb5315503", // pixel da UTMify (22/11)

  // Link do checkout da Cakto do produto principal (Prato Ponte, R$ 27).
  CHECKOUT_URL: "https://pay.cakto.com.br/w7damjg_1356829",

  // Endereço publicado do site (GitHub Pages). As URLs dos upsells são montadas a partir dele.
  SITE_URL: "https://prato-ponte.replit.app",

  // Fim do funil (último upsell/downsell).
  // "members_area" = valor especial da Cakto: o botão leva a pessoa direto para a área de membros
  // (já logada, quando ela aceita a oferta). Se trocar por uma URL comum (https://...), o fim do
  // funil passa a ser a página obrigado.html, com um botão para essa URL.
  AREA_MEMBROS_URL: "members_area",

  // Taxa de serviço que a Cakto cobra do comprador no checkout (hoje R$ 0,99, configuração da conta Cakto).
  // Enquanto tiver valor, as páginas mostram "+ R$ 0,99 de taxa de serviço da plataforma" perto de cada preço,
  // para o preço da página bater com o do checkout. Se a taxa for desligada na Cakto, deixe "" (vazio).
  TAXA_SERVICO: "0,99",

  // E-mail de suporte (aparece no rodapé de todas as páginas).
  // Enquanto estiver "PREENCHER", a linha de suporte fica escondida no site.
  SUPORTE_EMAIL: "PREENCHER",

  // Nutricionista revisora: nome e CRN, do jeito que devem aparecer na página.
  // Ex.: "Fulana de Tal, CRN-3 12345". Enquanto estiver "PREENCHER", o rodapé e o FAQ mostram
  // o aviso "[NOME DA NUTRICIONISTA, CRN — PREENCHER]" (o briefing proíbe subir anúncio assim).
  REVISORA: "PREENCHER",

  // offer-id de cada oferta de upsell/downsell, copiado da Cakto (ver ../CAKTO_IDS.md).
  OFFER_ID: {
    up1: "gzwpmnv", // Upsell 1   · Prato Ponte 3 Meses   · R$ 67
    ds1: "65goypy", // Downsell 1 · Prato Ponte 3 Meses   · R$ 37
    up2: "35rjatk", // Upsell 2   · Kit Pequeno Provador  · R$ 47
    ds2: "34c2de4", // Downsell 2 · Kit Pequeno Provador  · R$ 27
    up3: "3fnat9h", // Upsell 3   · Fora de Casa          · R$ 37
    ds3: "6jccwce"  // Downsell 3 · Fora de Casa          · R$ 19,90
  }
};
