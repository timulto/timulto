if (!Meteor.isCordova) {    // legacy: needed?
    Router.route('/app', function () {
        console.log("web/segnalazioni-app");
        GAnalytics.pageview("/web/segnalazioni-app");
        this.render('segnalazioni');
    });
    // end legacy

    Router.route('/web/home', function () {
        GAnalytics.pageview("/web/home");
        console.log("home page");
        this.render('webhomepage', {
                        data: {
                            tab: "home",
                            title: "TiMulto!",
                            summary: "Con TiMulto!, ovunque tu sia, puoi segnalare un'infrazione o mettere un \"Mi Piace\" alle segnalazioni di altri utenti per confermarne la veridicità."
                        }
                    });

        document.title = "Home - TiMulto!"
        Session.set("dettaglio-web", undefined);
        Web.showTab("home");
        Web.positionLogo();
    });

    Router.route('/web/chisiamo', function () {
        GAnalytics.pageview("/web/chisiamo");
        console.log("segnalazioni web");
        this.render('webhomepage', {data: { tab: "chisiamo"} });
        document.title = "Chi siamo - TiMulto!"
        Web.showTab("chisiamo");
        Web.positionLogo();
    });

    Router.route('/web/contattaci', function () {
        GAnalytics.pageview("/web/contattaci");
        console.log("contattaci web");
        this.render('webhomepage', {data: { tab: "contattaci"} });
        document.title = "Contattaci - TiMulto!"
        Web.showTab("contattaci");
        Web.positionLogo();
    });

    Router.route('/web/terminidiservizio', function () {
        GAnalytics.pageview("/web/terminidiservizio");
        console.log("terminidiservizio web");
        this.render('webhomepage', {data: { tab: "terminidiservizio"} });
        document.title = "Termini di servizio - TiMulto!"
        Web.showTab("terminidiservizio");
        Web.positionLogo();
    });

    Router.route('/web/segnalazione', function () {
        GAnalytics.pageview("/web/segnalazione");
        var fine = Common.getFineIncludingHistory(this.params.query._id);
        document.title = "Segnalazione " + fine.address + " - TiMulto!"
        Session.set("dettaglio-web", fine);
        this.render('webhomepage', { data: { tab: "home", fineToShow: fine } });
        Web.positionLogo();
    });

}
