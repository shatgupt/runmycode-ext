'use strict'

const $ = (selector) => {
  return document.querySelector(selector)
}

const $$ = (selector) => {
  return document.querySelectorAll(selector)
}

const extMap = {
  py: 'python',
  py3: 'python3',
  js: 'nodejs',
  rb: 'ruby',
  php: 'php',
  java: 'java',
  go: 'go'
}

const getCodeFromLines = (lines) => {
  return [].map.call(lines, (line) => {
    const text = line.innerText
    if (text === '\n') {
      return ''
    }
    return text
  }).join('\n')
}

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
        getCode: () => {
          return getCodeFromLines($('.blob-content code').children)
        }
      },
      edit: {
        getCode: () => {
          return getCodeFromLines($$('.ace_line'))
        }
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
        getCode: () => {
          return getCodeFromLines($$('.blob-wrapper table td.blob-code'))
        }
      },
      edit: {
        getCode: () => {
          return $('.file-editor-textarea').value
        }
      }
    }
  }
}

const platform = window.location.hostname.split('.').slice(-2, -1)
const body = document.body
let runnerAdded = false
let ext, lang, page

const initRunner = () => {
  if (runnerAdded) {
    return
  }

  platformMap[platform].injectRunButton()
  runnerAdded = true
  const runnerWidth = 350

  const runnerMarkup = `<style>
  #runmycode-runner {
    display: none;
    position: fixed;
    left: 300px;
    top: 210px;  /* set these so Chrome doesn't return 'auto' from getComputedStyle */
    width: ${runnerWidth}px;
    z-index: 999;
    background: white;
    box-shadow: 5px 5px 10px #888888;
  }

  #runmycode-runner > .panel-body {
    padding: 15px;
  }

  #runmycode-runner .panel-group {
    margin: 0;
  }

  #runmycode-runner>#runmycode-runner-handle {
    cursor: move;
  }

  #runmycode-runner .panel-heading {
    cursor: pointer;
    line-height: 27px;
    color: #565d64;
    background: #f5f5f5;
  }

  #runmycode-runner .panel-runner .panel-title {
    font-size: 14px;
  }

  #runmycode-runner .panel-runner .panel-body {
    padding: 0;
  }

  #runmycode-runner #runmycode {
    margin: 0 0 15px 0;
    padding: 10px 0;
    font-weight: bold;
    line-height: 1.3333333;
    background-image: none;
  }

  #runmycode-runner #runmycode-run-output, #runmycode-runner #runmycode-run-input {
    font-family: "Monaco", "Menlo", "Ubuntu Mono", "Consolas", "source-code-pro", monospace;
  }

  #runmycode-runner textarea {
    resize: both;
  }

  #runmycode-runner #runmycode:disabled {
    color: rgba(36,41,46,0.4);
    background-color: rgba(252,148,3,0.5);
    box-shadow: none;
    pointer-events: none !important;
    cursor: not-allowed;
  }
  </style>

  <div id="runmycode-runner" class="panel panel-default platform-${platform}">
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
              <textarea id="runmycode-run-input" placeholder="Input to Program" class="form-control"></textarea>
            </div>
          </div>
        </div>
        <div class="panel panel-default panel-runner">
          <div class="panel-heading">
            <h4 class="panel-title">Output</h4>
          </div>
          <div class="panel-collapse collapse in">
            <div class="panel-body">
              <textarea id="runmycode-run-output" rows="4" placeholder="Output from Program" readonly="true" class="form-control"></textarea>
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
  // runner.style.top = '210px'
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

  const onError = (error) => {
    console.log(`Error: ${error}`)
  }

  const callApi = (url, apiKey) => {
    fetch(url, {
      method: 'post',
      headers: {'x-api-key': apiKey},
      body: platformMap[platform]['pages'][page].getCode()
    })
    .then((res) => { return res.json() })
    .then((resp) => {
      console.log('JSON response', resp)
      if (resp.status === 'Successful') {
        runOutput.value = resp.stdout || resp.stderr
      } else {
        // runOutput.value = JSON.stringify(resp, null, 2)
        runOutput.value = resp.error
      }
      runBtn.disabled = false // enable run button
    })
    .catch(onError)
  }

  runBtn.addEventListener('click', (e) => {
    runBtn.disabled = true // disable run button
    // console.log(`Running ${lang} code`)
    runOutput.value = `Running ${lang} code`

    const getApiUrl = browser.storage.local.get('apiUrl')
    const getApiKey = browser.storage.local.get('apiKey')
    Promise.all([getApiUrl, getApiKey]).then((result) => {
      const url = `${result[0]['apiUrl']}/run/${lang}?args=${encodeURI(runInput.value)}`
      callApi(url, result[1]['apiKey'])
    }, onError)
  })
}

const updateLangPage = () => {
  ext = window.location.pathname.split('.').pop()
  lang = extMap[ext]
  page = platformMap[platform] ? platformMap[platform].getPage() : null
  console.log('update page =>', ext, lang, page)
  if (lang && page) {
    initRunner()
  }
}

// this is required because of single page apps like Github,
// where url change and page load complete needs to be detected to init the runner
browser.runtime.onMessage.addListener(msg => {
  if (msg === 'pageUpdated') {
    updateLangPage()
  }
})
