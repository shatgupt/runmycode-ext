'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const langExtMap = rmc.langExtMap

  // platform name should match whatever is defined in locationMap in common-utils.js
  rmc.platforms.learntosolveit = {}
  const learntosolveit = rmc.platforms.learntosolveit

  // class to language mapping
  learntosolveit.languages = {
    'highlight-c': 'c',
    'highlight-python3': 'python3',
    'highlight-python': 'python',
    'highlight-ruby': 'ruby',
    'highlight-java': 'java',
    'highlight-scala': 'scala'
  }

  const langSelector = '.' + Object.keys(learntosolveit.languages).join(',.')
  learntosolveit.getPage = () => {
    if ($(langSelector)) return 'show' // if any of the supported languages exist on page
  }

  learntosolveit.pages = {}
  learntosolveit.pages.show = {
    getCodeContainer: (openRunnerBtn) => openRunnerBtn.previousElementSibling,
    hasSupportedLang: () => true, // always true for show page
    injectRunButtons: () => {
      if ($('.runmycode-popup-runner')) return
      const codeContainer = $(langSelector)
      const openRunnerBtn = codeContainer.nextElementSibling
      const lang = learntosolveit.languages[codeContainer.classList[0]]

      openRunnerBtn.href = '#'
      openRunnerBtn.title = 'Run this code here with RunMyCode Online'
      openRunnerBtn.classList.add('runmycode-popup-runner')
      openRunnerBtn.dataset.filename = lang + '.' + langExtMap[lang]
      openRunnerBtn.dataset.lang = lang
    },
    getCode: (codeContainer) => $('pre', codeContainer).textContent
  }
})(window, document)
