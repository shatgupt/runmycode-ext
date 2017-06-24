# RunMyCode Online WebExtension

> Browser extension to run code online from sites like Github, Gitlab and more - [https://runmycode.online](https://runmycode.online)

[![RunMyCode Online Screenshot](screenshot1.png?raw=true)](https://www.youtube.com/watch?v=iwz8n3v7QVY "RunMyCode Online")

## How to Use
1. Install the extension: [Chrome](https://chrome.google.com/webstore/detail/runmycode-online/iidcnkpdmnopbbkdmneglbelcefgfohf), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/runmycode-online)
2. On extension install, [RunMyCode Online](https://runmycode.online) will open in a new tab and prompt you to authenticate to get a key.
3. On authenticating with any the of providers, you will be redirected to dashboard page and extension will be auto-configured with your key.
4. Now you can go to any [supported language](#supported-languages) code page on Github or Gitlab and you will see a `Run` button added to left of usual action buttons (see screenshot above). For example, you can test the extension with [this Ruby code on Github](https://github.com/shatgupt/runmycode-test/blob/master/ruby.rb).
5. Clicking that `Run` button will open a runner where you can input any command line args and then press the big orange `Run` button to run the code on the page.
6. You can also edit the code using the web editor on Github or Gitlab and make it run through the same `Run` button as above.

## Supported Websites
1. [Github](https://github.com/shatgupt/runmycode-test/blob/master/ruby.rb)
2. [Gitlab](https://gitlab.com/shatgupt/runmycode-test/blob/master/ruby.rb)
3. [Go by Example](https://gobyexample.com/hello-world)
4. [BitBucket](https://bitbucket.org) (soon)
5. [Github Gist](https://gist.github.com) (soon)
6. [Gitlab Snippets](https://gitlab.com/snippets) (soon)
7. [BitBucket Snippets](https://bitbucket.org/snippets) (soon)

## Supported Languages
Language is detected based on the file extension. So for executing Python3 code, you will need py3 extension.
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
3. Opera (Not published on store yet)

[Edge has a non-standard WebExtension implementation](https://github.com/mozilla/webextension-polyfill/issues/3)

## Developing the Extension
### Building
Build generates `manifest.json`, creates a directory `dist/<browser>` and puts all the extension relevant files there.
- Build for all supported browsers: `npm run build`
- Build for a specific browser: `npm run build -- chrome|firefox|opera|edge`

## Credits
[Icomoon.io](https://icomoon.io) for the icon.

## License
[MIT](LICENSE)
