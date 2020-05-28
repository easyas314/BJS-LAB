//  BJS-lab.js

// ideas:
// https://forum.magicmirror.builders/topic/8534/head-first-developing-mm-module-for-extreme-beginners

// MM wide helper method for modules
// See https://docs.magicmirror.builders/development/helper-methods.html#module-selection
// MM.getModules()

Module.register("BJS-lab", {
	requiresVersion: "2.11.0",

	// Default module config. Override with main config.js
	defaults: {
		labName: "BJS-WX-Lab",
		// also defaults for the helper code??
		base_url: "https://api.weather.gov",
		lat: 34.844740, //REQUIRED
		lon: -82.394430, //REQUIRED
		initialLoadDelay: 1000, // .5 sec
		retryDelay: 2500, // 2.5 sec
		updateInterval: 900000, // 15 min
	},

	// Further methods available; and not necessarily needing subclassing ...

	// init() -- typically not subclassed

	// called when a module is loaded; subsequent modules in the config are not yet loaded
	// The callback function MUST be called when the module is done loading
	// ... most cases do not need to subclass this
	loaded: function(callback) {
		//this.finishLoading();
		Log.log(`${this.name} module is loaded!`);
		callback();
	},

	// ... after module initialization, these are available:
	// this.name (str) name of the module
	// this.identifier (str) uniq id for module instance
	// this.hidden (boolean) represents if the module is currently hidden; aka faded away
	// this.config (list) user's config.js entries for the module; includes defaults not overwritten
	// this.data (object) containing metadata about the module instance:
	//		data.classes -- classes which are added to module dom wrapper
	//		data.file -- filename of the core module file
	//		data.path -- path of the module folder
	//		data.header -- the header added to the module
	//		data.position -- position in which the instance will be shown

	// called after all modules loaded; dom object not yet created; perfect place to define any
	//	additional module properties
	start: function(){
		Log.log(`${this.name} module start() called`);

		// initialize key module variables
		this.count = 0;
		this.theList = [];
		this.labdata = {msg: ":-)", fore: {}, hourly: {}};
		this.config.wxForecastGridURL = "no GRID URL";
		this.sendSocketNotification("INIT", this.config);
	},

	// The getScripts method is called to request any additional scripts that need to be loaded.
	// This method should therefore return an array with strings. If you want to return a full path
	// to a file in the module folder, use the this.file('filename.js') method. In all cases the
	// loader will only load a file once. It even checks if the file is available in the default
	// vendor folder.
	getScripts: function() {
		return [
			"moment.js",
		];
	},

	// just like scripts, but for styles
	getStyles: function() {
		return [
			"font-awesome.css",
		];
	},

	// The getTranslations method is called to request translation files that need to be loaded.
	// This method should therefore return a dictionary with the files to load, identified by the
	// country's short name.
	//		If the module does not have any module specific translations, the function can just be
	// omitted or return false.
	getTranslations: function() {
		return false; // { en: "translations/en.json", de: "translations/de.json" }
	},

	// Schedule next update
	scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}

		var self = this;
		setTimeout(function() {
			self.sendSocketNotification("WX_FORECAST_GET", self.config);
		}, nextLoad);
	},

	// handle system wide notifications

	// Note: the system sends three notifications when starting up. These notifications could come
	// in handy!
	// ALL_MODULES_STARTED - All modules are started. You can now send notifications to other modules.
	// DOM_OBJECTS_CREATED - All dom objects are created. The system is now ready to perform visual changes.
	// MODULE_DOM_CREATED - This module's dom has been fully loaded. You can now access your
	//						 module's dom objects.
	notificationReceived: function(notification, payload, sender) {
		// lets be noisy and log these
		if (sender) {
			if (sender.name != "clock") {
				Log.log(`${this.name} module notificationReceived: ${notification} from sender: ${sender.name}`);
			}
		} else {
			Log.log(`${this.name} module system notification received: ${notification}`);
		}

		// take action based on the notification
		switch(notification) {

		  case "MODULE_DOM_CREATED":
			// notify my helper to start
			// this.sendSocketNotification("START");
			break;

		  case "ALL_MODULES_STARTED":
			// this will send all other modules this notification
			this.sendNotification("BJS-LAB-ALIVE!", {msg:"any object for payload"});
			break;

		}
	},

	// Called whenever updating screen. If not subclassed, return user's configured header:
	// NOTE: If the user did not configure a default header, no header will be displayed and
	// thus this method will not be called.
	getHeader: function() {
		return this.data.header + " (it's awesome)";
	},

	processWX: function(data) {
		// process wx data
		// if (!data.properties || !data.properties.forecastGridData) {
		//if (!data || !data.hours || typeof data.hours[0].time === "undefined") {
		if (!data || !data.properties) {
			Log.error(this.name + ": Did not receive usable data.");
			return;
		} else {
			Log.info(`${this.name} : updated ${data.properties.updateTime}`);
			var elem = document.getElementById("target1");
			this.labdata.msg = data.properties.updateTime;
			this.labdata.fore = data.properties;
		}

		// this.updateDom(speed) -- when the module needs to be updated, call this. If speed is defined,
		// 					content update will be animated, but only if the content will really change.
		//this.updateDom(this.config.animationSpeed);
		this.updateDom();
		this.scheduleUpdate(this.config.updateInterval);
	},

	// Whenever MM needs to update the screen; start or refresh
	// 	... module asks for refresh via this.updateDom()
	getDom: function() {
		var wrapper = document.createElement("div");
		wrapper.className = "bjsContent";

		// make a bold H2 element with the labName as the content & add to this division
		var h2 = document.createElement("h2");
		h2.innerHTML = this.config.labName;
		wrapper.appendChild(h2);

		// make another element & add to this division
		var element = document.createElement("p");
		element.innerHTML = this.config.wxForecastGridURL;
		wrapper.appendChild(element);

		// make another element & add to this division
		var element = document.createElement("p");
		element.innerHTML = this.labdata.msg;
		element.id = "target1";
		wrapper.appendChild(element);

		return wrapper;
	},

	// When using a node_helper, the node helper can send your module notifications. When this
	// module is called, it has 2 arguments:
	//		notification - String - The notification identifier.
	//		payload - AnyType - The payload of a notification.
	// Note 1: When a node helper sends a notification, all modules of that module type receive
	//		 the same notifications.
	// Note 2: The socket connection is established as soon as the module sends its first message
	//		 using sendSocketNotification.
	socketNotificationReceived: function(notification, payload){
		Log.info(`[${this.config.labName}]:socketNoteRcvd() notification=${notification}`);
		switch(notification) {
		  case "INIT_DONE":
			  // payload should have the points json
			  Log.log(`[${this.config.labName}]:socketNoteRcvd() payload... =${payload.properties.forecastGridData}`);
    		  this.config.wxForecastGridURL = payload.properties.forecastGridData;
			  this.updateDom();
			  this.scheduleUpdate(this.config.initialLoadDelay);
			  break;
		  case "WX_DATA":
			// payload should have json body
			// this.labdata = payload;
			this.processWX(payload);
			break;
		}
	},

	// other module instance methods
	// see https://docs.magicmirror.builders/development/core-module-file.html#module-instance-methods

	// this.suspend() and this.resume() -- actions related to module.hide() and module.show()
	// this.hide(speed, callback, options)
	// this.show(speed, callback, options)

	// this.translate(identifier, variables)
});
