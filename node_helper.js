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
			this.getWxGrid();
			break;

		  case "START":
			// no payload
			if (this.wxForecastGridURL == "") {
				//this.getWxGrid();
			}
			//this.startWx();
			break;

		  case "WX_INIT_GRIDPOINT":
			// payload should be the module config{}
			// this.getWxGrid(payload);
			break;

		  case "WX_FORECAST_GET":
			// payload should have .msg and .config{}
			//if data exists, return data
			//else ask for data
			// ? make 2 requests: 1 for regular (daily?) and 2 for hourly?  filterable reqst?
			// separate function for building out the data into 1 structure?
			// sent 1st time all module objects have been rendered

			// try notifying my module
			//this.sendSocketNotification("BJSLAB_NOTIFICATION", {msg : "BJS main start"});

			break;

		  case "WX_FORECAST_TEST":
			break;
		}
	},

	processWxGrid: function(pointsJSON) {
		// if (!pointsJSON.properties || !pointsJSON.properties.forecastGridData) {
		// 	// Did not receive usable new data.
		// 	// Maybe this needs a better check?
		// 	return;
		// }
    	config.wxForecastGridURL = pointsJSON.properties.forecastGridData;
    	console.log(`${this.name} helper] processWxGrid() ... gridURL = ${pointsJSON.properties.forecastGridData}`);
		this.sendSocketNotification("WX_INIT_GRIDPOINT_RET", pointsJSON.properties.forecastGridData);
		return;
	},

	getWxGrid: function() {
		var self = this;
		// this is called to get the NOAA gridpints json
		console.log(`[${self.name} helper]:getWxGrid() started`);
		//	You can retrieve the metadata for a given latitude/longitude coordinate with the /points endpoint (https://api.weather.gov/points/{lat},{lon}).
		// 		base_url: "https://api.weather.gov",
		var wxPointsURL = self.config.base_url + "/points/" + self.config.lat + "," + self.config.lon;
		fetch(wxPointsURL)
			.then(function (response) {
				if (response.status === 200) {
					return response.json();
				} else {
					console.log(`[${self.name} helper]:getWxGrid() sendSocket ERROR`);
					self.sendSocketNotification("ERROR", response.status)
				}
			})
			.then(function(body) {
				console.log(`[${self.name} helper]:getWxGrid() sendSocket WX_INIT_GRIDPOINT_RET`);
			 	self.sendSocketNotification("WX_INIT_GRIDPOINT_RET", body);
			})
			//.then(json => this.processWxGrid(json))
			// .then(function (myJson) {
			// 	this.config.wxForecastGridURL = myJson.properties.forecastGridData;
			// 	//sendSocketNotification("WX_INIT_GRIDPOINT_RET", this.config.wxForecastGridURL);
			// 	console.log(`[${this.name} helper]:getWxGrid() returned = ${this.config.wxForecastGridURL}`);
			// })
			.catch((error) => {
				console.error("Error:", error);
				//this.sendSocketNotification("ERROR", error.name);
			});
	},

	// this.callWxPoints(this.config, wxPointsURL, (notification, payload) => {
	// 	this.sendSocketNotification(notification, payload);
	// })
	callPointsURL: function(cfg, url, callback) {

	},

	updateAvailable: function() {
		//this.delegate.updateAvailable(this);
		console.log(`[${this.name} helper] WX UPDATE AVAILABLE!`);
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

	// A convenience function to make requests. It returns a promise.
	fetchData: function(url, method = "GET", data = null) {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			//request.open(method, url, true);
			request.open(method, url, false); // synchronous
			request.setRequestHeader("User-Agent", "MM-wx-gov/0.1 suowwisq@gmail.com");
			request.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status === 200) {
						resolve(JSON.parse(this.response));
					} else {
						reject(request);
					}
				}
			};
			request.send();
		});
	}
	// stop() -- really should gracefully close open connections, stop sub-process,etc

});

