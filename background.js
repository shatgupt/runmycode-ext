'use strict'
// pass message to contentscript that url has changed
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // console.log('browser.tabs.onUpdated', changeInfo.status)
  if (changeInfo.status === 'complete') {
    browser.tabs.sendMessage(tabId, 'pageUpdated')
  }
})
