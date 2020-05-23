//  node_helper.js

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
		// this.name already avail? What is it for a node_helper?
		this.wxForecastGridURL = "";
		this.wxData = [];
		console.log(`[${this.name}]:start() completed.`);
	},

	getWxGrid: function(config) {
		console.log(`[${this.name}]:getWxGrid()`);
		//	You can retrieve the metadata for a given latitude/longitude coordinate with the /points endpoint (https://api.weather.gov/points/{lat},{lon}).
		// 		base_url: "https://api.weather.gov",
		var wxPointsURL = config.base_url + "/points/" + config.lat + "," + config.lon;
		//var pointsEndpoint = "points/" + config.lat + "," + config.lon;
		console.log(`[${this.name}]:getWxGrid() calling = ${wxPointsURL}`);
		this.fetchData(wxPointsURL)
			.then(data => {
				if (!data || !data.properties || !data.properties.forecastGridData) {
					// Did not receive usable new data.
					// Maybe this needs a better check?
					return;
				}
				//	headers: {"User-Agent": "MM-wx-gov/0.1 suowwisq@gmail.com"}

				//console.log(`[${this.name}]:getWxGrid() returned type = ${typeof(body)}`);
				// body contains text, so make it a json object

				// when the body OBJECT version is examined, it has PassThrough, etc ???
				//console.log(`[${this.name}]:getWxGrid() ---- body --------------------`);
				//console.log(util.inspect(body, false, 1, true /* enable colors */))

				//farkle = JSON.parse(body);
				// NOW it looks to follow the json output from the url in a browser...
        		//console.log(`[${this.name}]:getWxGrid() ---- farkle.properties --------------------`);
				//console.log(util.inspect(farkle.properties, false, 2, true /* enable colors */))
				//  The forecastGridData property will provide a link to the correct gridpoint for that location.
				this.wxForecastGridURL = data.properties.forecastGridData;
				console.log(`[${this.name}] wx-grid-url is ${this.wxForecastGridURL}`);
				this.sendSocketNotification("WX_GRIDPOINT_GET",
					//{msg: `The next hour is:\n${wxData.hourly.properties.periods[0].shortForecast}`
					{msg: "No wx data inspected yet."
						, config: {wxForecastGridURL: this.wxForecastGridURL}
					} );
			})
			.catch(function(request) {
				Log.error("Could not load data ... ", request);
			})
			.finally(() => this.updateAvailable());
	},

	updateAvailable: function() {
		//this.delegate.updateAvailable(this);
		console.log(`[${this.name}] WX UPDATE AVAILABLE!`);
	},

	// simulate a time consuming operation
	wasteTime: function (ms){
		console.info("...i'm cooking for " + ms);
		let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
		console.info("...done cooking");
	},

	notificationReceived: function (notification, payload) {
		console.log(`[${this.name}] received: ${notification}`);
	},

	// socket established as soon as module sends its first message via sendSocketNotification
	socketNotificationReceived: function(notification, payload){
		console.log(`[${this.name}]:socketNoteRcvd()`);
		switch(notification) {
		  case "WX_INIT_GRIDPOINT":
			// payload should be the module config{}
			console.log(`[${this.name}] received WX_INIT_GRIDPOINT`);
			this.getWxGrid(payload.config);
			break;

		  case "WX_FORECAST_GET":
			// payload should have .msg and .config{}
			console.log(`[${this.name}] received WX_FORECAST_GET: payload msg = ${payload.msg}`);
			console.log(`[${this.name}] ... wxForecastGridURL = ${this.wxForecastGridURL}`);
			if (this.wxForecastGridURL === "") {
				this.getWxGrid(payload.config);
			}

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

	// A convenience function to make requests. It returns a promise.
	fetchData: function(url, method = "GET", data = null) {
		return new Promise(function(resolve, reject) {
			var request = new XMLHttpRequest();
			request.open(method, url, true);
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

