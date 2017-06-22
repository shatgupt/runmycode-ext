'use strict'

let user = localStorage.getItem('runmycode')
if (user) {
  user = JSON.parse(user)
  browser.storage.local.set({
    'apiKey': user.key
  }).then(() => {
    // console.log('from RunMyCode ext: Updated API Key')
  }, (err) => {
    console.error('set apiKey Error:', err)
  })
}
