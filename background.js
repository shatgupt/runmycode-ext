/* global browser */
'use strict'

// This locationMap is mirrored from common-utils.js.
// Should always be synced to/from there after any change.
const locationMap = {
  'github.com': 'github',
  'gist.github.com': 'github_gist',
  'gitlab.com': 'gitlab',
  'gitlab.com/snippets': 'gitlab_snippets',
  'bitbucket.org': 'bitbucket',
  'bitbucket.org/snippets': 'bitbucket_snippets',
  'gobyexample.com': 'gobyexample',
  'xahlee.info': 'xahlee'
}

const site = 'https://runmycode.online'

const setPageActionSupported = (tabId) => {
  browser.pageAction.show(tabId)
  browser.pageAction.setTitle({
    tabId: tabId,
    title: 'Click to allow RunMyCode extension on this site.'
  })
  browser.pageAction.setIcon({
    tabId: tabId,
    path: '/icon-supported.png'
  })
}

const setPageActionUnsupported = (tabId) => {
  browser.pageAction.hide(tabId)
  browser.pageAction.setTitle({
    tabId: tabId,
    title: 'This site is not yet supported by RunMyCode.'
  })
  browser.pageAction.setIcon({
    tabId: tabId,
    path: '/icon128.png'
  })
}

const setPageActionActive = (tabId) => {
  browser.pageAction.show(tabId)
  browser.pageAction.setTitle({
    tabId: tabId,
    title: 'RunMyCode extension is running on this site.'
  })
  browser.pageAction.setIcon({
    tabId: tabId,
    path: '/icon-active.png'
  })
}

const injectScripts = (tabId, domain) => {
  browser.tabs.executeScript({
    file: '/browser-polyfill.js'
  })
    .then(() => {
      return browser.tabs.executeScript({
        file: '/common-utils.js'
      })
    })
    .then(() => {
      const platform = locationMap[domain].split('_')[0]
      return browser.tabs.executeScript({
        file: `/platforms/${platform}.js`
      })
    })
    .then(() => {
      return browser.tabs.executeScript({
        file: '/runmycode.js'
      })
    })
    .then(() => {
      return browser.tabs.insertCSS({
        file: '/runmycode-panel.css'
      })
    })
    .then(() => {
      browser.tabs.sendMessage(tabId, 'pageUpdated')
      setPageActionActive(tabId)
    })
}

// pass message to contentscript that url has changed
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  setPageActionUnsupported(tabId)
  if (changeInfo.status !== 'complete') return
  const url = tab.url.split('/')
  const domain = url[2]
  const permissionsToRequest = {
    origins: [url[0] + '//' + domain + '/']
  }
  if (domain in locationMap) {
    if (domain.endsWith('github.com')) {
      // we already have permissions for GitHub
      setPageActionActive(tabId)
      browser.tabs.sendMessage(tabId, 'pageUpdated')
    } else {
      browser.permissions.contains(permissionsToRequest).then((contains) => {
        if (contains) {
          console.log(`injecting since Already has required permissions:`, browser.permissions.getAll())
          injectScripts(tabId, domain)
        } else {
          console.log(`no permission yet:`, browser.permissions.getAll())
          setPageActionSupported(tabId)
        }
      })
    }
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

browser.pageAction.onClicked.addListener((tab) => {
  const url = tab.url.split('/')
  const domain = url[2]
  const permissionsToRequest = {
    origins: [url[0] + '//' + domain + '/']
  }

  const onResponse = (response) => {
    if (response) {
      console.log('Permission was granted')
      injectScripts(tab.id, domain)
    } else {
      console.log('Permission was refused')
    }
    return browser.permissions.getAll()
  }

  if (domain in locationMap) {
    if (domain.endsWith('github.com')) return
    browser.permissions.contains(permissionsToRequest).then((contains) => {
      if (!contains) {
        browser.permissions.request(permissionsToRequest)
          .then(onResponse)
          .then((currentPermissions) => {
            console.log(`Current permissions:`, currentPermissions)
          })
      } else {
        console.log(`Already has required permissions:`, browser.permissions.getAll())
      }
    })
  }
})
