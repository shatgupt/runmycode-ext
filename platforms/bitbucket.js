/* global MutationObserver, CustomEvent */
'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const buildDomElement = rmc.buildDomElement
  const getLangFromFileName = rmc.getLangFromFileName
  const getCodeFromLines = rmc.getCodeFromLines

  rmc.platforms.bitbucket = {}
  const bitbucket = rmc.platforms.bitbucket

  const bitbucketInjectRunButton = (btnContainer, fileName) => {
    if ($('.runmycode-popup-runner', btnContainer)) return
    btnContainer.insertBefore(
      buildDomElement(
        ['div',
          {'class': 'aui-buttons'},
          ['button',
            {
              'class': 'aui-button aui-button-primary runmycode-popup-runner',
              'style': 'font-weight: normal;',
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

  const bitbucketRemoveRunButton = (openRunnerBtn) => {
    openRunnerBtn.parentNode.outerHTML = ''
  }

  bitbucket.getPage = () => {
    if ($('.bb-content-container.online-edit-form') && window.location.href.split('/')[5] !== 'create-file') {
      return 'edit'
    } else if (window.location.href.split('/')[5] === 'create-file') {
      return 'new'
    } else if ($('#editor-container>#source-view')) {
      return 'show'
    }
  }

  bitbucket.pages = {}
  bitbucket.pages.show = {
    containerSelector: '#source-container',
    fileNameSelector: '.file-name',
    runButtonContainer: '.file-source-container>.toolbar>.secondary',
    injectRunButton: (btnContainer, fileName) => {
      // add a listener for edit trigger
      const container = $('#editor-container')
      const observer = new MutationObserver((mutations) => {
        let editForm = mutations[0].addedNodes[0] // when file gets added
        editForm = editForm || mutations[0].removedNodes[0] // when file gets deleted
        if (editForm && editForm.classList.contains('online-edit-form')) {
          window.dispatchEvent(new CustomEvent('platform.page.updated'))
        }
      })
      observer.observe(container, { childList: true })

      // add the run button
      bitbucketInjectRunButton(btnContainer, fileName)
    },
    getCode: (codeContainer) => $('.code', codeContainer).textContent
  }
  bitbucket.pages.edit = {
    containerSelector: '#source-container',
    fileNameSelector: '.file-name',
    runButtonContainer: '.online-edit-form .bb-content-container-header-secondary',
    injectRunButton: bitbucketInjectRunButton,
    getCode: (codeContainer) => getCodeFromLines($$('pre.CodeMirror-line>span', codeContainer))
  }
  bitbucket.pages.new = {
    containerSelector: '#source-container',
    fileNameSelector: '#filename',
    runButtonContainer: '.online-edit-form .bb-content-container-header-secondary',
    injectRunButton: bitbucketInjectRunButton,
    removeRunButton: bitbucketRemoveRunButton,
    addFileWatcher: true,
    getCode: (codeContainer) => getCodeFromLines($$('pre.CodeMirror-line>span', codeContainer))
  }

  // Bitbucket Snippets
  rmc.platforms.bitbucket_snippets = {}
  const bitbucketSnippets = rmc.platforms.bitbucket_snippets

  bitbucketSnippets.getPage = () => {
    if ($('#view-snippet')) return 'show'
    else if ($('.snippet-form .snippets-file-editors')) return 'edit'
  }

  bitbucketSnippets.pages = {}
  bitbucketSnippets.pages.show = {
    containerSelector: '.bb-content-container.bb-row',
    fileNameSelector: '.bb-content-container-header-primary',
    runButtonContainer: '.bb-content-container-header-secondary',
    injectRunButton: bitbucketInjectRunButton,
    getCode: (codeContainer) => $('.code', codeContainer).textContent
  }
  bitbucketSnippets.pages.edit = {
    containerSelector: '.snippets-code-editor',
    fileNameSelector: '.code-editor-path-view-input',
    runButtonContainer: '.bb-content-container-header-primary',
    injectRunButton: (btnContainer, fileName) => {
      if ($('.runmycode-popup-runner', btnContainer)) return
      btnContainer.appendChild(buildDomElement(
        ['div',
          {'class': 'bb-content-container-item aui-buttons'},
          ['button',
            {
              'class': 'aui-button aui-button-primary runmycode-popup-runner',
              'style': 'font-weight: normal;',
              'data-filename': fileName,
              'data-lang': getLangFromFileName(fileName)
            },
            'Run'
          ]
        ])
      )
    },
    removeRunButton: bitbucketRemoveRunButton,
    addFileWatcher: true,
    deleteFileSelector: '.snippets-editor-close',
    fileListSelector: '.snippets-file-editors>div',
    getCode: (codeContainer) => getCodeFromLines($$('pre.CodeMirror-line>span', codeContainer))
  }
})(window, document)
