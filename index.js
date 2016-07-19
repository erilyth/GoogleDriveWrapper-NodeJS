var fs = require('fs');
var readline = require('readline');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

// This gives all permissions to the drive, reduce the scope if not required
var SCOPES = ['https://www.googleapis.com/auth/drive'];

var TOKEN_DIR = '.credentials/';
var TOKEN_PATH = TOKEN_DIR + 'drive-nodejs.json';

// Load client secrets from a local file.
fs.readFile('client_secret.json', function processClientSecrets(err, content) {
  if (err) {
    console.log('Error loading client secret file: ' + err);
    return;
  }
  // Authorize a client with the loaded credentials, then call the
  // Drive API.
  authorize(JSON.parse(content), authorized_callback);
});

/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 *
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  var clientSecret = credentials.installed.client_secret;
  var clientId = credentials.installed.client_id;
  var redirectUrl = credentials.installed.redirect_uris[0];
  var auth = new googleAuth();
  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, function(err, token) {
    if (err) {
      getNewToken(oauth2Client, callback);
    } else {
      oauth2Client.credentials = JSON.parse(token);
      callback(oauth2Client);
    }
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 *
 * @param {google.auth.OAuth2} oauth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback to call with the authorized
 *     client.
 */
function getNewToken(oauth2Client, callback) {
  var authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES
  });
  console.log('Authorize this app by visiting this url: ', authUrl);
  var rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  rl.question('Enter the code from that page here: ', function(code) {
    rl.close();
    oauth2Client.getToken(code, function(err, token) {
      if (err) {
        console.log('Error while trying to retrieve access token', err);
        return;
      }
      oauth2Client.credentials = token;
      storeToken(token);
      callback(oauth2Client);
    });
  });
}

/**
 * Store token to disk be used in later program executions.
 *
 * @param {Object} token The token to store to disk.
 */
function storeToken(token) {
  try {
    fs.mkdirSync(TOKEN_DIR);
  } catch (err) {
    if (err.code != 'EEXIST') {
      throw err;
    }
  }
  fs.writeFile(TOKEN_PATH, JSON.stringify(token));
  console.log('Token stored to ' + TOKEN_PATH);
}

/**
 * Lists the names and IDs of up to 10 files.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function listFiles(auth) {
  var service = google.drive('v2');
  service.files.list({
    auth: auth,
    maxResults: 10,
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var files = response.items;
    if (files.length == 0) {
      console.log('No files found.');
    } else {
      console.log('Files:');
      for (var i = 0; i < 10; i++) {
        var file = files[i];
        console.log('%s (%s)', file.title, file.id);
      }
    }
  });
}

/**
 * Download a file's content.
 *
 * @param {String} file Drive File instance's ID.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {String} Destination file path.
 */
function downloadFile(fileid, auth, destfilepath) {
    var fileId = fileid;
    var service = google.drive('v2');
    var dest = fs.createWriteStream(destfilepath);
    service.files.get({
       fileId: fileId,
       alt: 'media',
       auth: auth
    })
    .on('end', function() {
      console.log('Done');
    })
    .on('error', function(err) {
      console.log('Error during download', err);
    })
    .pipe(dest);

}

/**
 * Upload a file.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 * @param {String} Source file path.
 */
function uploadFile(auth, filepath) {
    var fileMetadata = {
      'name': 'Upload from code'
    };
    var media = {
      body: fs.createReadStream(filepath)
    };
    var service = google.drive('v3');
    service.files.create({
       resource: fileMetadata,
       media: media,
       auth: auth,
       fields: 'id'
    }, function(err, file) {
      if(err) {
        // Handle error
        console.log(err);
      } else {
        console.log('File Id:' , file.id);
      }
    });
}

/**
 * Delete a file.
 *
 * @param {String} file Drive File instance's ID.
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function deleteFile(fileid, auth) {
    var fileId = fileid;
    var service = google.drive('v2');
    service.files.delete({
       fileId: fileId,
       auth: auth
    })
    .on('end', function() {
      console.log('Done');
    })
    .on('error', function(err) {
      console.log('Error during deletion', err);
    });
}

/**
 * Callback function once authorization is completed.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */
function authorized_callback(auth) {
  console.log('You have been authorized');
  //Call required functions here
  listFiles(auth);
}

/* **************************************************************************** */
