# RunMyCode Online Browser Extension

> Run code online from sites like Github, Gitlab and more - [https://runmycode.online](https://runmycode.online)

![RunMyCode Online Screen](screenshot1.png?raw=true "RunMyCode Online Screen")

## How to Use
1. First get an API key by authenticating at [RunMyCode Online](https://runmycode.online). To make sure it is working, run a sample code at [CodeSheet](https://runmycode.online/codesheet.html).
2. Install the extension: [Chrome](https://chrome.google.com/webstore/detail/runmycode-online/iidcnkpdmnopbbkdmneglbelcefgfohf), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/runmycode-online)
3. Copy key from [RunMyCode Online dashboard](https://runmycode.online/dashboard.html)(link needs authentication) and put it in extension's `API Key` option and save it.
4. Now you can go to any supported language code page in Github or Gitlab and you will see a `Run` button added to left of usual action buttons (see screenshot above). For example, you can test the extension at https://github.com/shatgupt/runmycode-test/blob/master/ruby.rb
5. Clicking that button will open a runner where you can input any command line args and then press the big orange `Run` button to run the code on the page.
6. You can also edit the code in Github or Gitlab page and make it run through the same `Run` button as above.

## Supported Websites
1. Github
2. Gitlab

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
4. Edge (Technically, but currently giving some CSP issues)

## Developing the Extension
### Building
Build generates `manifest.json`, creates a directory `dist/<browser>` and puts all the extension relevant files there.
- Build for all supported browsers: `npm run build`
- Build for a specific browser: `npm run build -- chrome|firefox|opera|edge`

## Credits
Icomoon.io for the icon.

## License
[MIT](LICENSE)
