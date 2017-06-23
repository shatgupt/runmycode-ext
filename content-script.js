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

const getLangFromPathExt = () => extMap[location.pathname.split('.').pop()]

const getCodeFromLines = (lines) => {
  return [].map.call(lines, (line) => line.innerText === '\n' ? '' : line.innerText).join('\n')
}

const body = document.body
const platformMap = {
  gitlab: {
    getLang: () => getLangFromPathExt(),
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
    getLang: () => getLangFromPathExt(),
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
  },
  gobyexample: {
    getLang: () => 'go',
    getPage: () => {
      if ($('body>div.example')) return 'show'
    },
    injectRunButton: () => {
      const runBtn = $('.run')
      runBtn.parentNode.setAttribute('href', '#')
      runBtn.setAttribute('id', 'runmycode-popup-runner')
    },
    pages: {
      show: {
        // there are 2 tables on the page, first one has the code
        getCode: () => getCodeFromLines($('table').querySelectorAll('.code>.highlight>pre'))
      }
    }
  }
}

const platform = getPlatform()
let runnerAdded = false
let lang, page

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
                <input id="runmycode-run-input" placeholder="Command line input to Code" title="Special shell characters like & should be quoted" type="text">
              </div>
            </div>
          </div>
          <div class="panel panel-default panel-runner">
            <div class="panel-heading">
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
  body.insertAdjacentHTML('afterbegin', runnerMarkup)

  /* *** Start Movable popup https://gist.github.com/akirattii/9165836 ****/
  let runnerVisible = false
  const runner = $('#runmycode-runner')
  const runnerCloseBtn = $('#runmycode-close-runner')
  const runBtn = $('#runmycode')
  const runInput = $('#runmycode-run-input')
  const runOutput = $('#runmycode-run-output')

  let runnerOffset = { x: 0, y: 0 }
  runner.style.left = `${(window.innerWidth - runnerWidth)/2}px` // have popup in the center of the screen

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
        runOutput.value = 'Invalid API Key or URL in extension options.\nDefault URL is https://api.runmycode.online/run and your key should be available at https://runmycode.online/dashboard.html after authenticating.'
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
    runOutput.classList.remove('error')
    runOutput.value = `Running ${lang} code...`
    $('#output-panel').classList.add('in')

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
        runBtn.disabled = false
      }
      if (apiUrl && key) {
        const url = `${apiUrl}/${lang}?args=${encodeURIComponent(runInput.value)}`
        callApi(url, key)
      }
    }, (error) => {
      console.error('getCreds Error:', error)
      runOutput.classList.add('error')
      runOutput.value = 'Some error happened. Please try again later.' // what else do I know? :/
    })
  })
}

const handlePageUpdate = () => {
  // console.log('platform:', platform)
  if (platformMap[platform]) {
    page = platformMap[platform].getPage()
    lang = platformMap[platform].getLang()
    // console.log('page:', page, ' lang:', lang)
    if (lang && page) initRunner()
  }
}

// this is required because of single page apps like Github,
// where url change and page load complete needs to be detected to init the runner
browser.runtime.onMessage.addListener(msg => {
  if (msg === 'pageUpdated') handlePageUpdate()
})
