# Usage

### Download the client_secret.json file

* Use `https://console.developers.google.com/start/api?id=drive` wizard to create or select a project in the Google Developers Console and automatically turn on the API. Click Continue, then Go to credentials.
* At the top of the page, select the OAuth consent screen tab. Select an Email address, enter a Product name if not already set, and click the Save button.
* Select the Credentials tab, click the Create credentials button and select OAuth client ID.
* Select the application type Other, enter the name "Drive API Quickstart", and click the Create button.
* Click OK to dismiss the resulting dialog.
* Click the file_download (Download JSON) button to the right of the client ID.
* Move this file into this directory and rename it client_secret.json.

### First Time Use

* When you run the code for the first time, it will ask you to visit a URL and copy an access code from there and paste it here.
* This would save the user credentials in the `.credentials/drive-nodejs.json` file.
* You have now been authorized and the `authorized_callback` function is called.

### Later Use

* From now on, when you run the code, `authorized_callback` is called automatically.

### authorized_callback function

* You can call the required functions from here such as file list, file download, file upload and file delete.
* The `auth` dictionary is sent as a parameter to this function which will be used with all the other functions wherever required.