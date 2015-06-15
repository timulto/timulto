
// see: https://hackpad.com/ep/pad/static/eYpMUtMSy29

Push = {
    // see https://github.com/phonegap-build/PushPlugin
    onNotificationGCM: function(e) { // android
    // <-- this has to be global, see https://github.com/phonegap-build/PushPlugin/issues/380
        switch (e.event) {
            case 'registered':
                if (e.regid.length > 0) {
                    alert('[REGISTRATION] Registration id = ' + e.regid);
                    Session.set("registrationId", e.regid);
                };
                break;
            case 'message':
                // if this flag is set, this notification happened while we were in the foreground.
                // you might want to play a sound to get the user's attention, throw up a dialog, etc.
                if ( e.foreground ) {
                    alert("[MESSAGE] foreground " + e.payload.title + ": " + e.payload.message + " count=" + e.payload.msgcnt);
                } else {  // otherwise we were launched because the user touched a notification in the notification tray.
                    if ( e.coldstart ) {
                        alert("[MESSAGE] coldstart " + e.payload.title + ": " + e.payload.message + " count=" + e.payload.msgcnt);
                    } else {
                        alert("[MESSAGE] background " + e.payload.title + ": " + e.payload.message + " count=" + e.payload.msgcnt);
                    }
                }
                break;
            case 'error':
                alert("[ERROR] " + e.msg );
                break;
            default:
                alert("[UNKNOWN]");
                break;
        }
    },
    onNotificationApple: function (event) {
        if ( event.alert ) {
            navigator.notification.alert(event.alert);
        }
        if ( event.sound ) {
            var snd = new Media(event.sound);
            snd.play();
        }
        if ( event.badge ) {
            pushNotification.setApplicationIconBadgeNumber(successHandler, errorHandler, event.badge);
        }
    }

}

if (Meteor.isCordova) {
    Meteor.startup(function() {
        document.addEventListener("deviceready", function() {
            try {
                if ( device.platform == 'android' || device.platform == 'Android' || device.platform == "amazon-fireos" ){
                    pushNotification = window.plugins.pushNotification;
                    pushNotification.unregister(successHandler, errorHandler);
                    pushNotification.register(
                        successHandler,
                        errorHandler, {
                            "senderID": "190071353423", // <-- this is the project number from the google developer console
                            "ecb": "Push.onNotificationGCM"
                        }
                    );
                    function successHandler(data) {
                        console.log("SUCCESS: " + JSON.stringify(data));
                    }
                    function errorHandler(e) {
                        alert("Errore di registrazione: " + e);
                    }
                } else if ( device.platform == 'blackberry10'){
                    // not supported - does it even exist anymore?!
                } else {
                    pushNotification.register(
                    tokenHandler,
                    errorHandler,
                    {
                        "badge":"true",
                        "sound":"true",
                        "alert":"true",
                        "ecb": "Push.onNotificationApple"
                    });
                }
            } catch (ex) {
                // noop
            }
        });
    });
}
