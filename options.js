'use strict'

const apiUrl = document.querySelector('#api-url')
const apiKey = document.querySelector('#api-key')
const saveBtn = document.querySelector('#save')

const enableSave = () => {
  saveBtn.value = 'Save'
  saveBtn.disabled = false
}

const saveOptions = (e) => {
  e.preventDefault()
  browser.storage.local.set({
    'apiUrl': apiUrl.value,
    'apiKey': apiKey.value
  })
  saveBtn.value = 'Saved'
  saveBtn.disabled = true
}

const restoreOptions = () => {
  const setApiUrl = (result) => {
    apiUrl.value = result['apiUrl'] || 'https://api.runmycode.online/run'
  }

  const setApiKey = (result) => {
    apiKey.value = result['apiKey'] || ''
  }

  const onError = (error) => {
    console.log(`Error: ${error}`)
  }

  browser.storage.local.get('apiUrl').then(setApiUrl, onError)
  browser.storage.local.get('apiKey').then(setApiKey, onError)
}

document.addEventListener('DOMContentLoaded', restoreOptions)
saveBtn.onclick = saveOptions
apiUrl.oninput = enableSave
apiKey.oninput = enableSave
