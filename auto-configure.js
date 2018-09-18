'use strict'

const defaultAPIURL = 'https://api.runmycode.online/run'
let user = localStorage.getItem('runmycode')
if (user) {
  user = JSON.parse(user)
  if (user.key) {
    browser.storage.local.get('apiUrl').then((res) => {
      let apiUrl = res['apiUrl']
      if (!apiUrl) apiUrl = defaultAPIURL // set default value if not set
      if (apiUrl === defaultAPIURL) {
        // auto-configure only if it is the default API URL
        browser.storage.local.set({
          'apiUrl': apiUrl,
          'apiKey': user.key
        }).then(() => {
          // console.log('from RunMyCode ext: Updated API Key')
        }, (err) => {
          console.error('from RunMyCode ext: set apiUrl, apiKey Error:', err)
        })
      }
    })
  }
}
