//  BJS-lab.js

// ideas:
// https://forum.magicmirror.builders/topic/8534/head-first-developing-mm-module-for-extreme-beginners

var bjsLab;

Module.register("BJS-lab", {
	// Default module config. Over ride with main config.js
	defaults: {
		labName: "The BJS Lab",
		workInterval: 5000,
		// also defaults for the helper code??
		base_url: "https://api.weather.gov",
		lat: 34.844740, //REQUIRED
		lon: -82.394430, //REQUIRED
		updateInterval: 900000, // 15 min
	},

	start: function(){
		bjsLab = this;
		Log.log("Started module: " + bjsLab.name);

		// initialize key module variables
		bjsLab.count = 0;
		bjsLab.theList = [];

	},

	// handle system wide notifications
	notificationReceived: function(notification, payload, sender) {
		switch(notification) {
		  case "DOM_OBJECTS_CREATED":
			// sent 1st time all module objects have been rendered

			// try notifying my helper
			//bjsLab.sendSocketNotification("BJSLAB_NOTIFICATION", {msg : "BJS main start"});

			var timer = setInterval(()=>{
				bjsLab.sendSocketNotification("BJSLAB_NOTIFICATION", {msg : "more sugar"});
				bjsLab.count++;
			}, bjsLab.config.workInterval);
			break;
		}
	},

	// UI: Override dom generator.
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "bjsContent";

		// make a bold H1 element with the labName as the content & add to this division
		var h1 = document.createElement("h1");
		h1.innerHTML = bjsLab.config.labName;
		wrapper.appendChild(h1);

		// make another element & add to this division
		var element = document.createElement("p");
		element.innerHTML = "... addnl content ... count = " + bjsLab.count;
		element.id = "ADDNL";
		wrapper.appendChild(element);

		return wrapper;
	},

	// receive from my helper
	socketNotificationReceived: function(notification, payload){
		if (notification === "BJSLAB_NOTIFICATION") {
			var elem = document.getElementById("ADDNL");
      		elem.innerHTML = payload;
			bjsLab.updateDom();
		};
	},

});
