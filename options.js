'use strict'

const defaultAPIURL = 'https://api.runmycode.online/run'
const $ = s => document.querySelector(s)
const $$ = s => document.querySelectorAll(s)
const editBtn = $('#edit')
const error = $('#error')
const apiUrl = $('#api-url')
const apiKey = $('#api-key')
const saveBtn = $('#save')
const inputs = Array.from($$('input'))

const toggleInputs = () => {
  inputs.forEach((el) => {
    if (el.type === 'button') el.disabled = !el.disabled
    else if (el.type === 'text') {
      el.getAttribute('readonly') ? el.removeAttribute('readonly') : el.setAttribute('readonly', 'readonly')
    }
  })
}

const enableEdit = () => {
  saveBtn.value = 'Save'
  toggleInputs()
}

const saveOptions = (e) => {
  if (apiUrl.value === '') apiUrl.value = defaultAPIURL
  error.style.display = 'block'
  if (apiUrl.value !== defaultAPIURL && apiUrl.value.indexOf('.amazonaws.com') === -1) {
    error.textContent = `Only ${defaultAPIURL} and AWS API Gateway URLs are supported as API URL`
    return
  } else if (!apiKey.value && apiUrl.value === defaultAPIURL) {
    error.textContent = 'Key cannot be empty for https://api.runmycode.online/run'
    return
    // key may be not required for custom RunMyCode deployment
  }
  error.style.display = 'none'

  browser.storage.local.set({
    'apiUrl': apiUrl.value,
    'apiKey': apiKey.value
  })
  saveBtn.value = 'Saved'
  if (e) toggleInputs() // toggle inputs only if save from btn click
}

const restoreOptions = () => {
  const getApiUrl = browser.storage.local.get('apiUrl')
  const getApiKey = browser.storage.local.get('apiKey')
  Promise.all([getApiUrl, getApiKey])
  .then((result) => {
    apiUrl.value = result[0]['apiUrl'] || defaultAPIURL
    apiKey.value = result[1]['apiKey'] || ''
    saveOptions()
  })
  .catch((error) => {
    console.log('Error: ', error)
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
saveBtn.addEventListener('click', saveOptions)
editBtn.addEventListener('click', enableEdit)
