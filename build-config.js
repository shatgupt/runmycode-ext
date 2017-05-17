'use strict'

const config = {
  'manifest': {
    'common': {
      'name': 'RunMyCode Online',
      'description': 'Run code online from sites like Github, Gitlab and more',
      'author': 'Shatrughn Gupta',
      'homepage_url': 'https://runmycode.online',
      'version': '1.0.0',
      'manifest_version': 2,
      'content_scripts': [
        {
          'matches': ['https://github.com/*'],
          'js': ['browser-polyfill.min.js', 'content-script.js'],
          'css': ['runmycode-panel.css'],
          'run-at': 'document_idle'
        },
        {
          'matches': ['https://gitlab.com/*'],
          'js': ['browser-polyfill.min.js', 'content-script.js'],
          'run-at': 'document_idle'
        }
      ],
      'background': {
        'scripts': ['browser-polyfill.min.js', 'background.js'],
        'persistent': false
      },
      'options_ui': {
        'page': 'options.html'
      },
      'permissions': [
        'tabs',  // for detecting url change and loading complete for SPA like Github
        'storage',  // for storing API URL and key
        'https://api.runmycode.online/',
        'https://*.amazonaws.com/'  // to allow for custom RunMyCode APIG deployment
      ]
    }
  },
  'include_files': {
    'common': [
      'browser-polyfill.min.js',
      'background.js',
      'content-script.js',
      'options.html',
      'options.js',
      'runmycode-panel.css'
    ]
  }
}

// const manifests = config['manifest']
// manifests['chrome'] = {
//   'options_ui': Object.assign({}, manifests['common']['options_ui'], {
//     'chrome_style': true
//   })
// }
// manifests['opera'] = manifests['chrome']

module.exports = config
