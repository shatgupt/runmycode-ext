'use strict';

((window, document) => {
  const rmc = window.runmycode
  const $ = rmc.$
  const $$ = rmc.$$
  const displayLangMap = rmc.displayLangMap
  const getFileNameFromElement = rmc.getFileNameFromElement
  const getLangFromFileName = rmc.getLangFromFileName
  const platforms = rmc.platforms

  const platform = rmc.getPlatform()
  const body = document.body
  let filename, lang, pageConf, runner, runnerCloseBtn, runBtn, runInput, runOutput, codeContainer // this element somewhere contains the code to execute
  let codeRunning = false

  // find out whether given container has any file of supported language
  const hasSupportedLang = (fileNameSelector = pageConf.fileNameSelector, fileContainer = document.body) => {
    for (let f of Array.from($$(fileNameSelector, fileContainer))) {
      if (getLangFromFileName(getFileNameFromElement(f))) return true
    }
    return false
  }

  const injectRunButtons = () => {
    $$(pageConf.containerSelector).forEach((fileContainer) => {
      const _filename = getFileNameFromElement($(pageConf.fileNameSelector, fileContainer))
      if (!getLangFromFileName(_filename)) return // nothing to do if lang not supported
      pageConf.injectRunButton($(pageConf.runButtonContainer, fileContainer), _filename)
      // Listen to delete of this file to close runner if attached to this file
      // Used on Github Gist and Bitbucket Snippets edit pages
      if (pageConf.deleteFileSelector) {
        $(pageConf.deleteFileSelector, fileContainer).addEventListener('click', () => {
          window.dispatchEvent(new CustomEvent('run.button.removed', {detail: fileContainer}))
        })
      }
    })
  }

  const addRunButtonListeners = (btnContainer = body) => {
    $$('.runmycode-popup-runner', btnContainer).forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault()
        if (codeRunning) {
          window.alert(`Already running ${filename}. Wait till it completes.`)
          return
        }
        runner.classList.remove('hidden')
        const openRunnerBtn = e.target
        codeContainer = openRunnerBtn.closest(pageConf.containerSelector)
        lang = openRunnerBtn.dataset.lang
        filename = openRunnerBtn.dataset.filename
        runInput.value = ''
        runOutput.value = ''
        codeRunning = false
        runBtn.textContent = 'Run'
        runBtn.disabled = false
        const langName = displayLangMap[lang]
        runBtn.setAttribute('title', `Run ${filename} (${langName})`)
        runInput.setAttribute('title', `STDIN to ${filename} (${langName})`)
        runInput.setAttribute('placeholder', `STDIN to ${filename} (${langName})`)
        runOutput.setAttribute('title', `Output from ${filename} (${langName})`)
        runOutput.setAttribute('placeholder', `Output from ${filename} (${langName})`)
      })
    })
  }

  const fileWatcher = (fileContainer) => {
    let currentFileName, openRunnerBtn
    const fileNameInput = $(pageConf.fileNameSelector, fileContainer)
    // for Bitbucket, input might not be present by the time this gets called first time
    if (fileNameInput) {
      fileNameInput.addEventListener('input', () => {
        openRunnerBtn = $('.runmycode-popup-runner', fileContainer)
        currentFileName = getFileNameFromElement(fileNameInput)
        if (getLangFromFileName(currentFileName)) {
          // supported lang
          if (openRunnerBtn) {
            // just update filename, lang if btn already present
            openRunnerBtn.dataset.filename = currentFileName
            openRunnerBtn.dataset.lang = getLangFromFileName(currentFileName)
            window.dispatchEvent(new CustomEvent('run.button.updated', {detail: fileContainer}))
          } else {
            // add a new Run button
            pageConf.injectRunButton($(pageConf.runButtonContainer, fileContainer), currentFileName)
            window.dispatchEvent(new CustomEvent('run.button.added', {detail: fileContainer}))
            // Listen to delete of this file to close runner if attached to this file
            if (pageConf.deleteFileSelector) {
              $(pageConf.deleteFileSelector, fileContainer).addEventListener('click', () => {
                window.dispatchEvent(new CustomEvent('run.button.removed', {detail: fileContainer}))
              })
            }
          }
        } else {
          // remove run button, if present, for non-supported lang
          if (openRunnerBtn) {
            pageConf.removeRunButton(openRunnerBtn)
            window.dispatchEvent(new CustomEvent('run.button.removed', {detail: fileContainer}))
          }
        }
      })
    }
  }

  // for places where edit of filename and extension is allowed
  // watch for existing files getting renamed on edit or new page
  // or watch for new files getting added on edit Gihub Gist or Bitbucket Snippets page
  const addFileWatcher = (fileContainer = null) => {
    if (fileContainer) {
      fileWatcher(fileContainer)
    } else {
      $$(pageConf.containerSelector).forEach((_fileContainer) => {
        fileWatcher(_fileContainer)
      })
    }
  }

  const initRunner = () => {
    if ($('#runmycode-runner')) return // runner is already present

    const runnerWidth = 350
    const runnerHTML = `<style>
    #runmycode-runner {
      width: 350px;
    }
    </style>

    <div id="runmycode-runner" class="hidden">
      <div class="panel panel-default">
        <div id="runmycode-runner-handle" class="panel-heading">
          <button id="runmycode-close-runner" type="button" class="close" title="Shortcut to Close: ESC key">x</button>
          <h3 class="panel-title"><a target="_blank" href="https://runmycode.online" title="Go to RunMyCode Online Website">RunMyCode Online</a></h3>
        </div>
        <div class="panel-body">
          <button id="runmycode" type="button" class="btn btn-warning btn-block btn-lg">Run</button>
          <div class="panel-group">
            <div class="panel panel-default panel-runner">
              <div class="panel-heading" title="STDIN to Code">
                <h4 class="panel-title">Input</h4>
              </div>
              <div class="panel-collapse collapse">
                <div class="panel-body">
                  <textarea id="runmycode-run-input" placeholder="STDIN to Code" title="STDIN to Code"></textarea>
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
    </div>`
    // following insertAdjacentHTML should be safe since the above html string is fully static and has no variable/user provided component
    body.insertAdjacentHTML('afterbegin', runnerHTML)

    /* *** Start Movable popup https://gist.github.com/akirattii/9165836 ****/
    runner = $('#runmycode-runner')
    runnerCloseBtn = $('#runmycode-close-runner')
    runBtn = $('#runmycode')
    runInput = $('#runmycode-run-input')
    runOutput = $('#runmycode-run-output')

    let runnerOffset = { x: 0, y: 0 }
    runner.style.left = `${(window.innerWidth - runnerWidth) / 2}px` // have popup in the center of the screen

    runnerCloseBtn.addEventListener('click', () => runner.classList.add('hidden'))
    window.addEventListener('keydown', (e) => {
      if (e.keyCode === 27) runnerCloseBtn.click() // if ESC key pressed
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
    $$('.panel-runner>.panel-heading').forEach((el) => {
      el.addEventListener('click', (ev) => {
        ev.target.closest('.panel-heading').nextElementSibling.classList.toggle('in')
      })
    })

    const setRunning = () => {
      codeRunning = true
      runBtn.textContent = 'Running'
      runBtn.disabled = true // disable run button
      runOutput.classList.remove('error')
      runOutput.value = `Running ${filename} (${displayLangMap[lang]})`
      $('#output-panel').classList.add('in')
    }

    const resetRunning = () => {
      codeRunning = false
      runBtn.textContent = 'Run'
      runBtn.disabled = false // enable run button
    }

    const callApi = (url, apiKey) => {
      const code = pageConf.getCode(codeContainer)
      if (code.trim() === '') {
        runOutput.classList.add('error')
        runOutput.value = 'No code to run!'
        resetRunning()
        return
      }
      window.fetch(url, {
        method: 'post',
        headers: {'x-api-key': apiKey},
        body: code
      })
      .then(res => res.json())
      .then((resp) => {
        // console.log('Run response', resp)
        // do not update runOutput if the attached run btn has changed due to run.button.added event
        if (codeRunning) {
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
        }
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
          const url = `${apiUrl}/${lang}?platform=${platform}&args=${encodeURIComponent(runInput.value)}`
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
    if (platforms[platform]) {
      const page = platforms[platform].getPage()
      // console.log('page:', page)
      clearRunner()
      if (page) {
        pageConf = platforms[platform]['pages'][page]
        // a page can have custom lang check - used at gobyexample.com
        if ((pageConf.hasSupportedLang && pageConf.hasSupportedLang()) || hasSupportedLang()) {
          // can have custom code to inject run button - used at gobyexample.com
          if (pageConf.injectRunButtons) {
            pageConf.injectRunButtons()
          } else {
            injectRunButtons()
          }
          initRunner()
          addRunButtonListeners()
        }
        // for places where edit of filename and extension is allowed
        if (pageConf.addFileWatcher) {
          // watch for existing files getting renamed on edit or new page
          addFileWatcher()
          // watch for new files getting added on edit Gihub Gist or Bitbucket Snippets page
          if (pageConf.fileListSelector) {
            const fileList = $(pageConf.fileListSelector)
            const observer = new MutationObserver((mutations) => {
              const newFileContainer = mutations[0].addedNodes[0]
              if (newFileContainer) {
                addFileWatcher($(pageConf.containerSelector, newFileContainer))
              }
            })
            observer.observe(fileList, { childList: true })
          }
        }
      }
    }
  }

  // this is required because of single page apps like Github, Bitbucket
  // where url change and page load complete needs to be detected to init the runner
  browser.runtime.onMessage.addListener(msg => {
    if (msg === 'pageUpdated') handlePageUpdate()
  })
  // to forcefully trigger pageUpdate - used in case of Bitbucket edit
  window.addEventListener('platform.page.updated', handlePageUpdate, true)

  const handleRunButtonRemove = (e) => {
    const updatedCodeContainer = e.detail
    if (updatedCodeContainer === codeContainer) {
      codeRunning = false // to prevent active fetch request to update runner after completion
      runnerCloseBtn.click()
    }
  }

  const handleRunButtonUpdate = (e) => {
    const updatedCodeContainer = e.detail
    if (updatedCodeContainer === codeContainer) {
      codeRunning = false // to prevent active fetch request to update runner after completion
      // immediately update runner filename, placeholder info only if visible
      // if runner is hidden, clicking popup-runner will make it visible
      if (!runner.classList.contains('hidden')) $('.runmycode-popup-runner', updatedCodeContainer).click()
    }
  }

  const handleRunButtonAddition = (e) => {
    initRunner()
    addRunButtonListeners(e.detail || body)
    handleRunButtonUpdate(e)
  }

  window.addEventListener('run.button.added', handleRunButtonAddition, true)
  window.addEventListener('run.button.updated', handleRunButtonUpdate, true)
  window.addEventListener('run.button.removed', handleRunButtonRemove, true)
})(window, document)
