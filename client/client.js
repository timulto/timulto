var blank = "splash.png";
var photoTaken = false;
var help = new Array();


getUserLanguage = function () {
  // Put here the logic for determining the user language

  return "it";
};

function resetPicture() {
    photoTaken = false;
    Session.set("photo", blank);
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var imageObj = new Image();

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'white';
    context.fill();
    var photo = new Image();
    photo.onload = function() {
        if (photo.width < canvas.width) {
            context.drawImage(photo,
                (canvas.width - photo.width) / 2,
                (canvas.height - photo.height) / 2
            );
        } else {
            context.drawImage(photo,
                0,0,
                canvas.width,
                canvas.height
            );
        }
    };
    photo.src =  Session.get("photo");
}

function fitImageInCanvas(data, canvas) {
    var context = canvas.getContext('2d');
    var photo = new Image();
    photo.onload = function() {
        // canvas.width : x = photo.width : photo.height
        if (photo.width > photo.height) {
            var scaled = (canvas.width * photo.height) / photo.width;
            context.drawImage(photo,
                0,
                (canvas.height - scaled) / 2,
                canvas.width,
                scaled
            );
        } else {
            var scaled = (canvas.height * photo.width) / photo.height;
            context.drawImage(photo,
                (canvas.width - scaled) / 2,
                0,
                scaled,
                canvas.height
            );
        }
    };
    photo.src =  data;
}

function takePhoto() {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');

    MeteorCamera.getPicture({ width: 800, height: 600, correctOrientation: true }, function(error, data) {
        context.clearRect(0, 0, canvas.width, canvas.height);
        geocode();
        if (data) {
            photoTaken = true;
            fitImageInCanvas(data, canvas)
            Materialize.toast("Fai tap sulla foto per mascherare targhe e visi", 2000 , 'rounded');
            Materialize.toast("Completa la scheda e premi \"Multa\"", 3000 , 'rounded');
            Session.set("photo", data);
            $('body').scrollTop(0);
        } else {
            resetPicture();
        }
    });
}

function drawLogo(offsetX, offsetY) {
    var canvas = document.getElementById('canvas');
    var context = canvas.getContext('2d');
    var imageObj = new Image();
console.log("context:" + context);
    imageObj.onload = function() {
        var w = imageObj.width / 4;
        var h = imageObj.height / 4;
        context.drawImage(imageObj,
            offsetX - (w/2),
            offsetY - (h/2),
            w, h
        );
    };
    imageObj.src =  "icon.png";
}

function geocode() {
    try {
        var coords = Geolocation.latLng();
        if (coords.lat && coords.lng) {
            Meteor.call("reverseGeocode", coords.lat, coords.lng, function(error, results) {
                Session.set("address", results.address);
                Session.set("city", results.city);
            });
        }
    } catch(err) {
        console.log("error geocoding " + err.message);
    }
}

function initHelp() {
      help.push("Segnalare un'infrazione?");
      help.push("Attiva il GPS per abilitare la geolocalizzazione..");
      help.push("..Fai una foto alla presunta infrazione..");
      help.push("..Fai \"tap\" sulla foto per mascherare targhe e visi..");
      help.push("..Completa la scheda inserendo il tipo di segnalazione ed eventuali note..");
      help.push("..premi \"Multa\" ed è fatta!");
      

      Session.set("help",help);
      Session.set("currentHelp",0);

}
if (Meteor.isClient) {
  Meteor.subscribe("fines");
  Meteor.subscribe("userData");

  Meteor.startup(function(){
//      console.log(TAPi18n.getLanguage());
      TAPi18n.setLanguage(getUserLanguage())
      .done(function () {
        Session.set("showLoadingIndicator", false);
      })
      .fail(function (error_message) {
        // Handle the situation
        console.log(error_message);
      });
      
      
      $('select').material_select();
//      $(".button-collapse").sideNav();
//      $('.modal-trigger').leanModal();

      Session.set("foundfines",[]);
      Session.set("finesToApprove",[]);
      
      //T9n.setLanguage('it');//Set language
      
       Meteor.call("isAdministrator", function (error, result) {
            if (error) {
                console.log("Error occurred: " + error);
                Session.set("isadmin",false);
            }
            // console.log("check is administrator:"+result);
            Session.set("isadmin",result);
      });
  });
 
    
/////////////////////////////////////
////////////// Navbar ///////////////
Template.navbar.rendered = function(){
    $('.modal-trigger').leanModal();
    $('.button-collapse').sideNav(); 
    $('collapsible').collapsible();
    initHelp();
};
    
Template.navbar.helpers({
    helpMessage: function() {
         var help = "";
         if(Session.get("help") && Session.get("help").length> Session.get("currentHelp")){
            help = Session.get("help")[Session.get("currentHelp")];
         }
        return help; 
    }
});

Template.navbar.events({
    "click #showHelp": function (event) {
        event.preventDefault();

        var currentHelp = Session.get("currentHelp");

        if (currentHelp < Session.get("help").length - 1) {
            currentHelp++;
        } else {
            currentHelp = 0;
        }

        Session.set("currentHelp", currentHelp);
    },
    "click #closeHelp": function (event) {
        event.preventDefault();

        currentHelp=0;
        Session.set("currentHelp", currentHelp);
    },
   "click #loginNav": function() {
        event.preventDefault();
        $('.button-collapse').sideNav('hide');
    },
    "click #logout": function(event) {
        $('.button-collapse').sideNav('show');
    }
});
    
/////////////////////////////////////
////////////// Main /////////////////
    
    Template.main.rendered = function(){
        resetPicture();

    };
    
    Template.main.helpers({
        city:function() {
            return Session.get("city");
        },
        address: function () {
            return Session.get("address");
        }, description: function () {
            return Session.get("description");
        }, photo: function () {
            return Session.get("photo");
        }, loc: function () {
            return Geolocation.latLng() || {
                lat: 0,
                lng: 0
            };
        },
        screen_name: function() {
            if( Meteor.user().services.facebook ) {
                return Meteor.user().services.facebook.name;
            }
            else if( Meteor.user().services.twitter ) {
                return Meteor.user().services.twitter.screenName;
            }
        },
        user: function() {
        return Meteor.user().profile.name;
        },
        userName: function() {
            var user = Meteor.user().username;
            console.log(user);
            if(!user){
                user = Meteor.user().profile.name;
            }

            return user;
        }, fines: function() {
           return Fines.find({}, {sort: {createdAt: -1}});

        },
         helpMessage: function() {
             var help = "";
             if(Session.get("help") && Session.get("help").length> Session.get("currentHelp")){
                help = Session.get("help")[Session.get("currentHelp")];
             }
            return help; 
        },
        error: Geolocation.error
    });
    
    Template.main.events({
      "click #getScreenName":function(){
//        Meteor.call("getUserScreenName",function(err,res){
//            console.log("In client:" + JSON.stringify(res));
//        });
          console.log(Meteor.user().services.twitter.screenName);
          console.log(Meteor.user().services.twitter.profile_image_url);
      },
        "click #send": function (event) {
        event.preventDefault();
        var text = $("#description").val();
        var address = $("#address").val();
        var city = Session.get("city");
        var lat = $("#lat").val();
        var lng = $("#lng").val();
        var category = $("#category").val();
            if(!category){
                category = "4";
            }
        var canvas = document.getElementById('canvas');
        //var imageData = $("#imgdata").val();
        var imageData = canvas.toDataURL();

        Meteor.call("saveFine", text, address, city, lat, lng, category, imageData);

        // Clear form
/*
        Session.set("description", "");
        Session.set("photo", blank);
        Session.set("address", "");
*/
        $("#address").val("");
        $("#description").val("");
        $("#category").val("");
        $('select').material_select();
        $('body').scrollTop(0);
        Materialize.toast("Grazie per la segnalazione!", 3000 , 'rounded');
        resetPicture();

        // Prevent default form submit (just in case)
        return false;
    },
    "click #login": function() {
        /*$('.button-collapse').sideNav('show');*/
        $('#login-sign-in-link').click();
        /*$('#login-username').focus();*/
    },
    "click #loginNav": function() {
            event.preventDefault();
            $('.button-collapse').sideNav('hide');
    },
    "click #logout": function(event) {
            $('.button-collapse').sideNav('show');
    },   
    "click #shoot": function(event) {
            takePhoto();
    },
    "click #canvas": function (event) {
            if (!photoTaken) {
                takePhoto();
            } else {
                drawLogo(event.offsetX, event.offsetY);
            }
    }
    
});
    
/////////////////////////////////////
///////////// Body //////////////////
    
    Template.body.helpers({
     user: function() {
        return Meteor.user().profile.name;
     },
    userName: function() {
        var user = Meteor.user().username;
        console.log(user);
        if(!user){
            user = Meteor.user().profile.name;
        }
        
        return user;
    }, fines: function() {
       return Fines.find({}, {sort: {createdAt: -1}});
        
    },
     helpMessage: function() {
         var help = "";
         if(Session.get("help") && Session.get("help").length> Session.get("currentHelp")){
            help = Session.get("help")[Session.get("currentHelp")];
         }
        return help; 
    },
    error: Geolocation.error
  });

  Template.body.events({
    "click #login": function() {
        /*$('.button-collapse').sideNav('show');*/
        $('#login-sign-in-link').click();
        /*$('#login-username').focus();*/
    },
    "click #loginNav": function() {
        event.preventDefault();
        $('.button-collapse').sideNav('hide');
    },
    "click #logout": function(event) {
        $('.button-collapse').sideNav('show');
    },   
    "click #shoot": function(event) {
        takePhoto();
    },
    "click #canvas": function (event) {
        if (!photoTaken) {
            takePhoto();
        } else {
            drawLogo(event.offsetX, event.offsetY);
        }
    },

    "click #showHelp": function (event) {
        event.preventDefault();
       
        var currentHelp = Session.get("currentHelp");

        if(currentHelp < Session.get("help").length-1) {
            currentHelp++;
        }  else {
            currentHelp = 0;
        }
        
        Session.set("currentHelp", currentHelp);
      },
    "click #closeHelp": function (event) {
        event.preventDefault();
    
        currentHelp=0;
        Session.set("currentHelp", currentHelp);
      }
  });
    
/////////////////////////////////////
Template.fineDetails.helpers({
    username: function(){
        return Session.get("detailUsername");
    },
    text: function(){
        return Session.get("detailText");
    },
    address: function(){
        return Session.get("detailAddress");
    },
    category: function(){
        return Session.get("detailCategory");
    },
    imageData: function(){
        return Session.get("detailImageData");
    }
});
    
Template.fineToApprove.rendered = function() {
    if(Session.get("isadmin")) {
         $(".adminThumb").show();
    } else {
         $(".adminThumb").hide();
    }
    
    Meteor.call("isOwner", this.data._id, function (err, isOwner) {
        var isAdmin = Session.get("isadmin");
        if (err) {
            if(isAdmin) {
                $("#"+isOwner._id).show();
            }else{
                $("#"+isOwner._id).hide();
            }
        } else {
//                console.log(isOwner);
            if(isOwner.result || isAdmin) {
//                    console.log("Showing " + isOwner._id);
                $("#"+isOwner._id).show();
            } else {
//                    console.log("Hiding " + isOwner._id);
                $("#"+isOwner._id).hide();
            }
        }
    });
}

Template.fineToApprove.helpers({

    isadmin:function() {
        return Session.get("isadmin");
    }
});

Template.fineToApprove.events({
    "click .afine":function(){
        console.log("clicked " + this._id);
        Session.get("detailUsername");
        Session.get("detailText");
        Session.get("detailAddress");
        Session.get("detailCategory");
        Session.get("detailImageData");
        
        Router.go('/dettaglioSegnalazione');
    }
});

  Template.fine.events({
     "click .toggle-checked": function () {
        // Set the checked property to the opposite of its current value
        Tasks.update(this._id, {$set: {checked: ! this.checked}});
      },
      "click .delete": function () {
//    console.log("click .delete deleting:"+this._id);
        Meteor.call("deleteFine", this._id);
      }
  });
    

 //////////////////////////////////////////
 ///////////////// admin //////////////////
    
function startupAdmin() {//TODO forse è il caso di usare Tracker
    //Se admin restituisci tutti  i fine non approvati
    //Se utente normale restituisci tutti i fine dell'utente non ancora approvati
     Meteor.call("findFinesByApproval", false, function (error, result) {
        if (error || !result) {
            console.log("Error in searching not approved fines." + error);
//            Session.set("finesToApprove", []);
        } else {
//            console.log("not approved list:" + result.toString());
            Session.set("finesToApprove", result);
        }
    });
};
    
Template.admin.rendered = function() {
   startupAdmin();
};
    
Template.admin.helpers({
    finesToApprove: function() {
        return Session.get("finesToApprove");             
    }
});

Template.admin.events({
      "click .delete": function () {
//    console.log("click .delete deleting:"+this._id);
        Meteor.call("deleteFine", this._id, function(err){
            if(!err)
                startupAdmin();
        });
      },
        "click .thumb-up": function () {
//    console.log("click .delete deleting:"+this._id);
        Meteor.call("approveFine",this._id, function(err){
            startupAdmin();
        });
      }
});
    
    
    
 //////////////////////////////////////////
 
 //////////////////////////////////////////
 ////////// Ultime Segnalazioni ///////////
 
    Template.ultimeSegnalazioni.helpers({
        fines: function () {
            return Fines.find({}, {
                sort: {
                    createdAt: -1
                }
            });
        }
    }); 
    
 //////////////////////////////////////////
    
 //////////////////////////////////////////
 ///////// cercaSegnalazioni //////////////
Template.listaSegnalazioni.helpers({
    foundfines: function () {
        return Session.get("foundfines");
    }
});
    
Template.listaSegnalazioni.events({
"click #resetFines": function(event){
        event.preventDefault();
        
        Session.set("foundfines",[]);
    },
    "click #getFines":function(event) {
        event.preventDefault();
        var filter = $("input[type='radio'][name='group1']:checked").val();
        
        var coords = Geolocation.latLng();
//        var lat = $("#lat").val();
//        var lon = $("#lng").val();
        
        
        console.log("coords:" + JSON.stringify(coords));
        var maxD = $("#maxD").val()?$("#maxD").val():1000;
        var minD = $("#minD").val()?$("#minD").val():0;
        var lat = coords.lat;
        var lon = coords.lng;
        
        if(filter == "0"){ //all
            /* Fines più vicini ed ordinati per data */
            Meteor.call("findNearUserFine", true, lat, lon, minD,maxD, function(error,result) {
                if(error || !result) {
                    console.log("Error in searching fines." + error);
                    Session.set("foundfines",[]);
                }else {
                    console.log("found something.. " + result);
                    Session.set("foundfines",result);
                }
            });
         } else if (filter == "1") {//nearest. do not order by date
            Meteor.call("findNearUserFine", false, lat, lon, minD, maxD, function (error, result) {
                if (error || !result) {
                    console.log("Error in searching fines." + error);
                    Session.set("foundfines", []);
                }else {
                    Session.set("foundfines", result);
                }
            });    
         } else if (filter == "2") {//latest
            /* Fines più recenti */
            Meteor.call("findLatestFines", function(error,result) {
                if(error || !result) {
                    console.log("Error in searching fines." + error);
                    Session.set("foundfines",[]);
                } else {
                    Session.set("foundfines",result);
                }
            });
         }
    }
});
    //////////////////////////////////////////
    // At the bottom of the client code
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
  });

}
