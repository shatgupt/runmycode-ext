'use strict';

((window, document) => {
  window.runmycode = {}
  const rmc = window.runmycode

  rmc.platforms = {}

  const locationMap = {
    'github.com': 'github',
    'gist.github.com': 'github_gist',
    'gitlab.com': 'gitlab',
    'gitlab.com/snippets': 'gitlab_snippets',
    'bitbucket.org': 'bitbucket',
    'bitbucket.org/snippets': 'bitbucket_snippets',
    'gobyexample.com': 'gobyexample'
  }

  const extMap = {
    py: 'python',
    py3: 'python3',
    js: 'nodejs',
    rb: 'ruby',
    php: 'php',
    java: 'java',
    go: 'go',
    c: 'c',
    cpp: 'cpp'
  }

  const displayLangMap = {
    python: 'Python2',
    python3: 'Python3',
    nodejs: 'Nodejs',
    ruby: 'Ruby',
    php: 'PHP',
    java: 'Java',
    go: 'Go',
    c: 'C',
    cpp: 'C++'
  }

  const $ = (s, elem = document) => elem.querySelector(s)
  const $$ = (s, elem = document) => elem.querySelectorAll(s)

  const getPlatform = () => {
    const l = window.location.hostname + '/' + window.location.pathname.split('/')[1]
    return locationMap[l] || locationMap[window.location.hostname]
  }
  const getFileNameFromElement = (elem) => {
    if (elem.tagName === 'INPUT') return elem.value.trim()
    else return elem.textContent.trim()
  }
  const getExtFromFileName = (filename) => {
    if (filename.indexOf('.') !== -1) return filename.trim().split('.').pop().toLowerCase()
  }
  const getLangFromFileName = (filename) => extMap[getExtFromFileName(filename)]

  // CodeMirror on Bitbucket adds these weird characters
  let emptyLineUsedByCodeMirror, nbspUsedByCodeMirror
  (() => {
    const el = document.createElement('div')
    el.innerHTML = '&#8203;'
    emptyLineUsedByCodeMirror = el.textContent
    el.innerHTML = '&nbsp;'
    nbspUsedByCodeMirror = el.textContent
  })()
  const getCodeFromLines = (lines) => {
    return [].map.call(lines, (line) => {
      // replace weird characters
      const lineText = line.innerText.replace(emptyLineUsedByCodeMirror, '\n').split(nbspUsedByCodeMirror).join(' ')
      return lineText === '\n' ? '' : lineText
    }).join('\n')
  }

  // Simple function to create DOM from JSON like args
  // Args is an array of 3 items: [tagName, attributes, textContent|child]
  // For simplicity, element can have either text or a single direct child
  // Example:
  // buildDomElement(
  //   ['div', {'class': 'abc'},
  //     ['p', {'id': 'show'},
  //       'Hello'
  //     ]
  //   ]
  // )
  // Ref1: https://developer.mozilla.org/en-US/Add-ons/Overlay_Extensions/XUL_School/DOM_Building_and_HTML_Insertion
  // Ref2: https://bumbu.github.io/a-safe-function-to-build-html-elements-without-using-innerhtml/
  const buildDomElement = (args) => {
    const tagName = args[0]
    const attrs = args[1]
    const textContent = typeof args[2] === 'string' ? args[2] : null
    const child = Array.isArray(args[2]) ? args[2] : null
    // Create element
    const parentNode = document.createElement(tagName.toUpperCase())
    // Set attributes
    for (let attr in attrs) {
      parentNode.setAttribute(attr, attrs[attr])
    }
    // Add text or DOM child
    if (textContent) {
      parentNode.appendChild(document.createTextNode(textContent))
    } else if (child) {
      parentNode.appendChild(buildDomElement(child))
    }
    return parentNode
  }

  // export
  rmc.$ = $
  rmc.$$ = $$
  rmc.buildDomElement = buildDomElement
  rmc.displayLangMap = displayLangMap
  rmc.getPlatform = getPlatform
  rmc.getFileNameFromElement = getFileNameFromElement
  rmc.getExtFromFileName = getExtFromFileName
  rmc.getLangFromFileName = getLangFromFileName
  rmc.getCodeFromLines = getCodeFromLines
})(window, document)
