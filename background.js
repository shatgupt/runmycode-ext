'use strict'

const site = 'https://runmycode.online'
// pass message to contentscript that url has changed
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    browser.tabs.sendMessage(tabId, 'pageUpdated')
  }
})

// Open the dashboard page on install so that extension can be configured automatically
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({
      url: site + '/dashboard.html?ext-install=1'
    })
  }
})
