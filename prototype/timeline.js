/* Only scrollY -> sd drives motion. Legacy scenes receive a pure time mapping. */
window.NF_TIMELINE = Object.freeze({
  total:12.01,
  models:{start:2.42,formed:3.2,holdEnd:4.22,end:4.95,stop:3.65},
  local:{start:4.8,end:6.3,oldStart:4.98,oldEnd:6.36,stop:5.97},
  agents:{start:6.18,formed:6.95,holdEnd:8.05,end:8.49,stop:7.42},
  bridge:{start:8.35,end:8.97,oldStart:7.44},
  global:{start:8.95,end:10.37,stop:9.97},
  personal:{start:10.35,end:12.01,stop:11.03},
  legacyOffset:.91
});
