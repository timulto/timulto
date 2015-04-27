Fines = new Mongo.Collection("fines");
Administrators = new Mongo.Collection("administrators");

function isAdministrator() {
    var username = "";
        
    if(Meteor.user()) {
        if( Meteor.user().services.facebook ) {
            username = Meteor.user().services.facebook.name;
        }
        else if( Meteor.user().services.twitter ) {
            username = Meteor.user().services.twitter.screenName;
        }
        //console.log(username);
    }

    var userAdm = Administrators.findOne({username:username});

    if(!userAdm) {
       return false;
    } else {
        return true;
    }
};

Meteor.methods({
    isOwner:function(fineId){
        if(Meteor.userId()) {
            var userId = Meteor.userId();

            var owner = Fines.findOne(fineId,{fields:{"owner":1}})
            if(owner) {
                owner = owner.owner;
                console.log("owner: "+ owner + " compared to current "+userId);
                
                return (owner == userId);
            }
        }
        
        return false;
    },
    isAdministrator:function(){
        return isAdministrator();
    },
    "saveFine": function (text, address, lat, lng, category, imageData) {
        // Make sure the user is logged in before inserting a task
        if (! Meteor.userId()) {
          throw new Meteor.Error("not-authorized");
        }

        Fines.insert({
          text: text,
          address: address,
//          lat: lat,
//          lng: lng,
          loc:{type:"Point",coordinates:[parseFloat(lng),parseFloat(lat)]},
          category: category,
          approved:0,
          imageData: imageData,
          owner: Meteor.userId(),
          username: Meteor.user().profile.name,
          createdAt: new Date() // current time
        });

    },
    approveFine: function(fineId) {
        
        if(isAdministrator()) {
            Fines.update({"_id":fineId},{$set:{"approved":1}});
        } else {
             console.log("User is not an administrator: "+ JSON.stringify(Meteor.user().profile.name));
        }
    },
    deleteFine: function (fineId) {//TODO da aggiungere la logica che controlla se l'utente è admin o l'utente corrente "possiede" il fine

        if(isAdministrator()) { //Se amministratore, è possibile rimuovere la segnalazione
            Fines.remove(fineId);
        } else{
            var res = Fines.findOne(fineId);
            
            if(res && res.owner == Meteor.userId()) {//se l'utente corrente ha creato la segnalazione può anche rimuoverla
                Fines.remove(fineId);
            } else {
                console.log("User is not an administrator and does not own the fine: "+ JSON.stringify(Meteor.user().profile.name));
            }
        }
    },
    setChecked: function (fineId, setChecked) {
        //Fines.update(taskId, { $set: { checked: setChecked} });
    },
    findNearUserFine: function(orderbydate, latitude, longitude, minDistance, maxDistance) {
        //Con la seguente query vengono restituite tutte le segnalazioni in prossimità delle coordinate specificate e che siano approved=1 se di altri utenti, o anche approved=0 se sono dell'utente corrente. La discriminante più forte è la vicinanza che potrebbe non includere le segnalazioni dell'utente corrente
        console.log("Calling findNearUserFine. Lat:" + latitude + " parsed " +parseFloat(latitude)+
                    ",lon:"+longitude+" parsed " +parseFloat(longitude)+
                    ", maxD:"+maxDistance+" minD:"+minDistance);
        
        var cursor = Fines.find({
            loc:{
                $near:{
                    $geometry:{
                        type:"Point",
                        coordinates:[parseFloat(longitude),parseFloat(latitude) ]
                    },
                    $minDistance:parseFloat(minDistance),
                    $maxDistance:parseFloat(maxDistance),
                    }
                }
        },
            {_id:1});
        
        var finalResult = new Array();
        var curEl = null;
        var currentUsername = Meteor.userId()?  Meteor.user().profile.name:"";

        if(cursor){
            cursor.forEach(function (doc) {
//                console.log(doc._id + ":" + doc.createdAt);

                curEl = Fines.findOne({_id:doc._id});
                console.log(curEl._id+":"+curEl.createdAt+", user:"+curEl.username+",approved:"+curEl.approved);
                if(curEl && ((curEl.approved == 1 ) || curEl.username ==  currentUsername)){
                    finalResult.push(curEl);
                }
            });
        }
        
        if(finalResult.length>1 && orderbydate==true){
                finalResult.sort(function(a, b){
                    var keyA = new Date(a.createdAt),
                    keyB = new Date(b.createdAt);
                    // Compare the 2 dates
                    if(keyA < keyB) return 1;
                    if(keyA > keyB) return -1;
                    return 0;
                });
            }
        
        return finalResult;
    },
    findLatestFines: function() {
        var cursor = Fines.find({},{ sort:{createdAt:-1}});
        
        var finalResult = new Array();
        var curEl = null;
        var currentUsername = Meteor.userId()?  Meteor.user().profile.name:"";

        if(cursor){
            cursor.forEach(function (doc) {
//                console.log(doc._id + ":" + doc.createdAt);

                curEl = Fines.findOne({_id:doc._id});
                console.log(curEl._id+":"+curEl.createdAt+", user:"+curEl.username+",approved:"+curEl.approved);
                if(curEl && ((curEl.approved == 1 ) || curEl.username ==  currentUsername)){
                    finalResult.push(curEl);
                }
            });
        }
        
        return finalResult;
    },
    findFinesByApproval: function(approved) {//TODO da aggiungere la logica che controlla se l'utente è admin
        var filter = 1;
        
        if(approved == false || approved == 0) {
            filter = 0;
        }
        var cursor = Fines.find({approved:filter},{ sort:{createdAt:1}});
        
        var finalResult = new Array();
//        var curEl = null;
//        var currentUsername = Meteor.user()?  Meteor.user().profile.name:"";

        if(cursor){
            cursor.forEach(function (doc) {
//                console.log("Not approved--> "+ doc._id + ":" + doc.createdAt+"."+doc.approved);
                finalResult.push(doc);
            });
        }
        
        return finalResult;
    },
});

if(Meteor.isCordova){
    Meteor.startup(function(){
        document.addEventListener("backbutton", function() {
            if (document.location.pathname == "/"){
                navigator.app.exitApp();
            } else {
                history.go(-1)
            }
        });

        window.onpopstate = function () {
            if (history.state && history.state.initial === true){
                navigator.app.exitApp();

                //or to suspend meteor add cordova:org.android.tools.suspend@0.1.2
                //window.plugins.Suspend.suspendApp();
            }
        };
    });
}
