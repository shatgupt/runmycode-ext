'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const langExtMap = rmc.langExtMap
  const buildDomElement = rmc.buildDomElement

  // platform name should match whatever is defined in locationMap in common-utils.js
  rmc.platforms.tutorialspoint = {}
  const tp = rmc.platforms.tutorialspoint

  // Since tutorialspoint is not exposing any info about the language in snippets,
  // we figure it out from the URL
  tp.languages = {
    'cprogramming': 'c',
    'learn_c_by_examples': 'c',
    'c_standard_library': 'c',
    'cplusplus': 'cpp',
    'cpp_standard_library': 'cpp',
    'python': 'python',
    'python3': 'python3',
    'ruby': 'ruby',
    'php': 'php',
    'java': 'java',
    'java8': 'java',
    'go': 'go',
    'scala': 'scala'
  }
  // https://www.tutorialspoint.com/cprogramming/c_basic_syntax.htm => cprogramming => C
  const pageLang = tp.languages[window.location.href.split('/')[3]]

  // bail out early if its not a supported language page
  tp.getPage = () => {
    if (pageLang && $('a.demo')) return 'show'
  }

  tp.pages = {}
  tp.pages.show = {
    getCodeContainer: (openRunnerBtn) => openRunnerBtn.nextElementSibling,
    hasSupportedLang: () => true, // always true for show page
    injectRunButtons: () => {
      const fileName = pageLang + '.' + langExtMap[pageLang]
      $$('a.demo').forEach((btn) => {
        if (btn.nextElementSibling.classList.contains('runmycode-popup-runner')) return
        btn.parentNode.insertBefore(
          buildDomElement(
            ['a',
              {
                'class': 'demo runmycode-popup-runner',
                'href': '#',
                'style': 'right: 115px;',
                'data-filename': fileName,
                'data-lang': pageLang
              },
              'Run Here'
            ]
          ),
          btn.nextElementSibling
        )
      })
    },
    getCode: (codeContainer) => codeContainer.textContent
  }
})(window, document)
