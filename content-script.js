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

const getCodeFromLines = (lines) => {
  return [].map.call(lines, (line) => line.innerText === '\n' ? '' : line.innerText).join('\n')
}

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
    injectRunButton: () => {
      // file-actions on show page, file-buttons on edit
      const fileActions = $('.file-actions') || $('.file-buttons')
      fileActions.insertAdjacentHTML('afterbegin', '<div class="btn-group"><a class="btn btn-sm" id="runmycode-popup-runner">Run</a></div>')
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
    injectRunButton: () => {
      $('.file-actions').insertAdjacentHTML('afterbegin', '<div class="BtnGroup"><a class="btn btn-sm BtnGroup-item" id="runmycode-popup-runner">Run</a></div>')
    },
    pages: {
      show: {
        getCode: () => getCodeFromLines($$('.blob-wrapper table td.blob-code'))
      },
      edit: {
        getCode: () => $('.file-editor-textarea').value
      }
    }
  }
}

const platform = window.location.hostname.split('.').slice(-2, -1)
let runnerAdded = false
let ext, lang, page

const initRunner = () => {
  if (runnerAdded) return

  platformMap[platform].injectRunButton()
  runnerAdded = true
  const runnerWidth = 350

  const runnerMarkup = `<style>
  #runmycode-runner {
    width: ${runnerWidth}px;
  }
  </style>

  <div id="runmycode-runner">
    <div class="panel panel-default">
      <div id="runmycode-runner-handle" class="panel-heading">
        <button id="runmycode-close-runner" type="button" class="close">x</button>
        <h3 class="panel-title">Run My Code</h3>
      </div>
      <div class="panel-body">
        <button id="runmycode" type="button" class="btn btn-warning btn-block btn-lg">Run</button>
        <div class="panel-group">
          <div class="panel panel-default panel-runner">
            <div class="panel-heading">
              <h4 class="panel-title">Input</h4>
            </div>
            <div class="panel-collapse collapse">
              <div class="panel-body">
                <textarea id="runmycode-run-input" placeholder="Command line input to Code" title="Special shell characters like & should be quoted"></textarea>
              </div>
            </div>
          </div>
          <div class="panel panel-default panel-runner">
            <div class="panel-heading">
              <h4 class="panel-title">Output</h4>
            </div>
            <div id="output-panel" class="panel-collapse collapse in">
              <div class="panel-body">
                <textarea id="runmycode-run-output" rows="5" placeholder="Output from Code" readonly="true"></textarea>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  `
  // inject runner styles and markup
  body.insertAdjacentHTML('afterbegin', runnerMarkup)

  /* *** Start Movable popup https://gist.github.com/akirattii/9165836 ****/
  let runnerVisible = false
  const runner = $('#runmycode-runner')
  const runnerCloseBtn = $('#runmycode-close-runner')
  const runBtn = $('#runmycode')
  const runInput = $('#runmycode-run-input')
  const runOutput = $('#runmycode-run-output')

  let runnerOffset = { x: 0, y: 0 }
  runner.style.left = `${window.innerWidth - runnerWidth - 100}px` // have popup 100px from right edge

  runnerCloseBtn.addEventListener('click', (e) => {
    runner.style.display = 'none'
    runnerVisible = false
  })
  window.addEventListener('keydown', (e) => {
    if (e.keyCode === 27) { // if ESC key pressed
      runnerCloseBtn.click(e)
    }
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

  $('#runmycode-popup-runner').addEventListener('click', (e) => {
    e.preventDefault()
    if (runnerVisible) {
      runnerCloseBtn.click(e)
    } else {
      runnerVisible = true
      runner.style.display = 'block'
    }
  })
  /* *** End Movable popup ****/

  // collapse input, output panels
  Array.from($$('.panel-runner>.panel-heading')).forEach((el) => {
    el.addEventListener('click', (ev) => {
      ev.target.closest('.panel-heading').nextElementSibling.classList.toggle('in')
    })
  })

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
        runOutput.value = 'Invalid API Key or URL in extension options.\nDefault URL is https://api.runmycode.online/run and your key should be available at https://runmycode.online after authenticating.'
      } else {
        runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
      }
      runBtn.disabled = false // enable run button
    })
    .catch((error) => {
      console.error('Error:', error)
      runOutput.classList.add('error')
      runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
      runBtn.disabled = false // enable run button
    })
  }

  runBtn.addEventListener('click', (e) => {
    runBtn.disabled = true // disable run button
    // console.log(`Running ${lang} code`)
    runOutput.classList.remove('error')
    runOutput.value = `Running ${lang} code...`
    $('#output-panel').classList.add('in')

    const getApiUrl = browser.storage.local.get('apiUrl')
    const getApiKey = browser.storage.local.get('apiKey')
    Promise.all([getApiUrl, getApiKey]).then((result) => {
      const key = result[1]['apiKey']
      if (!key) {
        runOutput.classList.add('error')
        runOutput.value = 'Please set the API key in the extension options as generated from https://runmycode.online'
        runBtn.disabled = false
      } else {
        const url = `${result[0]['apiUrl']}/${lang}?args=${encodeURIComponent(runInput.value)}`
        callApi(url, key)
      }
    }, (error) => {
      console.error('Error:', error)
      runOutput.classList.add('error')
      runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
    })
  })
}

const updateLangPage = () => {
  ext = window.location.pathname.split('.').pop()
  lang = extMap[ext]
  page = platformMap[platform] ? platformMap[platform].getPage() : null
  // console.log('update page =>', ext, lang, page)
  if (lang && page) initRunner()
}

// this is required because of single page apps like Github,
// where url change and page load complete needs to be detected to init the runner
browser.runtime.onMessage.addListener(msg => {
  if (msg === 'pageUpdated') updateLangPage()
})
