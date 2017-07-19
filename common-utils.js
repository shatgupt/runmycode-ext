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
    // java: 'java',
    go: 'go'
  }

  const displayLangMap = {
    python: 'Python2',
    python3: 'Python3',
    nodejs: 'Nodejs',
    ruby: 'Ruby',
    php: 'PHP',
    java: 'Java',
    go: 'Go'
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

  // CodeMirror adds this invisible character if empty lines
  const invisibleSpaceUsedByCodeMirror = (() => {
    const el = document.createElement('div')
    el.innerHTML = '&#8203;'
    return el.textContent
  })()
  const getCodeFromLines = (lines) => [].map.call(lines, (line) => line.innerText.replace(invisibleSpaceUsedByCodeMirror, '\n') === '\n' ? '' : line.innerText).join('\n')

  // export
  rmc.$ = $
  rmc.$$ = $$
  rmc.displayLangMap = displayLangMap
  rmc.getPlatform = getPlatform
  rmc.getFileNameFromElement = getFileNameFromElement
  rmc.getExtFromFileName = getExtFromFileName
  rmc.getLangFromFileName = getLangFromFileName
  rmc.getCodeFromLines = getCodeFromLines
})(window, document)
