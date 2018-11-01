'use strict'

const config = {
  'manifest': {
    'common': {
      'name': 'RunMyCode Online',
      'short_name': 'RunMyCode',
      'description': 'RunMyCode Online is a free and open-source tool to compile and run code online directly from Github, Gitlab and Bitbucket.',
      'author': 'Shatrughn Gupta',
      'homepage_url': 'https://runmycode.online',
      'version': '1.7.0',
      'icons': { '128': 'icon128.png' },
      'manifest_version': 2,
      'page_action': {
        'default_icon': 'icon128.png',
        'default_title': 'Click to allow RunMyCode extension on this site.'
      },
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
        // for detecting url change and page loading complete for single page apps like Github, BitBucket
        'tabs',
        // for storing API URL and key
        'storage',
        // for making CORS calls for code run and key gen/usage
        'https://api.runmycode.online/'
      ],
      'optional_permissions': [
        'https://gitlab.com/',
        'https://bitbucket.org/',
        'https://gobyexample.com/',
        '*://xahlee.info/', // someday they might enable https
        '*://www.learntosolveit.com/'
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
      'icon-active.png',
      'icon-supported.png',
      'auto-configure.js',
      'platforms/github.js',
      'platforms/gitlab.js',
      'platforms/bitbucket.js',
      'platforms/gobyexample.js',
      'platforms/xahlee.js',
      'platforms/learntosolveit.js'
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
