//  BJS-lab.js

var bjsLab;

Module.register("BJS-lab", {
	// Default module config.
	defaults: {
		text: "The BJS Lab"
	},

	start: function(){
		bjsLab = this;
		Log.info("Started Module: " + bjsLab.name);
 
		bjsLab.sendSocketNotification("BJSLAB_NOTIFICATION", {});
	},

	socketNotificationReceived: function(notification, payload){
		Log.info("Helper Recieved notification: " + notification);
	},

	// UI: Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	},
});
