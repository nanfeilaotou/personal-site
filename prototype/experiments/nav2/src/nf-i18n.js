/* NFI18n — 最小 i18n 接口（原型，供以后统一 i18n 替换）。
 * 规则：只有字典里真正存在的英文键才显示英文；缺失键回退中文，并在元素上写 lang="zh-CN"
 * （读屏按中文朗读）与 data-i18n-fallback（供统计/测试）。正式视觉上不显示任何角标；
 * apply() 返回回退数量，宿主可据此用一次轻提示告知「部分正文暂为中文」。 */
(function (global) {
  'use strict';
  const DICT = {
    zh: {
      'nav.label': '主导航', 'nav.home': '首页', 'nav.ai': 'AI', 'nav.global': '全球', 'nav.personal': '个人',
      'nav.home.sub': 'Opening · 起点', 'nav.ai.sub': '模型生态 · 本地 AI · Agent', 'nav.global.sub': '全球数字服务 · 经由', 'nav.personal.sub': '个人 · 场',
      'nav.home.go': '开场', 'nav.ai.go': '模型生态', 'nav.global.go': '号码', 'nav.personal.go': '个人',
      'brand.home': 'NANFEILAOTOU，返回首页', 'logo.slot': 'Logo 预留位（占位）',
      'lang.group': '语言', 'lang.zh': '中文', 'lang.en': 'English', 'lang.toZh': '切换到中文', 'lang.toEn': 'Switch to English',
      'theme.group': '主题', 'theme.light': '浅色', 'theme.dark': '深色', 'theme.auto': '自动',
      'theme.toLight': '切换到浅色主题', 'theme.toDark': '切换到深色主题',
      'theme.artNote': '开场是艺术画面，不随主题变化；主题作用于 AI / 全球 / 个人的界面层与内容页。',
      'lang.partial': '导航已切换为中文。',
      'menu.open': '打开菜单', 'menu.close': '关闭菜单', 'menu.title': '站点菜单',
      'shutter.to': '前往'
    },
    en: {
      'nav.label': 'Primary', 'nav.home': 'Home', 'nav.ai': 'AI', 'nav.global': 'Global', 'nav.personal': 'Personal',
      'nav.home.sub': 'Opening · Origin', 'nav.ai.sub': 'Models · Local AI · Agents', 'nav.global.sub': 'Global digital services · VIA', 'nav.personal.sub': 'Personal · Field',
      'nav.home.go': 'Opening', 'nav.ai.go': 'Models', 'nav.global.go': 'Numbers', 'nav.personal.go': 'Personal',
      'brand.home': 'NANFEILAOTOU, back to home', 'logo.slot': 'Logo slot (placeholder)',
      'lang.group': 'Language', 'lang.zh': '中文', 'lang.en': 'English', 'lang.toZh': '切换到中文', 'lang.toEn': 'Switch to English',
      'theme.group': 'Theme', 'theme.light': 'Light', 'theme.dark': 'Dark', 'theme.auto': 'Auto',
      'theme.toLight': 'Switch to light theme', 'theme.toDark': 'Switch to dark theme',
      'theme.artNote': 'The opening is an artwork and keeps its colours. Theme applies to the UI of AI, Global, Personal and to content pages.',
      'lang.partial': 'Navigation is in English. Some page content is not translated yet and stays in Chinese.',
      'menu.open': 'Open menu', 'menu.close': 'Close menu', 'menu.title': 'Site menu',
      'shutter.to': 'To'
    }
  };
  const LANGS = ['zh', 'en'];
  const HTML_LANG = { zh: 'zh-CN', en: 'en' };
  function has(lang, key) { return !!(DICT[lang] && Object.prototype.hasOwnProperty.call(DICT[lang], key)); }
  function t(key, lang) { return has(lang, key) ? DICT[lang][key] : (has('zh', key) ? DICT.zh[key] : key); }
  function extend(lang, entries) { DICT[lang] = Object.assign(DICT[lang] || {}, entries); }
  /* data-i18n="key" 写 textContent；data-i18n-attr="aria-label:key;title:key2" 写属性。返回 { total, fallbacks } */
  function apply(root, lang) {
    root = root || document; let total = 0, fallbacks = 0;
    root.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n'), ok = lang === 'zh' || has(lang, key); total++;
      el.textContent = t(key, lang);
      if (!ok) { fallbacks++; el.setAttribute('lang', 'zh-CN'); el.setAttribute('data-i18n-fallback', ''); }
      else { el.removeAttribute('data-i18n-fallback'); if (el.getAttribute('lang') === 'zh-CN') el.removeAttribute('lang'); }
    });
    root.querySelectorAll('[data-i18n-attr]').forEach(el => {
      el.getAttribute('data-i18n-attr').split(';').forEach(pair => {
        const [attr, key] = pair.split(':').map(s => s.trim()); if (attr && key) el.setAttribute(attr, t(key, lang));
      });
    });
    return { total, fallbacks };
  }
  global.NFI18n = { DICT, LANGS, HTML_LANG, t, has, extend, apply };
})(window);
