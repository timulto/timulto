function imageUrl(){
    if (Session.get("dettaglio-web") == null) return null;
    return Session.get("rootUrl") + "api/image/" + Session.get("dettaglio-web")._id + "?v=" +  Session.get("dettaglio-web").version;
}

function iLikeThis(fine) {
    return fine.likes.indexOf(Meteor.userId()) >= 0 || fine.likes.indexOf(userUtils.getCurrentUsername()) >= 0;
}

Template.dettaglioWeb.helpers({
    imageUrl: function(){
        return imageUrl();
    },
    fineToShow: function() {
        return Session.get("dettaglio-web");
    },
    iLikeThis: function() {
        return iLikeThis(Session.get("dettaglio-web"));
    },
    iDontLikeThis: function() {
        return !iLikeThis(Session.get("dettaglio-web"));
    },
    thisUrl: function() {
        return location.href;
    },
    notApproved: function() {
        return !Session.get("dettaglio-web").approved;
    }
});

Template.dettaglioWeb.events({
    "click .approve": function(){
        Meteor.call("approveFine", Session.get("dettaglio-web")._id, true, function(err) {
            if(err) {
                Materialize.toast("Errore: " + err.message, 4000, 'rounded center');
            } else {
                Materialize.toast("Segnalazione approvata", 4000, 'rounded center');
            }
        });
        Session.set("dettaglio-web", undefined);
        Router.go("/web/home");
    },
    "click .delete": function(){
        Meteor.call("deleteFine", Session.get("dettaglio-web")._id, function(err) {
            if(err) {
                Materialize.toast("Errore: " + err.message, 4000, 'rounded center');
            } else {
                Materialize.toast("Segnalazione cancellata", 4000, 'rounded center');
            }
        });
        Session.set("dettaglio-web", undefined);
        Router.go("/web/home");
    },
    "click .mipiace": function () {
        if(userUtils.isLoggedIn()){
            Meteor.call("likeFine", Session.get("dettaglio-web")._id, true, function(err) {
                if(err) {
                    Materialize.toast("Errore: " + err.message, 4000, 'rounded center');
                } else {
                    Web.backToList();
                    Materialize.toast("+1 aggiunto :)", 4000, 'rounded center');
                }
            });
            GAnalytics.event("dettaglio","like");
        }
    },
    "click .nonmipiace": function () {
        if(userUtils.isLoggedIn()){
            Meteor.call("likeFine",Session.get("dettaglio-web")._id, false, function(err) {
                if(err) {
                    Materialize.toast("Errore: " + err.message, 4000, 'rounded center');
                } else {
                    Web.backToList();
                    Materialize.toast("+1 rimosso :(", 4000, 'rounded center');
                }
            });
            GAnalytics.event("dettaglio","dislike");
        }
    },
    "click .fb-share": function() {
        FB.ui({
          method: 'share_open_graph',
          action_type: 'og.likes',
          action_properties: JSON.stringify({
            object: Web.rootUrl() + "web/seo?_id=" + Session.get("dettaglio-web")._id /*location.href*/,
          })
        }, function(response){
          // Debug response (optional)
          console.log(response);
        });
        return false;
    }
    //,
//    "click #hideDettaglio": function(){
//        $('#lista').show();
//        $('#dettaglio').hide();
//    }
});

