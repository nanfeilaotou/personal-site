/* Independent experiment data. Paths are relative to assets/. */
window.NF_CARD_MATERIALS = [
  {
    id: 'starryblu', name: 'StarryBlu', variant: '用户提供 · 1010×608',
    asset: 'cards/starryblu-card.png', aspect: 1010 / 608, maxWidth: 505,
    sourcePage: '../../assets/cards/SOURCES.md', sourceLabel: '本地素材记录 ↗',
    description: '深色星空卡面，以源图颜色逐点聚合，再交给原生纹理。',
    privacy: '原文件保留；预览遮蔽样张中的演示号码与姓名。',
    redactions: [[.056, .758, .435, .158]], color: '#07152c'
  },
  {
    id: 'bybit', name: 'Bybit Card', variant: '用户提供 · 1010×630',
    asset: 'cards/bybit-card.png', aspect: 1010 / 630, maxWidth: 505,
    sourcePage: '../../assets/cards/SOURCES.md', sourceLabel: '本地素材记录 ↗',
    description: '使用完整透明正面，浅灰底、细线与品牌颜色保持原图。',
    privacy: '卡面没有卡号、有效期或持卡人姓名。', color: '#d1d7d9'
  },
  {
    id: 'cmb', name: '招商银行 Mastercard', variant: '万事达人民币 IC 借记卡 · 普卡',
    asset: 'cards/cmb-mastercard-blue.png', aspect: 581 / 373, maxWidth: 290.5,
    sourcePage: 'https://mobile.cmbchina.com/DCAMobile/applycard/familyportal.html', sourceLabel: '官方产品目录 ↗',
    description: '官网目录的蓝色普卡，581×373 透明原图；属于人民币借记卡。',
    privacy: '无卡号、有效期或姓名；不是全币种信用卡，不混用产品名称。', color: '#273578'
  }
];
window.NF_GLOBAL_BRANDS = [
  {name: 'Grok Bot', provider: '用户提供的候选图标', asset: 'brands/grok-bot-provided.png', sourcePage: '../../assets/cards/SOURCES.md', note: '512×512 透明 PNG；作为本地候选，不声称已核实官方出处。', background: 'dark'},
  {name: 'Club Sim', provider: 'HKT / CSL Mobile', asset: 'global/brands/clubsim.png', sourcePage: 'https://www.clubsim.com.hk/en/', note: '沿用官方彩色透明资源；显示宽度不超过 105px。', background: 'dark'},
  {name: 'iFAST Global Bank', provider: 'iFAST Global Bank', asset: 'global/brands/ifast.svg', sourcePage: 'https://www.ifastgb.com/', note: '官方独立银行字标，保留青色及深蓝配色。', background: 'light'},
  {name: 'Wise', provider: 'Wise', asset: 'global/brands/wise.svg', sourcePage: 'https://newsroom.wise.com/en-CAS/assets/228971/', note: '官方媒体包透明矢量字标，保留深绿。', background: 'light', padded: true},
  {name: 'PayPal', provider: 'PayPal', asset: 'global/brands/paypal.svg', sourcePage: 'https://www.paypal.com/us/webapps/mpp/logo-center', note: '官方 Logo Center 使用的彩色标志。', background: 'light'},
  {name: 'SMART', provider: 'Smart Communications · Philippines', asset: 'global/brands/smart.png', sourcePage: 'https://store.smart.com.ph/', note: '沿用已有官方透明资源。', background: 'dark'}
];
