/* global browser */
'use strict'

// Maps supported sites to objects implementing the functionality
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
  'xahlee.info': 'xahlee',
  'www.learntosolveit.com': 'learntosolveit',
  'www.geeksforgeeks.org': 'geeksforgeeks',
  'www.tutorialspoint.com': 'tutorialspoint'
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
    title: 'RunMyCode extension is active on this site.'
  })
  browser.pageAction.setIcon({
    tabId: tabId,
    path: '/icon-active.png'
  })
}

// Inject scripts and CSS to make it functional on the requested domain
const injectScripts = (tabId, domain) => {
  browser.tabs.executeScript({
    file: '/browser-polyfill.min.js'
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
  .catch((err) => {
    console.error('Error in injectScripts for domain', domain, err.message)
  })
}

// Listen for user's request of adding permission for the current domain
let permissionListenerAdded = false
const addPermissionListener = () => {
  console.log('addPermissionListener called')
  // Don't added another one on page navigation
  if (permissionListenerAdded) return
  console.log('addPermissionListener added')
  permissionListenerAdded = true
  let clicked = false

  browser.pageAction.onClicked.addListener((tab) => {
    console.log('pageAction.onClicked called')
    // Not sure how it is happening, but lets avoid multiple clicks
    if (clicked) return
    clicked = true
    const url = tab.url.split('/')
    const domain = url[2]
    const permissionsToRequest = {
      origins: [url[0] + '//' + domain + '/']
    }

    browser.permissions.request(permissionsToRequest)
    .then((response) => {
      if (response) injectScripts(tab.id, domain)
      else clicked = false
    })
    .catch((err) => {
      console.error('Error in requesting permission for domain', domain, err.message)
      clicked = false
    })
  })
}

// pass message to contentscript that url has changed
browser.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  // setPageActionUnsupported(tabId)
  if (changeInfo.status !== 'complete') return
  const url = tab.url.split('/')
  const domain = url[2]
  const permissionsToRequest = {
    origins: [url[0] + '//' + domain + '/']
  }

  if (domain in locationMap) {
    // By default we have permission for GitHub
    if (domain === 'github.com' || domain === 'gist.github.com') {
      setPageActionActive(tabId)
      browser.tabs.sendMessage(tabId, 'pageUpdated')
    } else {
      browser.permissions.contains(permissionsToRequest).then((hasPerm) => {
        if (hasPerm) {
          // Already got permission, inject required scripts and css
          injectScripts(tabId, domain)
        } else {
          // Supported but no permission yet
          setPageActionSupported(tabId)
          addPermissionListener()
        }
      })
    }
  }
})

// Open the dashboard page on install so that the extension can configure itself
browser.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    browser.tabs.create({
      url: site + '/dashboard.html?ext-install=1'
    })
  }
})
