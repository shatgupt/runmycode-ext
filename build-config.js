'use strict'

const config = {
  'manifest': {
    'common': {
      'name': 'RunMyCode Online',
      'short_name': 'RunMyCode',
      'description': 'Compile and run C, C++, Java, Nodejs, Python, Ruby, Go and PHP code online, directly from Github, Gitlab, Bitbucket and more.',
      'author': 'Shatrughn Gupta',
      'homepage_url': 'https://runmycode.online',
      'version': '1.6.4',
      'icons': { '128': 'icon128.png' },
      'manifest_version': 2,
      'content_scripts': [
        {
          'matches': ['https://github.com/*', 'https://gist.github.com/*'],
          'js': [
            'browser-polyfill.min.js',
            'common-utils.js',
            'platforms/github.js',
            'runmycode.js'
          ],
          'css': ['runmycode-panel.css'],
          'run-at': 'document_idle'
        },
        {
          'matches': ['https://gitlab.com/*'],
          'js': [
            'browser-polyfill.min.js',
            'common-utils.js',
            'platforms/gitlab.js',
            'runmycode.js'
          ],
          'css': ['runmycode-panel.css'],
          'run-at': 'document_idle'
        },
        {
          'matches': ['https://bitbucket.org/*'],
          'js': [
            'browser-polyfill.min.js',
            'common-utils.js',
            'platforms/bitbucket.js',
            'runmycode.js'
          ],
          'css': ['runmycode-panel.css'],
          'run-at': 'document_idle'
        },
        {
          'matches': ['https://gobyexample.com/*'],
          'js': [
            'browser-polyfill.min.js',
            'common-utils.js',
            'platforms/gobyexample.js',
            'runmycode.js'
          ],
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
      ]
    }
  },
  'include_files': {
    'common': [
      'browser-polyfill.min.js',
      'background.js',
      'runmycode.js',
      'options.html',
      'options.js',
      'common-utils.js',
      'runmycode-panel.css',
      'icon128.png',
      'auto-configure.js',
      'platforms/github.js',
      'platforms/gitlab.js',
      'platforms/bitbucket.js',
      'platforms/gobyexample.js'
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
