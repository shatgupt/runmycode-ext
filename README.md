# RunMyCode Online Browser Extension

> Run code online from sites like Github, Gitlab and more

![RunMyCode Online Screen](screenshot1.png?raw=true "RunMyCode Online Screen")

## How to use
1. First get an API key by authenticating at [RunMyCode Online](https://runmycode.online). To make sure it is working, run a sample code at [CodeSheet](https://runmycode.online/codesheet.html).
2. Install the extension: [Chrome](https://chrome.google.com/webstore/detail/runmycode-online/iidcnkpdmnopbbkdmneglbelcefgfohf), [Firefox](https://addons.mozilla.org/en-US/firefox/addon/runmycode-online)
3. Copy key from [RunMyCode Online dashboard](https://runmycode.online/dashboard.html)(link needs authentication) and put it in extension's `API Key` option and save it.
4. Now you can go to any supported language code page in Github or Gitlab and you will see a `Run` button added to left of usual action buttons (see screenshot above). For example, you can test the extension at https://github.com/shatgupt/runmycode-test/blob/master/ruby.rb
5. Clicking that button will open a runner where you can input any command line args and then press the big orange `Run` button to run the code on the page.
6. You can also edit the code in Github or Gitlab page and make it run through the same `Run` button as above.

## Supported Languages
1. Nodejs 6
2. Python 2
3. Python 3
4. Ruby 2.2
5. PHP 7
6. Go
7. Java 1.8 (not enabled in published version)

Language is detected based on the file extension. So for executing Python 3 code, you will need py3 extension.

## Supported Websites
1. Github
2. Gitlab
