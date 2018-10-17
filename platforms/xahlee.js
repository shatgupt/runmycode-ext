'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const buildDomElement = rmc.buildDomElement
  const getLangFromFileName = rmc.getLangFromFileName
  const langExtMap = rmc.langExtMap

  rmc.platforms.xahlee = {} // platform name should match whatever is defined in locationMap in common-utils.js
  const xahlee = rmc.platforms.xahlee

  xahlee.languages = {
    python: 'python',
    python3: 'python3',
    ruby: 'ruby',
    php: 'php',
    java: 'java',
    golang: 'go'
  }

  xahlee.getPage = () => {
    const langSelector = 'pre.' + Object.keys(xahlee.languages).join(',pre.')
    if ($(langSelector)) return 'show' // if any of the supported lanaguages exist on page
  }

  const injectRunButton = (btnContainer, fileName) => {
    if (btnContainer.nextSibling.classList && btnContainer.nextSibling.classList.contains('runmycode-popup-runner')) return
    btnContainer.parentNode.insertBefore(
      buildDomElement(
        ['a',
          {
            'class': 'runmycode-popup-runner',
            'style': 'padding: .5rem; margin: .5rem; border: solid thin grey; border-radius: 0.5rem; background-color: pink; cursor: pointer; width: 150px; text-align: center;',
            'data-filename': fileName,
            'data-lang': getLangFromFileName(fileName)
          },
          '▶ Run'
        ]
      ),
      btnContainer.nextSibling
    )
  }

  xahlee.pages = {}
  xahlee.pages.show = {
    getCodeContainer: (openRunnerBtn) => openRunnerBtn.previousSibling,
    hasSupportedLang: () => true, // always true for show page
    injectRunButtons: () => {
      $$('pre').forEach((codeContainer) => {
        const xlang = codeContainer.classList[0]
        const lang = xahlee.languages[xlang]
        if (!lang) return
        const filename = lang + '.' + langExtMap[lang]
        injectRunButton(codeContainer, filename)
      })
    },
    getCode: (codeContainer) => codeContainer.textContent
  }
})(window, document)
