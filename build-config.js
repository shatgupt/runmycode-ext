'use strict'

const config = {
  'manifest': {
    'common': {
      'name': 'RunMyCode Online',
      'short_name': 'RunMyCode',
      'description': 'Run code online from sites like Github, Gitlab and more',
      'author': 'Shatrughn Gupta',
      'homepage_url': 'https://runmycode.online',
      'version': '1.3.0',
      'icons': { '128': 'icon128.png' },
      'manifest_version': 2,
      'content_scripts': [
        {
          'matches': [
            'https://github.com/*',
            'https://gist.github.com/*',
            'https://gitlab.com/*',
            'https://bitbucket.org/*',
            'https://gobyexample.com/*'
          ],
          'js': ['browser-polyfill.min.js', 'content-script.js'],
          'css': ['runmycode-panel.css'],
          'run-at': 'document_idle'
        },
        {
          'matches': ['https://runmycode.online/dashboard.html*'],
          'js': ['browser-polyfill.min.js', 'auto-configure.js'],
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
        'tabs',  // for detecting url change and page loading complete for SPA like Github
        'storage',  // for storing API URL and key
        'https://api.runmycode.online/' // for making CORS calls for code run and key gen/usage
      ],
      'optional_permissions': [
        'https://*.amazonaws.com/'  // to allow for custom RunMyCode API deployment on AWS API Gateway
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
      'runmycode-panel.css',
      'icon128.png',
      'auto-configure.js'
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
