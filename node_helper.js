//  node_helper.js

var NodeHelper = require("node_helper");
var BJS_helper;

module.exports = NodeHelper.create({

	defaults: {
	},

	start: function(){
		BJS_helper = this;
		//Log.info("Started Module: " + BJS_helper.name);
		console.info("Started helper module: " + BJS_helper.name);
	},

	// simulate a time consuming operation
	wasteTime: function(callback){
		console.info("...i'm cooking...");
		BJS_helper.sendSocketNotification("BJSLAB_NOTIFICATION", {
			msg: "helper is still cooking"
		});
    	setTimeout(callback,5000);
	},

	notificationReceived: function (notification, payload) {
		if (notification === "ALL_MODULES_STARTED") {

			setTimeout(5000);
			BJS_helper.sendSocketNotification("BJSLAB_NOTIFICATION", {
				msg: "helper received ALL_MODULES_STARTED"
			});

			setTimeout(5000);
			BJS_helper.sendSocketNotification("BJSLAB_NOTIFICATION", {
				msg: "helper waited for 5000"
			});
			wasteTime(notificationReceived);
		};
	},

	socketNotificationReceived: function(notification, payload){
		console.info("Helper received socketNotification: " + payload.msg);
	}

});

