'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const buildDomElement = rmc.buildDomElement
  const getLangFromFileName = rmc.getLangFromFileName
  const getCodeFromLines = rmc.getCodeFromLines
  const body = document.body

  rmc.platforms.gitlab = {} // platform name should match whatever is defined in locationMap in common-utils.js
  const gitlab = rmc.platforms.gitlab

  const gitlabInjectRunButton = (btnContainer, fileName) => {
    if ($('.runmycode-popup-runner', btnContainer)) return
    btnContainer.insertBefore(
      buildDomElement(
        ['div', {'class': 'btn-group'},
          ['a', {'class': 'btn btn-warning runmycode-popup-runner', 'data-filename': fileName, 'data-lang': getLangFromFileName(fileName)},
            'Run'
          ]
        ]
      ),
      btnContainer.firstChild
    )
  }

  const gitlabRemoveRunButton = (openRunnerBtn) => {
    openRunnerBtn.parentNode.outerHTML = ''
  }

  gitlab.getPage = () => {
    if (body.dataset.page === 'projects:blob:show') {
      return 'show'
    } else if (body.dataset.page === 'projects:blob:edit') {
      return 'edit'
    } else if (body.dataset.page === 'projects:blob:new') {
      return 'new'
    }
  }

  gitlab.pages = {}
  gitlab.pages.show = {
    containerSelector: '.file-holder', // element which holds name of file, code in that file and run button for it
    fileNameSelector: '.file-title-name',
    runButtonContainer: '.file-actions',
    injectRunButton: gitlabInjectRunButton,
    getCode: (codeContainer) => getCodeFromLines($('.blob-content code', codeContainer).children)
  }
  gitlab.pages.edit = {
    containerSelector: '.file-holder',
    fileNameSelector: '#file_path',
    runButtonContainer: '.file-buttons',
    injectRunButton: gitlabInjectRunButton,
    removeRunButton: gitlabRemoveRunButton,
    addFileWatcher: true,
    getCode: (codeContainer) => getCodeFromLines($$('.ace_line', codeContainer))
  }
  gitlab.pages.new = {
    containerSelector: '.file-holder',
    fileNameSelector: '#file_name',
    runButtonContainer: '.file-buttons',
    injectRunButton: gitlabInjectRunButton,
    removeRunButton: gitlabRemoveRunButton,
    addFileWatcher: true,
    getCode: (codeContainer) => getCodeFromLines($$('.ace_line', codeContainer))
  }

  // Gitlab Snippets
  rmc.platforms.gitlab_snippets = {}
  const gitlabSnippets = rmc.platforms.gitlab_snippets

  gitlabSnippets.getPage = () => {
    if (body.dataset.page === 'snippets:show') {
      return 'show'
    } else if (body.dataset.page === 'snippets:edit' || body.dataset.page === 'snippets:new') {
      return 'edit'
    }
  }

  gitlabSnippets.pages = {}
  gitlabSnippets.pages.show = {
    containerSelector: '.file-holder',
    fileNameSelector: '.file-title-name',
    runButtonContainer: '.file-actions',
    injectRunButton: gitlabInjectRunButton,
    getCode: (codeContainer) => getCodeFromLines($('.blob-content code', codeContainer).children)
  }
  gitlabSnippets.pages.edit = {
    containerSelector: '.file-holder',
    fileNameSelector: '.snippet-file-name',
    runButtonContainer: '.js-file-title.file-title',
    injectRunButton: (btnContainer, fileName) => {
      if ($('.runmycode-popup-runner', btnContainer)) return
      // only one file in Gitlab snippets for now
      const fileNameInput = $('.snippet-file-name', btnContainer)
      // shorten input box to accommodate open runner button
      Object.assign(fileNameInput.style, {display: 'inline-block', width: '60%'})
      btnContainer.appendChild(
        buildDomElement(['input', {
          'type': 'button',
          'class': 'btn btn-warning runmycode-popup-runner',
          'style': 'float: right; font-weight: bold;',
          'value': 'Run',
          'data-filename': fileName,
          'data-lang': getLangFromFileName(fileName)
        }])
      )
    },
    removeRunButton: (openRunnerBtn) => { openRunnerBtn.outerHTML = '' },
    addFileWatcher: true,
    getCode: (codeContainer) => getCodeFromLines($$('.ace_line', codeContainer))
  }
})(window, document)
