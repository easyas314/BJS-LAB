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
		BJS_helper.countdown = 100000;
	},

	// simulate a time consuming operation
	wasteTime: function (ms){
		console.info("...i'm cooking for " + ms);
		let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
		console.info("...done cooking");
	},

	notificationReceived: function (notification, payload) {
		if (notification === "ALL_MODULES_STARTED") {

			//setTimeout(5000);
			BJS_helper.sendSocketNotification("BJSLAB_NOTIFICATION", {
				msg: "helper received ALL_MODULES_STARTED"
			});

		};
	},

	socketNotificationReceived: function(notification, payload){
		console.info("Helper received socketNotification: " + payload.msg);
		//BJS_helper.wasteTime(1000);
		BJS_helper.countdown--;
		BJS_helper.sendSocketNotification("BJSLAB_NOTIFICATION", "byte me " + BJS_helper.countdown + " times!")
	}

});

