/* NFI18n — 最小 i18n 接口（原型）。
 * 规则：只有字典里真正存在的英文键才显示英文；缺失键回退中文，并在元素上标注
 * lang="zh-CN" + data-i18n-fallback，样式层可显示「中文」角标——不假装已翻译。 */
(function (global) {
  'use strict';
  const DICT = {
    zh: {
      'nav.label': '主导航', 'nav.home': '首页', 'nav.ai': 'AI', 'nav.global': '全球', 'nav.personal': '个人',
      'nav.home.meta': '开场 · 起点', 'nav.ai.meta': '模型 · 本地 AI · Agent', 'nav.global.meta': '全球数字服务 · 经由', 'nav.personal.meta': '个人 · 场',
      'brand.home': 'NANFEILAOTOU，返回首页', 'logo.slot': 'Logo 预留位',
      'lang.group': '语言', 'lang.zh': '中文', 'lang.en': 'English', 'lang.toZh': '切换到中文', 'lang.toEn': '切换到英文',
      'theme.group': '主题', 'theme.light': '浅色', 'theme.dark': '深色', 'theme.system': '跟随系统', 'theme.auto': '自动',
      'theme.toLight': '切换到浅色主题', 'theme.toDark': '切换到深色主题',
      'theme.artNote': '开场是艺术视觉，不受主题影响。主题在 AI / 全球 / 个人与内容页生效。',
      'theme.saved': '主题已设为', 'lang.saved': '已切换为中文',
      'menu.open': '打开菜单', 'menu.close': '关闭菜单', 'menu.title': '站点菜单', 'menu.prefs': '偏好设置',
      'readout.at': '位置', 'readout.go': '前往',
      'fallback.badge': '中文'
    },
    en: {
      'nav.label': 'Primary', 'nav.home': 'Home', 'nav.ai': 'AI', 'nav.global': 'Global', 'nav.personal': 'Personal',
      'nav.home.meta': 'Opening · Origin', 'nav.ai.meta': 'Models · Local AI · Agents', 'nav.global.meta': 'Global digital services · VIA', 'nav.personal.meta': 'Personal · Field',
      'brand.home': 'NANFEILAOTOU, back to home', 'logo.slot': 'Logo slot',
      'lang.group': 'Language', 'lang.zh': '中文', 'lang.en': 'English', 'lang.toZh': 'Switch to Chinese', 'lang.toEn': 'Switch to English',
      'theme.group': 'Theme', 'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.system': 'System', 'theme.auto': 'Auto',
      'theme.toLight': 'Switch to light theme', 'theme.toDark': 'Switch to dark theme',
      'theme.artNote': 'The opening is an artwork and ignores the theme. Theme applies to AI, Global, Personal and content pages.',
      'theme.saved': 'Theme set to', 'lang.saved': 'Switched to English',
      'menu.open': 'Open menu', 'menu.close': 'Close menu', 'menu.title': 'Site menu', 'menu.prefs': 'Preferences',
      'readout.at': 'At', 'readout.go': 'Go',
      'fallback.badge': 'ZH'
    }
  };
  const LANGS = ['zh', 'en'];
  const HTML_LANG = { zh: 'zh-CN', en: 'en' };
  function has(lang, key) { return !!(DICT[lang] && Object.prototype.hasOwnProperty.call(DICT[lang], key)); }
  function t(key, lang) { return has(lang, key) ? DICT[lang][key] : (has('zh', key) ? DICT.zh[key] : key); }
  /* 扩展字典：页面/模块可各自注册自己的文案，未注册英文的键自动回退中文。 */
  function extend(lang, entries) { DICT[lang] = Object.assign(DICT[lang] || {}, entries); }
  /* 应用到 DOM：data-i18n="key" 写 textContent；data-i18n-attr="aria-label:key;title:key2" 写属性。 */
  function apply(root, lang) {
    root = root || document;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n'), ok = lang === 'zh' || has(lang, key);
      el.textContent = t(key, lang);
      if (lang !== 'zh' && !ok) { el.setAttribute('lang', 'zh-CN'); el.setAttribute('data-i18n-fallback', t('fallback.badge', lang)); }
      else { el.removeAttribute('data-i18n-fallback'); if (el.getAttribute('lang') === 'zh-CN' && lang !== 'zh') el.removeAttribute('lang'); }
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim()); if (attr && key) el.setAttribute(attr, t(key, lang));
      });
    });
  }
  global.NFI18n = { DICT, LANGS, HTML_LANG, t, has, extend, apply };
})(window);
