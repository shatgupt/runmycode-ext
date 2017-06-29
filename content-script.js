'use strict'

const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const extMap = {
  py: 'python',
  py3: 'python3',
  js: 'nodejs',
  rb: 'ruby',
  php: 'php',
  // java: 'java',
  go: 'go'
}

const locationMap = {
  'github.com': 'github',
  'gist.github.com': 'github_gist',
  'gitlab.com': 'gitlab',
  'gitlab.com/snippets': 'gitlab_snippets',
  'bitbucket.org': 'bitbucket',
  'bitbucket.org/snippets': 'bitbucket_snippets',
  'gobyexample.com': 'gobyexample'
}

const getPlatform = () => {
  const l = location.hostname + '/' + location.pathname.split('/')[1]
  return locationMap[l] || locationMap[location.hostname]
}

const getFilenameFromPath = () => location.pathname.split('/').pop()
const getLangFromPathExt = () => extMap[location.pathname.split('.').pop()]
const getCodeFromLines = (lines) => [].map.call(lines, (line) => line.innerText === '\n' ? '' : line.innerText).join('\n')

const body = document.body
const platformMap = {
  gitlab: {
    getPage: () => {
      if (body.dataset.page === 'projects:blob:show') {
        return 'show'
      } else if (body.dataset.page === 'projects:blob:edit') {
        return 'edit'
      }
    },
    pageHasSupportedLang: () => getLangFromPathExt() !== undefined,
    injectRunButton: () => {
      // file-actions on show page, file-buttons on edit
      const fileActions = $('.file-actions') || $('.file-buttons')
      fileActions.insertAdjacentHTML('afterbegin', `<div class="btn-group"><a class="btn btn-sm runmycode-popup-runner" data-filename="${getFilenameFromPath()}" data-lang="${getLangFromPathExt()}">Run</a></div>`)
    },
    pages: {
      show: {
        getCode: () => getCodeFromLines($('.blob-content code').children)
      },
      edit: {
        getCode: () => getCodeFromLines($$('.ace_line'))
      }
    }
  },
  github: {
    getPage: () => {
      if (body.classList.contains('page-edit-blob')) {
        return 'edit'
      } else if (body.classList.contains('page-blob') || $('.blob-wrapper table td.blob-code')) {
        // Second check because when you go from list page to code blob page,
        // page-blob class does not seem to be added.
        // It is added when that code blob page url is directly opened or refreshed
        return 'show'
      }
    },
    pageHasSupportedLang: () => getLangFromPathExt() !== undefined,
    injectRunButton: () => {
      $('.file-actions').insertAdjacentHTML('afterbegin', `<div class="BtnGroup"><a class="btn btn-sm BtnGroup-item runmycode-popup-runner" data-filename="${getFilenameFromPath()}" data-lang="${getLangFromPathExt()}">Run</a></div>`)
    },
    pages: {
      show: {
        getCode: () => getCodeFromLines($$('.blob-wrapper table td.blob-code'))
      },
      edit: {
        getCode: () => $('.file-editor-textarea').value
      }
    }
  },
  gobyexample: {
    getPage: () => {
      if ($('body>div.example')) return 'show'
    },
    pageHasSupportedLang: () => $('body>div.example') !== null,
    injectRunButton: () => {
      const openRunnerBtn = $('.run')
      openRunnerBtn.parentNode.setAttribute('href', '#')
      openRunnerBtn.classList.add('runmycode-popup-runner')
      openRunnerBtn.dataset.filename = $('body>div.example').id + '.go'
      openRunnerBtn.dataset.lang = 'go'
    },
    pages: {
      show: {
        // there are 2 tables on the page, first one has the code
        getCode: () => getCodeFromLines($('table').querySelectorAll('.code>.highlight>pre'))
      }
    }
  },
  bitbucket: {
    getPage: () => {
      if ($('#editor-container>#source-view')) return 'show'
    },
    pageHasSupportedLang: () => getLangFromPathExt() !== undefined,
    injectRunButton: () => {
      $('.file-source-container>.toolbar>.secondary').insertAdjacentHTML('afterbegin', `<div class="aui-buttons"><button class="aui-button aui-button-primary runmycode-popup-runner" style="font-weight: normal;" data-filename="${getFilenameFromPath()}" data-lang="${getLangFromPathExt()}">Run</button></div>`)
    },
    pages: {
      show: {
        getCode: () => $('.code').textContent
      }
    }
  },
  gitlab_snippets: {
    getPage: () => {
      if (body.dataset.page === 'snippets:show') {
        return 'show'
      } else if (body.dataset.page === 'snippets:edit') {
        return 'edit'
      }
    },
    pageHasSupportedLang: () => {
      for (let f of Array.from($$('.file-holder .file-title-name'))) {
        if (extMap[f.textContent.trim().split('.').pop()]) return true
      }
      return false
    },
    injectRunButton: () => {
      for (let fh of Array.from($$('.file-holder'))) {
        const _filename = fh.querySelector('.file-title-name').textContent.trim()
        const _lang = extMap[_filename.split('.').pop()]
        if (!_lang) continue // nothing to do if lang not supported
        fh.querySelector('.file-actions').insertAdjacentHTML('afterbegin', `<div class="btn-group"><a class="btn btn-sm runmycode-popup-runner" data-filename="${_filename}" data-lang="${_lang}">Run</a></div>`)
      }
    },
    pages: {
      show: {
        getCode: () => getCodeFromLines($('.blob-content code').children)
      }
    }
  }
}

const platform = getPlatform()
let filename, lang, page, runner, runnerCloseBtn, runBtn, runInput, runOutput

const initRunner = () => {
  if ($('.runmycode-popup-runner')) return // Run button is already added
  platformMap[platform].injectRunButton()

  const runnerWidth = 350
  const runnerMarkup = `<style>
  #runmycode-runner {
    width: ${runnerWidth}px;
  }
  </style>

  <div id="runmycode-runner" class="hidden">
    <div class="panel panel-default">
      <div id="runmycode-runner-handle" class="panel-heading">
        <button id="runmycode-close-runner" type="button" class="close">x</button>
        <h3 class="panel-title"><a target="_blank" href="https://runmycode.online">RunMyCode Online</a></h3>
      </div>
      <div class="panel-body">
        <button id="runmycode" type="button" class="btn btn-warning btn-block btn-lg">Run</button>
        <div class="panel-group">
          <div class="panel panel-default panel-runner">
            <div class="panel-heading" title="Command line input to Code">
              <h4 class="panel-title">Input</h4>
            </div>
            <div class="panel-collapse collapse">
              <div class="panel-body">
                <input id="runmycode-run-input" placeholder="Command line input to Code" title="Special shell characters like & should be quoted" type="text">
              </div>
            </div>
          </div>
          <div class="panel panel-default panel-runner">
            <div class="panel-heading" title="Output from Code">
              <h4 class="panel-title">Output</h4>
            </div>
            <div id="output-panel" class="panel-collapse collapse in">
              <div class="panel-body">
                <textarea id="runmycode-run-output" rows="4" placeholder="Output from Code" readonly="true"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
  // inject runner styles and markup
  let justRunBtnToBeInjected = false
  if ($('#runmycode-runner')) justRunBtnToBeInjected = true
  else body.insertAdjacentHTML('afterbegin', runnerMarkup)

  /* *** Start Movable popup https://gist.github.com/akirattii/9165836 ****/
  runner = $('#runmycode-runner')
  runnerCloseBtn = $('#runmycode-close-runner')
  runBtn = $('#runmycode')
  runInput = $('#runmycode-run-input')
  runOutput = $('#runmycode-run-output')

  Array.from($$('.runmycode-popup-runner')).forEach((el) => {
    el.addEventListener('click', (e) => {
      e.preventDefault()
      runner.classList.remove('hidden')
      lang = e.target.dataset.lang
      filename = e.target.dataset.filename
      runBtn.setAttribute('title', `Click to run ${filename}`)
      runOutput.setAttribute('title', `Output from ${filename}`)
      runOutput.setAttribute('placeholder', `Output from ${filename}`)
    })
  })
  // injected Run btn and added click listener, no more work to do if justRunBtnToBeInjected
  if (justRunBtnToBeInjected) return

  let runnerOffset = { x: 0, y: 0 }
  runner.style.left = `${(window.innerWidth - runnerWidth) / 2}px` // have popup in the center of the screen

  runnerCloseBtn.addEventListener('click', () => runner.classList.add('hidden'))
  window.addEventListener('keydown', (e) => {
    // if ESC key pressed
    if (e.keyCode === 27) runnerCloseBtn.click()
  })

  const popupMove = (e) => {
    runner.style.top = `${e.clientY - runnerOffset.y}px`
    runner.style.left = `${e.clientX - runnerOffset.x}px`
  }

  window.addEventListener('mouseup', () => {
    window.removeEventListener('mousemove', popupMove, true)
  })

  $('#runmycode-runner-handle').addEventListener('mousedown', (e) => {
    runnerOffset.x = e.clientX - runner.offsetLeft
    runnerOffset.y = e.clientY - runner.offsetTop
    window.addEventListener('mousemove', popupMove, true)
    e.preventDefault() // disable text selection
  })
  /* *** End Movable popup ****/

  // collapse input, output panels
  Array.from($$('.panel-runner>.panel-heading')).forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.target.closest('.panel-heading').nextElementSibling.classList.toggle('in')
    })
  })

  const setRunning = () => {
    runBtn.textContent = 'Running'
    runBtn.disabled = true // disable run button
    runOutput.classList.remove('error')
    runOutput.value = `Running ${filename}`
    $('#output-panel').classList.add('in')
  }

  const resetRunning = () => {
    runBtn.textContent = 'Run'
    runBtn.disabled = false // enable run button
  }

  const callApi = (url, apiKey) => {
    fetch(url, {
      method: 'post',
      headers: {'x-api-key': apiKey},
      body: platformMap[platform]['pages'][page].getCode()
    })
    .then(res => res.json())
    .then((resp) => {
      console.log('Run response', resp)
      runOutput.classList.add('error')
      if (resp.status === 'Successful') {
        runOutput.classList.remove('error')
        runOutput.value = resp.stdout || resp.stderr
      } else if (resp.status === 'Failed' || resp.status === 'BadRequest') {
        runOutput.value = `Failed: ${resp.error}${resp.stdout}` // stdout for php which puts error in stdout
      } else if (resp.message === 'Forbidden') {
        runOutput.value = 'Invalid API Key or URL in extension options.\nDefault URL is https://api.runmycode.online/run and your key should be available at https://runmycode.online/dashboard.html after authenticating.'
      } else {
        runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
      }
      resetRunning()
    })
    .catch((error) => {
      console.error('Error:', error)
      runOutput.classList.add('error')
      runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
      resetRunning()
    })
  }

  runBtn.addEventListener('click', (e) => {
    setRunning()
    const getApiUrl = browser.storage.local.get('apiUrl')
    const getApiKey = browser.storage.local.get('apiKey')
    Promise.all([getApiUrl, getApiKey]).then((result) => {
      let apiUrl = result[0]['apiUrl']
      const key = result[1]['apiKey']
      if (!apiUrl) {
        // set default value if not set
        apiUrl = 'https://api.runmycode.online/run'
        browser.storage.local.set({
          'apiUrl': apiUrl
        }).then(null, (err) => {
          console.error('set apiUrl Error:', err)
        })
      } else if (!key) {
        runOutput.classList.add('error')
        runOutput.value = 'Please set the API key in the extension options as generated at https://runmycode.online'
        resetRunning()
      }
      if (apiUrl && key) {
        const url = `${apiUrl}/${lang}?args=${encodeURIComponent(runInput.value)}`
        callApi(url, key)
      }
    }, (error) => {
      console.error('getCreds Error:', error)
      runOutput.classList.add('error')
      runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
      resetRunning()
    })
  })
}

const clearRunner = () => {
  if (runner) {
    runInput.value = ''
    runOutput.value = ''
    runnerCloseBtn.click()
  }
}

const handlePageUpdate = () => {
  // console.log('platform:', platform)
  if (platformMap[platform]) {
    page = platformMap[platform].getPage()
    // console.log('page:', page, ' lang:', lang)
    clearRunner()
    if (page && platformMap[platform].pageHasSupportedLang()) initRunner()
  }
}

// this is required because of single page apps like Github,
// where url change and page load complete needs to be detected to init the runner
browser.runtime.onMessage.addListener(msg => {
  if (msg === 'pageUpdated') handlePageUpdate()
})
