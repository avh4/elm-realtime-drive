Elm.Native.Google = Elm.Native.Google || {};
Elm.Native.Google.make = function(elm) {
  'use strict';

  elm.Native = elm.Native || {};
  elm.Native.Google = elm.Native.Google || {};
  if (elm.Native.Google.values) return elm.Native.Google.values;

  // Imports
  var Signal = Elm.Native.Signal.make(elm); // TODO: can we use Elm.Signal instead of Native?
  var List = Elm.Native.List.make(elm);

  // TODO: these should be per-client
  var stateSignal = Signal.constant({ ctor: "Initializing" });
  var authorizeChannel = Signal.input({ctor: "_Tuple0" });

  // /**
  //  * Creates a new Authorizer from the options.
  //  * @constructor
  //  * @param options {Object} for authorizer. Two keys are required as mandatory, these are:
  //  *
  //  *    1. "clientId", the Client ID from the console
  //  */
  // rtclient.Authorizer = function(options) {
  //   this.clientId = rtclient.getOption(options, 'clientId');
  //   // Get the user ID if it's available in the state query parameter.
  //   this.userId = rtclient.params['userId'];
  // }

  // /**
  //  * Fetch the user ID using the UserInfo API and save it locally.
  //  * @param callback {Function} the callback to call after user ID has been
  //  *     fetched.
  //  */
  // rtclient.Authorizer.prototype.fetchUserId = function(callback) {
  //   var _this = this;
  //   gapi.client.load('oauth2', 'v2', function() {
  //     gapi.client.oauth2.userinfo.get().execute(function(resp) {
  //       if (resp.id) {
  //         _this.userId = resp.id;
  //       }
  //       if (callback) {
  //         callback();
  //       }
  //     });
  //   });
  // };

  function client(clientId, module) {
    var scopes = module.scopes;
    var userId = undefined;
    var immediateHasFailed = false;

    console.log("*** module", module);

    function start() {
      gapi.load('auth:client,drive-realtime,drive-share', authorize);
    }

    function tryAuth(immediate) {
      var options = {
        client_id: clientId,
        scope: scopes,
        user_id: userId,
        immediate: immediate
      };
      console.log("elm-realtime-drive", "Authorizing", options);
      gapi.auth.authorize(options, handleAuthResult);
    }

    function authorize() {
      if (!immediateHasFailed) {
        tryAuth(true);
      } else {
        tryAuth(false);
      }
    }

    function handleAuthResult(result) {
      if (result && !result.error) {
        console.log("elm-realtime-drive", "Authorized successfully", result);
        elm.notify(stateSignal.id, {ctor: "Authenticated"});
        onAuthComplete();
      } else {
        console.log('elm-realtime-drive', 'Auth failure', result);
        elm.notify(stateSignal.id, {ctor: "ReadyToAuthenticate"});
        immediateHasFailed = true;
      }
    }

    function onAuthComplete() {
      module.onAuthComplete();
    }

    function authClickHandler(unit) {
      console.log("Requested auth", stateSignal.value);
      if (stateSignal.value.ctor == 'ReadyToAuthenticate') {
        console.log("elm-realtime-drive: Authenticating...");
        authorize();
      } else {
        console.log("elm-realtime-drive: Auth was requested, but current state is " + stateSignal.value.ctor);
      }
    };

    A2( Signal.map, authClickHandler, authorizeChannel);

    start();

    return {
      authorize: authorizeChannel,
      state: stateSignal,
      subscribe: module.signal
    };
  }

  return elm.Native.Google.values = {
    client: F2(client)
  };
};
