//  BJS-lab.js

var bjsLab;

Module.register("BJS-lab", {
	// Default module config.
	defaults: {
		text: "The BJS Lab"
	},

	start: function(){
		bjsLab = this;
		Log.log("Started module: " + bjsLab.name);

		// send to my helper
		bjsLab.sendSocketNotification("BJSLAB_NOTIFICATION", {msg : "BJS main start"});
	},

	// receive from my helper
	socketNotificationReceived: function(notification, payload){
		if (notification === "BJSLAB_NOTIFICATION") {
			Log.log("BJS main recieved socketNotification: " + payload.msg);
		};
	},

	// UI: Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.innerHTML = this.config.text;
		return wrapper;
	},
});
