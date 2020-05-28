//  node_helper.js

const fetch = require("node-fetch");

// only 1 node_helper for all instances of a module type, so no default config
// available within the module; your task to send desired config from module to helper

//REQUIRED
var NodeHelper = require("node_helper");

console.log("Welcome to the WX-LAB node_helper.");
//var bjsHelper;

//var request = require("request");
// var moment = require("moment");
// var now = moment(); // this will get the current date & time.

console.log("... ready to export the WX-LAB node_helper methods...");

// REQUIRED: NodeHelper.create
module.exports = NodeHelper.create({
	// available instance properties
	// this.name (str) -- name of module
	// this.path (str) -- the path to the module
	// this.expressApp (express instance) -- link to express instance to define extra routes
	//		? module's /public folder
	// this.io (socket io instance) -- in case you need to do Socket.IO magic
	// requiresVersion

	// init() -- not usual to subclass

	// This method is called when all node helpers are loaded and the system is ready to boot up.
	// The start method is a perfect place to define any additional module properties
	start: function() {
		this.config = null;
		this.wxForecastGridURL = "";
		this.wxData = [];
		console.log(`[${this.name} helper]:start() completed.`);
	},

	// socket established as soon as module sends its first message via sendSocketNotification
	socketNotificationReceived: function(notification, payload){
		console.log(`[${this.name} helper]:socketNoteRcvd() ${notification}`);
		//console.log(`[${this.name} helper]:        base_url ${payload.base_url}`);
		switch(notification) {
		  case "INIT":
			// payload should be the module config{}
			this.config = payload;
			console.log(`[${this.name} helper]: Initialized.`);
			this.initWX();
			break;

		  case "START":
			// no payload
			if (this.wxForecastGridURL == "") {
				//this.initWX();
			}
			//this.startWx();
			break;

		  case "WX_FORECAST_GET":
			// payload should be the module config{}
			this.config = payload;
			console.log(`[${this.name} helper]: Initialized.`);
			this.getWxForecast();
			break;

		  case "WX_FORECAST_TEST":
			break;
		}
	},

	initWX: function() {
		var self = this;
		// this is called to get the NOAA gridpints json
		console.log(`[${self.name} helper]:initWX() started`);
		//	You can retrieve the metadata for a given latitude/longitude coordinate with the /points endpoint (https://api.weather.gov/points/{lat},{lon}).
		// 		base_url: "https://api.weather.gov",
		var wxURL = self.config.base_url + "/points/" + self.config.lat + "," + self.config.lon;
		fetch(wxURL)
			.then(function (response) {
				if (response.status === 200) {
					return response.json();
				} else {
					console.log(`[${self.name} helper]:initWX() sendSocket ERROR`);
					self.sendSocketNotification("ERROR", response.status)
				}
			})
			.then(function(body) {
				console.log(`[${self.name} helper]:initWX() sendSocket INIT_DONE`);
			 	self.sendSocketNotification("INIT_DONE", body);
			})
			.catch((error) => {
				console.error("Error:", error);
				//this.sendSocketNotification("ERROR", error.name);
			});
	},

	getWxForecast: function(hourly="") {
		var self = this;
		// this is called to get the NOAA forecast; which one?
		// ? make 2 requests: 1 for regular (daily?) and 2 for hourly?  filterable reqst?
		console.log(`[${self.name} helper]:getWxForecast() started`);
		var wxURL = self.config.wxForecastGridURL + "/forecast";
		fetch(wxURL)
			.then(function (response) {
				if (response.status === 200) {
					return response.json();
				} else {
					console.log(`[${self.name} helper]:getWxForecast() sendSocket ERROR`);
					self.sendSocketNotification("ERROR", response.status)
				}
			})
			.then(function(body) {
				console.log(`[${self.name} helper]:getWxForecast() sendSocket WX_DATA`);
				// variant for which endpoint?
				// pre-set payload.fore vs payload.hourly ? payload.type and payload.data ?
			 	self.sendSocketNotification("WX_DATA", body);
			})
			.catch((error) => {
				console.error("Error:", error);
				//this.sendSocketNotification("ERROR", error.name);
			});
	},

	// simulate a time consuming operation
	wasteTime: function (ms){
		console.info("...i'm cooking for " + ms);
		let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
		console.info("...done cooking");
	},

	notificationReceived: function (notification, payload) {
		console.log(`[${this.name} helper] received: ${notification}`);
	},

	// stop() -- really should gracefully close open connections, stop sub-process,etc

});

