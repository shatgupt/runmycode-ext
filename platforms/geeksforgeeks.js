'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const langExtMap = rmc.langExtMap
  const buildDomElement = rmc.buildDomElement
  const getLangFromFileName = rmc.getLangFromFileName
  const getCodeFromLines = rmc.getCodeFromLines
  let lang

  // platform name should match whatever is defined in locationMap in common-utils.js
  rmc.platforms.geeksforgeeks = {}
  const gfg = rmc.platforms.geeksforgeeks

  gfg.languages = {
    c: 'c',
    cpp: 'cpp',
    python: 'python',
    python3: 'python3',
    ruby: 'ruby',
    php: 'php',
    java: 'java',
    golang: 'go'
  }

  gfg.getPage = () => {
    if ($('.runIdeBtn')) return 'show'
  }

  const injectRunButton = (btnContainer, fileName) => {
    if ($('.runmycode-popup-runner', btnContainer)) return
    btnContainer.appendChild(
      buildDomElement(
        ['button',
          {
            'class': 'runIdeBtn runmycode-popup-runner',
            'style': 'margin: 0 5px;',
            'data-filename': fileName,
            'data-lang': getLangFromFileName(fileName)
          },
          'Run Here'
        ]
      )
    )
  }

  gfg.pages = {}
  gfg.pages.show = {
    getCodeContainer: (openRunnerBtn) => openRunnerBtn.parentNode.previousElementSibling,
    hasSupportedLang: () => true, // always true for show page
    injectRunButtons: () => {
      $$('.runIdeBtn').forEach((btn) => {
        lang = btn.getAttribute('onclick').split("'")[1]
        if (!gfg.languages.hasOwnProperty(lang)) return
        injectRunButton(btn.parentNode, lang + '.' + langExtMap[lang])
      })
    },
    getCode: (codeContainer) => getCodeFromLines($$('.line', codeContainer))
  }
})(window, document)
