'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const getCodeFromLines = rmc.getCodeFromLines

  rmc.platforms.gobyexample = {} // platform name should match whatever is defined in locationMap in common-utils.js
  const gobyexample = rmc.platforms.gobyexample

  gobyexample.getPage = () => {
    if ($('body>div.example')) return 'show'
  }

  gobyexample.pages = {}
  gobyexample.pages.show = {
    // there are 2 tables on the page, first one has the code
    containerSelector: 'table', // table closest to Run btn
    hasSupportedLang: () => true, // always true for show page
    injectRunButtons: () => {
      if ($('.runmycode-popup-runner')) return
      const openRunnerBtn = $('.run')
      openRunnerBtn.title = 'Run this code here with RunMyCode Online'
      openRunnerBtn.classList.add('runmycode-popup-runner')
      openRunnerBtn.dataset.filename = $('body>div.example').id + '.go'
      openRunnerBtn.dataset.lang = 'go'
      const origAnchor = openRunnerBtn.parentNode
      const goPlayLink = `<a style="float: right; line-height: 1; margin-left: 10px;" title="Run this code in Go Playground" href="${origAnchor.href}">#<a/>`
      origAnchor.parentNode.insertAdjacentHTML('afterbegin', goPlayLink)
      origAnchor.href = '#'
    },
    getCode: (codeContainer) => getCodeFromLines($$('.code>.highlight>pre', codeContainer))
  }
})(window, document)
