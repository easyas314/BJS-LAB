//  node_helper.js

var NodeHelper = require("node_helper");
var BJS_helper;

module.exports = NodeHelper.create({

	defaults: {
	},

	start: function(){
		BJS_helper = this;
		//Log.info("Started Module: " + BJS_helper.name);
		console.info("Started Module: " + BJS_helper.name);
	},

	notificationReceived: function (notification, payload) {
		if (notification === "ALL_MODULES_STARTED") {
			BJS_helper.sendSocketNotification("BJSLAB_NOTIFICATION", {})
		};
	},

	socketNotificationReceived: function(notification, payload){
		console.info("Helper Received notification: " + notification);
	}

});

