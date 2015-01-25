Elm.Native.Google = Elm.Native.Google || {};
Elm.Native.Google.Drive = Elm.Native.Google.Drive || {};
Elm.Native.Google.Drive.Realtime = {};
Elm.Native.Google.Drive.Realtime.make = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  elm.Native.Google = elm.Native.Google || {};
  elm.Native.Google.Drive = elm.Native.Google.Drive || {};
  elm.Native.Google.Drive.Realtime = elm.Native.Google.Drive.Realtime || {};
  if (elm.Native.Google.Drive.Realtime.values) return elm.Native.Google.Drive.Realtime.values;

  // Imports
  var Signal = Elm.Native.Signal.make(elm); // TODO: can we use Elm.Signal instead of Native?

  // TODO: these should be per-client
  var stateSignal = Signal.constant({ ctor: "Initializing" });
  var authorizeChannel = Signal.input({ctor: "_Tuple0" });
  var modelSignal = Signal.constant({ ctor: "Nothing" });

  /**
   * OAuth 2.0 scope for installing Drive Apps.
   */
  var INSTALL_SCOPE = 'https://www.googleapis.com/auth/drive.install'

  /**
   * OAuth 2.0 scope for opening and creating files.
   */
  var FILE_SCOPE = 'https://www.googleapis.com/auth/drive.file'

  /**
   * Parses the hash parameters to this page and returns them as an object.
   */
  function getParams() {
    var params = {};
    var hashFragment = window.location.hash;
    if (hashFragment) {
      // split up the query string and store in an object
      var paramStrs = hashFragment.slice(1).split("&");
      for (var i = 0; i < paramStrs.length; i++) {
        var paramStr = paramStrs[i].split("=");
        params[paramStr[0]] = unescape(paramStr[1]);
      }
    }
    return params;
  }

  //
  //
  // /**
  //  * Fetches the metadata for a Realtime file.
  //  * @param fileId {string} the file to load metadata for.
  //  * @param callback {Function} the callback to be called on completion, with signature:
  //  *
  //  *    function onGetFileMetadata(file) {}
  //  *
  //  * where the file parameter is a Google Drive API file resource instance.
  //  */
  // rtclient.getFileMetadata = function(fileId, callback) {
  //   gapi.client.load('drive', 'v2', function() {
  //     gapi.client.drive.files.get({
  //       'fileId' : fileId
  //     }).execute(callback);
  //   });
  // }
  //

  function parseState(stateParam) {
    try {
      var stateObj = JSON.parse(stateParam);
      return stateObj;
    } catch(e) {
      return null;
    }
  }

  function model(initialModel) {
    var defaultTitle = "New Realtime Quickstart File";
    /**
     * The MIME type of newly created Drive Files. By default the application
     * specific MIME type will be used:
     *     application/vnd.google-apps.drive-sdk.
     */
    var newFileMimeType = null; // Using default


    /**
     * Loads or creates a Realtime file depending on the fileId and state query
     * parameters.
     */
    function load() {
      console.log(">>> Realtime.load", arguments);
      var params = getParams();
      console.log("   params:", params);
      var fileIds = params['fileIds'];
      if (fileIds) {
        fileIds = fileIds.split(',');
      }
      // var userId = this.authorizer.userId;
      var state = params['state'];

      if (fileIds) {
        for (var index in fileIds) {
          gapi.drive.realtime.load(fileIds[index], onFileLoaded, initializeModel, handleErrors);
        }
        return;
      }

      if (state) {
        var stateObj = parseState(state);
        if (stateObj.action == "open") {
          fileIds = stateObj.ids;
          // userId = stateObj.userId;
          redirectTo(fileIds);
          return;
        }
      }

      createNewFileAndRedirect();
    }

    /**
     * Creates a new file and redirects to the URL to load it.
     */
    function createNewFileAndRedirect() {
      console.log(">>> Realtime.createNewFileAndRedirect", arguments);
      var _this = this;
      gapi.client.load('drive', 'v2', function() {
        gapi.client.drive.files.insert({
          'resource': {
            mimeType: newFileMimeType,
            title: defaultTitle
          }
        }).execute(function(file) {
          if (file.id) {
            redirectTo([file.id]);
          } else {
            console.error('Error creating file.');
            console.error(file);
          }
        });
      });
    }

    function redirectTo(fileIds) {
      console.log(">>> Realtime.redirectTo", arguments);
      var params = [];
      if (fileIds) {
        params.push('fileIds=' + fileIds.join(','));
      }
      // if (userId) {
      //   params.push('userId=' + userId);
      // }

      var newUrl = params.length == 0 ? '#' : ('#' + params.join('&'));
      if (window.history && window.history.replaceState) {
        window.history.replaceState("Google Drive Realtime API Playground", "Google Drive Realtime API Playground", newUrl);
      } else {
        window.location.href = newUrl;
      }

      for (var index in fileIds) {
        gapi.drive.realtime.load(fileIds[index], onFileLoaded, initializeModel, handleErrors);
      }
    }

    function onFileLoaded(doc) {
      console.log(">>> Realtime.onFileLoaded", arguments);
      var string = doc.getModel().getRoot().get('text');

      // Keeping one box updated with a String binder.
      var textArea1 = document.getElementById('editor1');
      gapi.drive.realtime.databinding.bindString(string, textArea1);

      var updateSignal = function(e) {
        elm.notify(modelSignal.id, { ctor: "Just", _0: string.text });
      };
      string.addEventListener(gapi.drive.realtime.EventType.TEXT_INSERTED, updateSignal);
      string.addEventListener(gapi.drive.realtime.EventType.TEXT_DELETED, updateSignal);
      // textArea2.onkeyup = function() {
      //   string.setText(textArea2.value);
      // };
      updateSignal();

      // Enabling UI Elements.
      textArea1.disabled = false;

      // Add logic for undo button.
      var model = doc.getModel();
      var undoButton = document.getElementById('undoButton');
      var redoButton = document.getElementById('redoButton');

      undoButton.onclick = function(e) {
        model.undo();
      };
      redoButton.onclick = function(e) {
        model.redo();
      };

      // Add event handler for UndoRedoStateChanged events.
      var onUndoRedoStateChanged = function(e) {
        undoButton.disabled = !e.canUndo;
        redoButton.disabled = !e.canRedo;
      };
      model.addEventListener(gapi.drive.realtime.EventType.UNDO_REDO_STATE_CHANGED, onUndoRedoStateChanged);

    }

    function initializeModel(model) {
      console.log(">>> Realtime.initializeModel", arguments);
      var string = model.createString(initialModel);
      model.getRoot().set('text', string);
    }

    function handleErrors() {
      console.log(">>> Realtime.handleErrors", arguments);
      //   if(e.type == gapi.drive.realtime.ErrorType.TOKEN_REFRESH_REQUIRED) {
      //     authorizer.authorize();
      //   } else if(e.type == gapi.drive.realtime.ErrorType.CLIENT_ERROR) {
      //     alert("An Error happened: " + e.message);
      //     window.location.href= "/";
      //   } else if(e.type == gapi.drive.realtime.ErrorType.NOT_FOUND) {
      //     alert("The file was not found. It does not exist or you do not have read access to the file.");
      //     window.location.href= "/";
      //   }

    }

    return {
      scopes: [INSTALL_SCOPE, FILE_SCOPE],
      onAuthComplete: load,
      signal: modelSignal
    };
  }

  return elm.Native.Google.Drive.Realtime.values = {
    model: model
  };
};
