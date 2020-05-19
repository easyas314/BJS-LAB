//  node_helper.js

var NodeHelper = require("node_helper");
console.log("Welcome to the WX-LAB node_helper.");
//var bjsHelper;
//var request = require("request");
const got = require("got");
// var moment = require("moment");
// var now = moment(); // this will get the current date & time.

console.log("... ready to export the WX-LAB node_helper methods...");
module.exports = NodeHelper.create({
	// notice the name/value pair model ...
	start: function() {
		bjsHelper.name = "WX-HELPER";
		bjsHelper.wxForecastGridURL = "";
		bjsHelper.wxData = [];
		console.log(`[${bjsHelper.name}]:start() completed.`);
	},

	getWxGrid: function(config) {
		console.log(`[${bjsHelper.name}]:getWxGrid()`);
		//	You can retrieve the metadata for a given latitude/longitude coordinate with the /points endpoint (https://api.weather.gov/points/{lat},{lon}).
		// 		base_url: "https://api.weather.gov",
		var wxPointsURL = config.base_url + "/points/" + config.lat + "," + config.lon;
		//var pointsEndpoint = "points/" + config.lat + "," + config.lon;
		console.log(`[${bjsHelper.name}]:getWxGrid() calling = ${wxPointsURL}`);
		(async () => {
			try {
				// take the body object 'guts'
				const {body} = await got(wxPointsURL, {
					headers: {"User-Agent": "MM-wx-gov/0.1 suowwisq@gmail.com"}
					,responseType: "json"
					//, resolveBodyOnly: true
				});
				//console.log(`[${bjsHelper.name}]:getWxGrid() returned type = ${typeof(body)}`);
				// body contains text, so make it a json object

				// when the body OBJECT version is examined, it has PassThrough, etc ???
				//console.log(`[${bjsHelper.name}]:getWxGrid() ---- body --------------------`);
				//console.log(util.inspect(body, false, 1, true /* enable colors */))

				farkle = JSON.parse(body);
				// NOW it looks to follow the json output from the url in a browser...
        		//console.log(`[${bjsHelper.name}]:getWxGrid() ---- farkle.properties --------------------`);
				//console.log(util.inspect(farkle.properties, false, 2, true /* enable colors */))
				//  The forecastGridData property will provide a link to the correct gridpoint for that location.
				bjsHelper.wxForecastGridURL = farkle.properties.forecastGridData;
				console.log(`[${bjsHelper.name}] wx-grid-url is ${bjsHelper.wxForecastGridURL}`);
				bjsHelper.sendSocketNotification("WX_GRIDPOINT_GET",
					//{msg: `The next hour is:\n${wxData.hourly.properties.periods[0].shortForecast}`
					{msg: "No wx data inspected yet."
						, config: {wxForecastGridURL: bjsHelper.wxForecastGridURL}
					} );
			} catch (error) {
				//console.log(error.response.body);
				console.log(error);
				//=> 'Internal server error ...'
			}
		})();
	},

	// simulate a time consuming operation
	wasteTime: function (ms){
		console.info("...i'm cooking for " + ms);
		let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
		console.info("...done cooking");
	},

	notificationReceived: function (notification, payload) {
		console.log(`[${bjsHelper.name}] received: ${notification}`);
	},

	socketNotificationReceived: function(notification, payload){
		console.log(`[${bjsHelper.name}]:socketNoteRcvd()`);
		switch(notification) {
		  case "WX_INIT_GRIDPOINT":
			// payload should have .msg and .config{}
			console.log(`[${bjsHelper.name}] received WX_INIT_GRIDPOINT: payload msg = ${payload.msg}`);
			this.getWxGrid(payload.config);
			break;

		  case "WX_FORECAST_GET":
			// payload should have .msg and .config{}
			console.log(`[${bjsHelper.name}] received WX_FORECAST_GET: payload msg = ${payload.msg}`);
			console.log(`[${bjsHelper.name}] ... wxForecastGridURL = ${bjsHelper.wxForecastGridURL}`);
			if (bjsHelper.wxForecastGridURL === "") {
				this.getWxGrid(payload.config);
			}

			//if data exists, return data
			//else ask for data
			// ? make 2 requests: 1 for regular (daily?) and 2 for hourly?  filterable reqst?
			// separate function for building out the data into 1 structure?
			// sent 1st time all module objects have been rendered

			// try notifying my helper
			//bjsLab.sendSocketNotification("BJSLAB_NOTIFICATION", {msg : "BJS main start"});

			break;

		  case "WX_FORECAST_TEST":
			break;
		}
	},

});

