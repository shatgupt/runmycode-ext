'use strict'

const defaultAPIURL = 'https://api.runmycode.online/run'

const $ = s => document.querySelector(s)
const isAWSApiGUrl = url => url.indexOf('.amazonaws.com') !== -1

const editBtn = $('#edit')
const error = $('#error')
const apiUrlInput = $('#api-url')
const apiKeyInput = $('#api-key')
const saveBtn = $('#save')
const inputs = Array.from(document.querySelectorAll('input'))

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

const saveOptionsToStorage = (e) => {
  browser.storage.local.set({
    'apiUrl': apiUrlInput.value,
    'apiKey': apiKeyInput.value
  }).then(() => {
    error.style.display = 'none'
    saveBtn.value = 'Saved'
    if (e) toggleInputs() // toggle inputs only if save from btn click
  }, (err) => {
    console.error('set apiUrl, apiKey Error:', err)
    error.textContent = `set apiUrl, apiKey Error: ${err}`
  })
}

const saveOptions = (e) => {
  error.style.display = 'block'
  if (apiUrlInput.value === '') apiUrlInput.value = defaultAPIURL
  if (apiUrlInput.value !== defaultAPIURL && !isAWSApiGUrl(apiUrlInput.value)) {
    error.textContent = `Only ${defaultAPIURL} and AWS API Gateway URLs are supported as API URL`
    return
  } else if (!apiKeyInput.value && apiUrlInput.value === defaultAPIURL) {
    error.textContent = `Key cannot be empty for ${defaultAPIURL}`
    return
    // key may be not required for custom RunMyCode deployment
  }

  browser.storage.local.get('apiUrl').then((res) => {
    const oldApiUrl = res['apiUrl']
    const newApiUrl = apiUrlInput.value
    if (newApiUrl !== oldApiUrl && isAWSApiGUrl(newApiUrl)) {
      // Following piece of code requires optional_permission support in manifest.json
      // Will work in Chrome, Opera and only latest version of Firefox

      // add new AWS permission
      // from https://xxxxxx.execute-api.us-east-1.amazonaws.com/prod/run/ruby
      // extract https://xxxxxx.execute-api.us-east-1.amazonaws.com/
      let permissionUrl = newApiUrl.match(/.*\/\/.*?\//)[0]
      browser.permissions.request({origins: [permissionUrl]})
      .then((response) => {
        console.log('permissions.request', response)
        if (response) {
          // remove old AWS permission
          if (oldApiUrl && isAWSApiGUrl(oldApiUrl)) {
            permissionUrl = oldApiUrl.match(/.*\/\/.*?\//)[0]
            browser.permissions.remove({origins: [permissionUrl]})
            .then((response) => {
              console.log('permissions.remove', response)
              if (!response) console.error(`Error removing permission for ${permissionUrl} (${oldApiUrl})`)
            })
          }
          // even if remove permission fails, its ok to save new url
          saveOptionsToStorage(e)
        } else {
          console.error(`Error requesting permission for ${permissionUrl} (${newApiUrl})`)
          error.textContent = `Error getting apiUrl from storage: ${error}`
        }
      })
    } else {
      saveOptionsToStorage(e)
    }
  }, (error) => {
    console.error('Error getting apiUrl from storage:', error)
    error.textContent = `Error getting apiUrl from storage: ${error}`
  })
}

const restoreOptions = () => {
  const getApiUrl = browser.storage.local.get('apiUrl')
  const getApiKey = browser.storage.local.get('apiKey')
  Promise.all([getApiUrl, getApiKey])
  .then((result) => {
    apiUrlInput.value = result[0]['apiUrl'] || defaultAPIURL
    apiKeyInput.value = result[1]['apiKey'] || ''
    // saveOptions()
  }, (error) => {
    console.error('restoreOptions Error:', error)
  })
}

document.addEventListener('DOMContentLoaded', restoreOptions)
saveBtn.addEventListener('click', saveOptions)
editBtn.addEventListener('click', enableEdit)
