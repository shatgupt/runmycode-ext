# RunMyCode Online WebExtension

> Browser extension to run code online directly from Github, Gitlab, Bitbucket and more - [https://runmycode.online](https://runmycode.online)

[![RunMyCode Online Screenshot](screenshot.png?raw=true)](https://www.youtube.com/watch?v=iwz8n3v7QVY "RunMyCode Online Introduction video on YouTube")

## How to Use
1. Install the extension: [Chrome](https://chrome.google.com/webstore/detail/runmycode-online/iidcnkpdmnopbbkdmneglbelcefgfohf), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/runmycode-online), [Opera](#supported-browsers)
2. On extension install, [RunMyCode Online](https://runmycode.online) will open in a new tab and prompt you to authenticate to get a key.
3. On authenticating with any the of providers, you will be redirected to dashboard page and extension will be auto-configured with your key.
4. Now you can go to any [supported language](#supported-languages) code page on Github or Gitlab and you will see a colored `Run` button added to left of usual action buttons (see screenshot above). For example, you can test the extension with [this Ruby code on Github](https://github.com/shatgupt/runmycode-test/blob/master/ruby.rb).
5. Clicking that `Run` button will open a runner where you can input any command line args and then press the big orange `Run` button to run the code on the page.
6. You can also edit the code using the web editor on Github or Gitlab and make it run through the same `Run` button as above.

## Supported Websites
All the supported version control sites have support for running standalone code from view, edit and new file pages.
1. [Github](https://github.com/shatgupt/runmycode-test/blob/master/ruby.rb)
2. [Gitlab](https://gitlab.com/shatgupt/runmycode-test/blob/master/ruby.rb)
3. [BitBucket](https://bitbucket.org/shatgupt/runmycode-test/src/c9cda15cb3fa1144e53f199e6ac6003ee5bdb25b/ruby.rb)
4. [Go by Example](https://gobyexample.com/hello-world)
5. [Github Gist](https://gist.github.com/shatgupt/b76ebbf67c6a38d0decb686ff230dd04)
6. [Gitlab Snippets](https://gitlab.com/snippets/1664532)
7. [BitBucket Snippets](https://bitbucket.org/snippets/shatgupt/jykE9)

## Supported Languages
Language is detected based on the file extension. So for executing `Python3` code, you will need `py3` extension.
1. Nodejs 6
2. Python 2
3. Python 3
4. Ruby 2.2
5. PHP 7
6. Go
7. Java 1.8 (not enabled in published version)

## Supported Browsers
Latest versions of following browsers:
1. [Chrome](https://chrome.google.com/webstore/detail/runmycode-online/iidcnkpdmnopbbkdmneglbelcefgfohf)
2. [Firefox](https://addons.mozilla.org/en-US/firefox/addon/runmycode-online)
3. Opera - Use [this Opera extension](https://addons.opera.com/en/extensions/details/download-chrome-extension-9/) to install the Chrome version.

[Edge has a non-standard WebExtension implementation](https://github.com/mozilla/webextension-polyfill/issues/3)

## Permissions Requested by Extension
1. Permissions for the above [supported websites](#supported-websites) to allow extension to run code directly from there
2. `runmycode.online` - To auto-configure the extension
3. `api.runmycode.online` - To run code from the extension
4. `tabs` - For detecting url change and page loading complete for single page apps like Github, Bitbucket
5. `storage` - To store API URL and Key as extension options

## Developing the Extension
### Building
Build generates `manifest.json`, creates a directory `dist/<browser>` and puts all the extension relevant files there.
- Build for all supported browsers: `npm run build`
- Build for a specific browser: `npm run build -- chrome|firefox|opera|edge`

## Credits
[Icomoon.io](https://icomoon.io) for the icon.  
[Intelli-Octo](https://github.com/pd4d10/intelli-octo) for the initial code scraping code.

## License
[MIT](LICENSE)
