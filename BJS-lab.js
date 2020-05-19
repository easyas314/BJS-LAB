//  BJS-lab.js

// ideas:
// https://forum.magicmirror.builders/topic/8534/head-first-developing-mm-module-for-extreme-beginners

var bjsLab;

Module.register("BJS-lab", {
	// Default module config. Over ride with main config.js
	defaults: {
		labName: "BJS-WX-Lab",
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
		bjsLab.data = {};

	},

	// handle system wide notifications
	notificationReceived: function(notification, payload, sender) {
		switch(notification) {
		  case "DOM_OBJECTS_CREATED":
			// sent 1st time all module objects have been rendered

			// try notifying my helper; 1 time gridpoint fetch
			bjsLab.sendSocketNotification("WX_INIT_GRIDPOINT", {config: this.config, msg: "hi!"});

			// var timer = setInterval(()=>{
			// 	bjsLab.sendSocketNotification("BJSLAB_NOTIFICATION", {msg : "more sugar"});
			// 	bjsLab.count++;
			// }, bjsLab.config.updateInterval);
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
		console.log(`[${bjsLab.config.labName}]:socketNoteRcvd()`);
		switch(notification) {
		  case "WX_GRIDPOINT_GET":
			// payload should have .msg and .config{}
			bjsLab.data = payload.config;
			var elem = document.getElementById("ADDNL");
			elem.innerHTML = bjsLab.data.wxForecastGridURL;
			bjsLab.updateDom();
			break;
		}
	},

});
