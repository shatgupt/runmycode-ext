'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const buildDomElement = rmc.buildDomElement
  const getLangFromFileName = rmc.getLangFromFileName
  const getCodeFromLines = rmc.getCodeFromLines
  const body = document.body

  rmc.platforms.github = {} // platform name should match whatever is defined in locationMap in common-utils.js
  const github = rmc.platforms.github

  const githubInjectRunButton = (btnContainer, fileName) => {
    if ($('.runmycode-popup-runner', btnContainer)) return
    btnContainer.insertBefore(
      buildDomElement(
        ['div',
          {'class': 'BtnGroup'},
          ['a',
            {
              'class': 'btn btn-sm BtnGroup-item btn-purple runmycode-popup-runner',
              'data-filename': fileName,
              'data-lang': getLangFromFileName(fileName)
            },
            'Run'
          ]
        ]
      ),
      btnContainer.firstChild
    )
  }

  const githubRemoveRunButton = (openRunnerBtn) => {
    openRunnerBtn.parentNode.outerHTML = ''
  }

  github.getPage = () => {
    if (body.classList.contains('page-edit-blob')) {
      return 'edit'
    } else if (body.classList.contains('page-blob') || $('.file .blob-wrapper')) {
      // Second check because when you go from list page to code blob page, page-blob class does not seem to be added.
      // It is added when that code blob page url is directly opened or refreshed
      return 'show'
    }
  }

  github.pages = {}
  github.pages.show = {
    containerSelector: '.repository-content',
    fileNameSelector: '.final-path',
    runButtonContainer: '.file-actions',
    injectRunButton: githubInjectRunButton,
    getCode: (codeContainer) => getCodeFromLines($$('.blob-wrapper table td.blob-code', codeContainer))
  }
  github.pages.edit = {
    containerSelector: '.file-box',
    fileNameSelector: '.form-control.js-blob-filename',
    runButtonContainer: '.file-actions',
    injectRunButton: githubInjectRunButton,
    removeRunButton: githubRemoveRunButton,
    addFileWatcher: true,
    getCode: (codeContainer) => $('.file-editor-textarea', codeContainer).value
  }

  // Github Gist
  rmc.platforms.github_gist = {}
  const githubGist = rmc.platforms.github_gist

  const gistInjectRunButton = (btnContainer, fileName) => {
    if ($('.runmycode-popup-runner', btnContainer)) return
    btnContainer.insertBefore(
      buildDomElement(
        ['a',
          {
            'class': 'btn btn-sm btn-purple runmycode-popup-runner',
            'data-filename': fileName,
            'data-lang': getLangFromFileName(fileName)
          },
          'Run'
        ]
      ),
      btnContainer.firstChild
    )
  }

  const gistRemoveRunButton = (openRunnerBtn) => {
    openRunnerBtn.outerHTML = ''
  }

  githubGist.getPage = () => {
    if (body.classList.contains('page-gist-edit')) {
      return 'edit'
    } else if (body.classList.contains('page-blob') || $('.file .blob-wrapper')) {
      return 'show'
    }
  }

  githubGist.pages = {}
  githubGist.pages.show = {
    containerSelector: '.file',
    fileNameSelector: '.gist-blob-name',
    runButtonContainer: '.file-actions',
    injectRunButton: gistInjectRunButton,
    getCode: (codeContainer) => getCodeFromLines($$('.blob-wrapper table td.blob-code', codeContainer))
  }
  githubGist.pages.edit = {
    containerSelector: '.file',
    fileNameSelector: '.filename',
    runButtonContainer: '.file-actions',
    injectRunButton: gistInjectRunButton,
    removeRunButton: gistRemoveRunButton,
    addFileWatcher: true,
    deleteFileSelector: '.js-remove-gist-file',
    fileListSelector: '.js-gist-files',
    getCode: (codeContainer) => $('.file-editor-textarea', codeContainer).value
  }
})(window, document)
