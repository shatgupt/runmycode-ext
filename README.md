# RunMyCode Online Browser Extension

> Run code online from sites like Github, Gitlab and more

## How to use

1. First get an API key by authenticating at https://runmycode.online. To make sure it is working, run a sample code at https://runmycode.online/codesheet.html.
2. Install the extension.
3. Copy key from RunMyCode Online dashboard and put it in extension API Key option and save it.
4. Now you can browse to supported language code page in Github or Gitlab and you will see a `Run` button added to left of usual action buttons.
5. Clicking that button will open a runner where you can input any command line args and then press the big orange `Run` button to run the code on the page.
6. You can start editing the code in Github or Gitlab page and make it run through the same `Run` button as above.

## Supported Websites

1. Github
2. Github Gist (soon)
3. Gitlab
4. Gitlab Snippets (soon)

## Supported Languages

1. Nodejs 6
2. Python 2
3. Python 3
4. Ruby 2.2
5. PHP 7
6. Go
7. Java 1.8 (not enabled in published version)

Language is detected based on the file extension. So for executing Python 3 code, you will need py3 extension.
