
Template.popupContent.rendered = function() {
    var now = moment();
    Session.set("lastUsed", now.toString());
};


Template.popupContent.events({
    'click #naviga': function (event) {
        event.preventDefault();
        window.open(event.target.href, '_system');
        return false;
    }
});
