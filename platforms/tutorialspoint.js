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
    'php7': 'php',
    'java': 'java',
    'java8': 'java',
    'go': 'go',
    'scala': 'scala'
  }
  // https://www.tutorialspoint.com/cprogramming/c_basic_syntax.htm => cprogramming => C
  const pageLang = tp.languages[window.location.href.split('/')[3]]

  // bail out early if its not a supported language page
  tp.getPage = () => {
    // pre.tryit for PHP7
    if (pageLang && ($('a.demo') || $('pre.tryit'))) return 'show'
  }

  // Java public classes require filename to be same as class name.
  // Try best to extract it
  const getFileName = (demoBtn) => {
    if (pageLang === 'java') {
      // check if previous h3 element has filename
      const prevText = demoBtn.previousElementSibling.textContent
      if (prevText.includes('.java')) return prevText
      // try to extract from code, gets the first public class
      const src = demoBtn.nextElementSibling.textContent
      const publicClassRegex = /public class (\w+)/g
      const match = publicClassRegex.exec(src)
      if (match !== null) return match[1] + '.java'
    }
    // if not Java, or everything else failed, return default filename
    return pageLang + '.' + langExtMap[pageLang]
  }

  const buildRunButton = (demoBtn) => {
    return buildDomElement(
      ['a',
        {
          'class': 'demo runmycode-popup-runner',
          'href': '#',
          'style': 'right: 115px;',
          'data-filename': getFileName(demoBtn),
          'data-lang': pageLang
        },
        'Run Here'
      ]
    )
  }

  tp.pages = {}
  tp.pages.show = {
    getCodeContainer: (openRunnerBtn) => openRunnerBtn.nextElementSibling,
    hasSupportedLang: () => true, // always true for show page
    injectRunButtons: () => {
      $$('a.demo').forEach((demoBtn) => {
        if (demoBtn.nextElementSibling.classList.contains('runmycode-popup-runner')) return
        demoBtn.parentNode.insertBefore(
          buildRunButton(demoBtn),
          demoBtn.nextElementSibling
        )
      })

      // PHP7 has tryit button inside pre
      $$('pre.tryit').forEach((pre) => {
        if (pre.previousElementSibling.classList.contains('runmycode-popup-runner')) return
        pre.parentNode.insertBefore(
          buildRunButton(pre),
          pre
        )
      })
    },
    getCode: (codeContainer) => codeContainer.textContent
  }
})(window, document)
