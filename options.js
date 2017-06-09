'use strict'

const apiUrl = document.querySelector('#api-url')
const apiKey = document.querySelector('#api-key')
const saveBtn = document.querySelector('#save')

const enableSave = () => {
  saveBtn.value = 'Save'
  saveBtn.disabled = false
}

const saveOptions = (e) => {
  if (e) e.preventDefault()
  browser.storage.local.set({
    'apiUrl': apiUrl.value,
    'apiKey': apiKey.value
  })
  saveBtn.value = 'Saved'
  saveBtn.disabled = true
}

const restoreOptions = () => {
  const getApiUrl = browser.storage.local.get('apiUrl')
  const getApiKey = browser.storage.local.get('apiKey')
  Promise.all([getApiUrl, getApiKey])
  .then((result) => {
    apiUrl.value = result[0]['apiUrl'] || 'https://api.runmycode.online/run'
    apiKey.value = result[1]['apiKey'] || ''
    saveOptions()
  })
  .catch((error) => {
    console.log('Error: ', error)
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
saveBtn.addEventListener('click', saveOptions)
apiUrl.addEventListener('input', enableSave)
apiKey.addEventListener('input', enableSave)
