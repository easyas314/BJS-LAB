//  node_helper.js

var NodeHelper = require("node_helper");
var bjsHelper;
var request = require("request");
var moment = require("moment");

module.exports = NodeHelper.create({

	// not sure how to address these
	defaults: {
		base_url: "https://api.weather.gov",
		lat: 34.844740, //REQUIRED
		lon: -82.394430, //REQUIRED
		updateInterval: 900000, // 15 min
	},

	start: function(){
		bjsHelper = this;
		bjsHelper.base_url= "https://api.weather.gov";
		bjsHelper.lat= 34.844740; //REQUIRED
		bjsHelper.lon= -82.394430; //REQUIRED
		bjsHelper.updateInterval= 900000; // 15 min
		//Log.info("Started Module: " + BJS_helper.name);
		console.log(`[${bjsHelper.name}] Started helper module`);
		//console.log("                     : " + BJS_helper.base_url);
		//console.log("                     : " + BJS_helper.lat);
		//console.log("                     : " + BJS_helper.lon);
		bjsHelper.countdown = 100000;
		// make immediate call to Wx points based on location
		//	NWS tips: How do I determine the gridpoint for my location?
		//	You can retrieve the metadata for a given latitude/longitude coordinate with the /points endpoint (https://api.weather.gov/points/{lat},{lon}).
		var wxPointsURL = bjsHelper.base_url + "/points/" + bjsHelper.lat + "," + bjsHelper.lon;
		//  The forecastGridData property will provide a link to the correct gridpoint for that location.

		// wx api needs a nice user-agent
		const options = {
			url: wxPointsURL,
			headers: {
			  "User-Agent": "MM-wx-gov / v0.1 suowwisq@gmail.com"
			},
			method: "GET"
		  };
		console.log(`[${bjsHelper.name}] Requesting gridpoint from ${wxPointsURL}`);
		request(options, function( error, response, body) {
			// error is null with a 200 so ..
			//if(!error && response.statusCode == 200) {
			if(response.statusCode == 200) {
				//Good response
				var resp = JSON.parse(body);
				//resp.instanceId = payload.instanceId;
				bjsHelper.wxForecastGridURL = resp.properties.forecastGridData;
				console.log(`[${bjsHelper.name}] wx-grid-url is ${bjsHelper.wxForecastGridURL}`);
				bjsHelper.wxForecastHourlyURL = `${bjsHelper.wxForecastGridURL}/forecast/hourly`;
				// now ask myself for a forecast?
				//bjsHelper.sendSocketNotification("BJSLAB_WX_FORECAST_GET", {msg: "initial wx ask"});
			} else {
				console.log(`[${bjsHelper.name}] ERROR: response status = ${response.statusCode}`);
			}
		});

		console.log(`[${bjsHelper.name}] completed start function`);

	},

	// simulate a time consuming operation
	wasteTime: function (ms){
		console.info("...i'm cooking for " + ms);
		let sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
		console.info("...done cooking");
	},

	notificationReceived: function (notification, payload) {
		console.log(`[${bjsHelper.name}] some notification was received`);
		if (notification === "ALL_MODULES_STARTED") {

			//setTimeout(5000);
			bjsHelper.sendSocketNotification("BJSLAB_NOTIFICATION", {
				msg: "helper received ALL_MODULES_STARTED"
			});

			bjsHelper.sendSocketNotification("BJSLAB_WX_FORECAST_GET", {
				msg: "please to get the forecast"
			});

		};
		console.log(`[${bjsHelper.name}] received: ${notification}`);
	},

	socketNotificationReceived: function(notification, payload){
		if (notification === "BJSLAB_WX_FORECAST_GET") {
			console.log(`[${bjsHelper.name}] received BJSLAB_WX_FORECAST_GET: payload msg = ${payload.msg}`);
			//bjsHelper.wasteTime(3000);
			//make request to Wx API
			// ? make 2 requests: 1 for regular (daily?) and 2 for hourly?  filterable reqst?
			// separate function for building out the data into 1 structure?

			// wx api needs a nice user-agent
			const options = {
				url: bjsHelper.wxForecastHourlyURL,
				headers: {
					"User-Agent": "MM-wx-gov / v0.1 suowwisq@gmail.com"
				},
				method: "GET"
			};
			console.log(`[${bjsHelper.name}] Requesting forecast hourly ${options.url}`);
			request(options, function( error, response, body) {
				// error is null with a 200 so ..
				//if(!error && response.statusCode == 200) {
				if(response.statusCode == 200) {
					//Good response
					var resp = JSON.parse(body);
					//resp.instanceId = payload.instanceId;
					wxData.hourly.properties = resp.properties;
					// test: send consumable data
					bjsHelper.sendSocketNotification("BJSLAB_NOTIFICATION",
						`The next hour is:\n${wxData.hourly.properties.periods[0].shortForecast}`);
				} else {
					console.log(`[${bjsHelper.name}] ERROR: response status = ${response.statusCode}`);
				}
			});

			//console.log( "[BJS-helper] WX-GRID-URL: " + bjsHelper.wxForecastGridURL );
			bjsHelper.countdown--;
			bjsHelper.sendSocketNotification("BJSLAB_NOTIFICATION", "byte me " + bjsHelper.countdown + " times!");
		}
	}

});

