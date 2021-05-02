// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: red; icon-glyph: motorcycle;
// NiuData Widget
// Version 1.0
// Vxider (lb@vxider.com)
// 
// Map Code blatenly stolen from @ThisIsBenny
//

{
	var show_data_age = false; // show how stale the data is
	var hide_map = false;
	var username = "";
	var password = ""; //md5(password)
	var sn = ""
	var car_name = '🛵M+'
	var distance_label = 'KM'
	var debug_size = "medium"; // which size should the widget try to run as when run through Scriptable. (small, medium, large)
	var is_dark_mode_working = false; // Scriptable widgets don't currently support dark mode.
}

var mapKey = "";
var useGoogleMaps = false;

// set up all the colors we want to use
var colors = {
	background: "#dddddd",
	background_status: "#ffffff33",
	text: {
		primary: "#333333cc",
		disabled: "#33333344"
	},
	battery: {
		background: "#33333355",
		max_charge: "#00000033",
		charging: "#ddbb22",
		centreCtrl: "#FF0000",
		cold_charge: "#3172D4",//"#3172D4",
		usable_charge: "#2BD82E",
		highlight: "#ffffff",
		border: "#333333cc",
		separator: "#333333cc"
	},
	icons: {
		default: "#33333399",
		disabled: "#33333344",
		charging_bolt: "#ddbb22",
		charging_bolt_outline: "#33333388",
		locked: "#0080FF",
		acc_on: "#00CC00"
	},
	map: {
		type: "light", // light or dark
		position: "222222" // hex without the #
	}
}

if (Device.isUsingDarkAppearance() && is_dark_mode_working) {
	// Dark mode is not supported (this always returns true). 
	// This is in here in the hope that Scriptable will support dark mode at some point in the future.

	// override colors for darkmode

	colors.background = "#333333";
	colors.text.primary = "#ffffffaa";
	colors.text.disabled = "#ffffff33";

	colors.battery.background = "#cccccc22";
	colors.battery.max_charge = "#ffffff11";
	colors.battery.border = "#cccccc55";
	colors.battery.usable_charge = "#2B972D";
	colors.battery.highlight = "#ffffff44";

	colors.icons.default = "#ffffff99";
	colors.icons.disabled = "#ffffff44";

	colors.map.type = "dark";
	colors.map.position = "CB4335";
}

// set up a container for our data. 

//NOTE: these values may not align with the data names from our service. Review the documention for the expected values and their names.

// If you want to do additional post-processing of data from your API, you should create a theme that modifies niu_data.postLoad(json).

var niu_data = {
	source: "Unknown",
	last_contact: "",
	data_is_stale: false, // if the data is especially old (> 2 hours)
	usable_battery_level: -1,
	centre_battery_level: -1,
	battery_range: -1,
	car_state: "Unknown",
	fortification_on: true,
	time_to_charge: 10000,
	longitude: -1,
	latitude: -1,
	lastTrack_ridingTime: 0,
	lastTrack_distance: 0,
	battery_connected: false
};


// a little helper to try to estimate the size of the widget in pixels
var widgetSize = computeWidgetSize();

var theme = {
	small: {
		available: true,
		init: function () {

		},
		draw: async function (widget, niu_data, colors) {
			widget.setPadding(5, 5, 5, 5)
			widget.backgroundColor = new Color(colors.background)
			theme.drawCarStatus(widget, niu_data, colors, widgetSize);
			theme.drawCarName(widget, niu_data, colors, widgetSize);
			theme.drawStatusLights(widget, niu_data, colors, widgetSize);
			theme.drawRangeInfo(widget, niu_data, colors, widgetSize);
			theme.drawBatteryBar(widget, niu_data, colors, widgetSize);

		}
	},
	medium: { available: false, init: function () { }, draw: function () { } }, // this theme doesn't support medium
	large: { available: false, init: function () { }, draw: function () { } }, // this theme doesn't support large
	init: function () {
		var widgetSizing = debug_size;
		if (config.widgetFamily != null) {
			widgetSizing = config.widgetFamily;
		}
		switch (widgetSizing) {
			case "medium":
				if (this.medium.available) { this.medium.init(); }
				break;
			case "large":
				if (this.large.available) { this.large.init(); }
				break;
			case "small":
			default:
				if (this.small.available) { this.small.init(); }
				break;

		}
	},
	draw: async function (widget, niu_data, colors) {
		var widgetSizing = debug_size;
		if (config.widgetFamily != null) {
			widgetSizing = config.widgetFamily;
		}
		switch (widgetSizing) {
			case "medium":
				if (this.medium.available) { await this.medium.draw(widget, niu_data, colors); }
				else { drawErrorWidget(widget, 'Theme not available at this size'); }
				break;
			case "large":
				if (this.large.available) { await this.large.draw(widget, niu_data, colors); }
				else { drawErrorWidget(widget, 'Theme not available at this size'); }
				break;
			case "small":
			default:
				if (this.small.available) { await this.small.draw(widget, niu_data, colors); }
				else { drawErrorWidget(widget, 'Theme not available at this size'); }
				break;
		}
	}
}
theme.medium.available = true;
theme.medium.init = theme.small.init;
theme.medium.draw = theme.small.draw;

function addMapArea() { // add the map area for medium size.
	if (!hide_map && niu_data.longitude != -1 && niu_data.latitude != -1) {
		// only if we have everything we need, otherwise leave the medium size as is.

		const mapZoomLevel = 15;

		theme.medium.draw = async function (widget, niu_data, colors) {
			widget.setPadding(5, 5, 5, 5);
			widget.backgroundColor = new Color(colors.background);
			let body = widget.addStack();

			body.layoutHorizontally();

			let column_left = body.addStack();
			column_left.size = new Size(widgetSize.width / 2, widgetSize.height);
			column_left.layoutVertically();


			theme.drawCarStatus(column_left, niu_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawCarName(column_left, niu_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawStatusLights(column_left, niu_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawRangeInfo(column_left, niu_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawBatteryBar(column_left, niu_data, colors, new Size(widgetSize.width / 2, widgetSize.height));

			let center_padding = body.addSpacer(10);
			let column_right = body.addStack();
			var mapImage;

			roundedLat = Math.round(niu_data.latitude * 2000) / 2000;
			roundedLong = Math.round(niu_data.longitude * 2000) / 2000;
			storedFile = "niu_map" + roundedLat * 2000 + "!" + roundedLong * 2000 + ".image";

			let map_image_manager = FileManager.local(); // change this to iCloud for debugging if needed
			map_image_file = map_image_manager.joinPath(map_image_manager.documentsDirectory(), storedFile);
			if (map_image_manager.fileExists(map_image_file)) {
				// load old map from disk
				mapImage = await map_image_manager.readImage(map_image_file);
				console.log("Read Map From Disk!");
			}
			if (mapImage == null) {
				mapImage = await getMapImage(roundedLong, roundedLat, mapZoomLevel, colors);
				// write image to disk for future use
				map_image_manager.writeImage(map_image_file, mapImage);
				console.log("Map Written To Disk");
			}

			column_right.topAlignContent();
			if (useGoogleMaps) {
				// use Google Maps
				column_right.url = `comgooglemaps://maps.google.com/?center=${niu_data.latitude},${niu_data.longitude}&zoom=${mapZoomLevel}&q=${niu_data.latitude},${niu_data.longitude}`;
			} else {
				// use Apple Maps
				column_right.url = `http://maps.apple.com/?ll=${niu_data.latitude},${niu_data.longitude}&q=Niu`;

			}

			var location = await getLocation(niu_data.latitude, niu_data.longitude)
			if (location.length > 12)
				location = [location.slice(0, 12), '\n', location.slice(12)].join('');

			let mapImageContext = new DrawContext()
			mapImageContext.opaque = true
			mapImageContext.size = mapImage.size;
			mapImageContext.drawImageAtPoint(mapImage, new Point(0, 0))
			mapImageContext.setFillColor(new Color("#EAEAEA"))
			mapImageContext.fillRect(new Rect(0, 0, mapImage.size.width, 80))
			mapImageContext.setFont(Font.systemFont(24))
			mapImageContext.setTextAlignedRight()
			mapImageContext.setTextColor(new Color("#898989"))
			mapImageContext.drawText(location, new Point(20, 10))

			let mapImageObj = column_right.addImage(mapImageContext.getImage());

			mapImageObj.cornerRadius = 22;
			mapImageObj.rightAlignImage();
		}
	}
}

var _0xd9c9 = ["\x32\x30\x30\x2C\x32\x30\x30\x40\x32\x78", "", "\x32\x4F\x6F\x59\x6D\x41\x46\x71\x49\x74\x53\x30\x71\x54\x54\x74\x48\x70\x37\x56\x72\x45\x56\x42\x48\x67\x49\x45\x7A\x4E\x58\x41", "\x68\x74\x74\x70\x73\x3A\x2F\x2F\x77\x77\x77\x2E\x6D\x61\x70\x71\x75\x65\x73\x74\x61\x70\x69\x2E\x63\x6F\x6D\x2F\x73\x74\x61\x74\x69\x63\x6D\x61\x70\x2F\x76\x35\x2F\x6D\x61\x70\x3F\x6B\x65\x79\x3D", "\x26\x6C\x6F\x63\x61\x74\x69\x6F\x6E\x73\x3D", "\x2C", "\x26\x7A\x6F\x6F\x6D\x3D", "\x26\x66\x6F\x72\x6D\x61\x74\x3D\x70\x6E\x67\x26\x73\x69\x7A\x65\x3D", "\x26\x74\x79\x70\x65\x3D", "\x74\x79\x70\x65", "\x6D\x61\x70", "\x26\x64\x65\x66\x61\x75\x6C\x74\x4D\x61\x72\x6B\x65\x72\x3D\x6D\x61\x72\x6B\x65\x72\x2D", "\x70\x6F\x73\x69\x74\x69\x6F\x6E", "\x6C\x6F\x61\x64\x49\x6D\x61\x67\x65"]; async function getMapImage(_0x4583x2, _0x4583x3, _0x4583x4, _0x4583x5) { var _0x4583x6 = _0xd9c9[0]; if (mapKey == null || mapKey == _0xd9c9[1]) { mapKey = _0xd9c9[2] }; let _0x4583x7 = `${_0xd9c9[3]}${mapKey}${_0xd9c9[4]}${_0x4583x3}${_0xd9c9[5]}${_0x4583x2}${_0xd9c9[6]}${_0x4583x4}${_0xd9c9[7]}${_0x4583x6}${_0xd9c9[8]}${_0x4583x5[_0xd9c9[10]][_0xd9c9[9]]}${_0xd9c9[11]}${_0x4583x5[_0xd9c9[10]][_0xd9c9[12]]}${_0xd9c9[1]}`; r = new Request(_0x4583x7); i = await r[_0xd9c9[13]](); return i }

theme.drawCarStatus = function (widget, niu_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.20);
	stack.topAlignContent();
	stack.setPadding(0, 6, 0, 6);

	let timeDiff = 0
	if (niu_data.last_contact.length > 0) {
		let lastUpdateText = stack.addText(niu_data.last_contact)
		lastUpdateText.textColor = new Color(colors.text.primary);
		lastUpdateText.textOpacity = 0.4
		lastUpdateText.font = Font.systemFont(12)
		lastUpdateText.leftAlignText()

	}
	let carStateSpacer = stack.addSpacer(null)
	switch (niu_data.car_state) {
		case "acc_off": {
			idlingIcon = this.getPowerIcon(colors);
			var carState = stack.addImage(idlingIcon);
			carState.tintColor = new Color(colors.icons.default);
			carState.imageSize = scaleImage(idlingIcon.size, 18);
			carState.rightAlignImage();
			break;
		}
		case "acc_on": {
			drivingIcon = this.getPowerIcon(colors);
			var carState = stack.addImage(drivingIcon);
			carState.tintColor = new Color(colors.icons.acc_on);
			carState.imageSize = scaleImage(drivingIcon.size, 18);
			carState.rightAlignImage();
			break;
		}
		case "charging": {
			chargingIcon = this.getChargingIcon(colors);
			var carState = stack.addImage(chargingIcon);
			carState.imageSize = scaleImage(chargingIcon.size, 18);
			carState.rightAlignImage();
			break;
		}
		case "disconnected": {
			disconnectIcon = this.getDisconnectIcon(colors);
			var carState = stack.addImage(disconnectIcon);
			carState.tintColor = new Color(colors.icons.default);
			carState.imageSize = scaleImage(disconnectIcon.size, 18);
			carState.rightAlignImage();
			break;
		}
		default: {
		}
	}
}

{ // helper functions to draw things for car status
	theme.getPowerIcon = function (colors) {
		symbolToUse = "power";
		let statusSymbol = SFSymbol.named(symbolToUse);
		return statusSymbol.image;
	}

	theme.getDisconnectIcon = function (colors) {
		symbolToUse = "bolt.slash.fill";
		let statusSymbol = SFSymbol.named(symbolToUse);
		return statusSymbol.image;
	}

	theme.getChargingIcon = function (colors) {
		let iconHeight = 17;

		let carChargingImageContext = new DrawContext()
		carChargingImageContext.opaque = false
		carChargingImageContext.size = new Size(12, iconHeight)

		let boltLines = [[5, 0], [0, 7], [3, 7], [2, 12], [7, 5], [4, 5]];
		const boltIcon = new Path()
		boltIcon.addLines(scaleLines(boltLines, iconHeight - 2, 1, 1));
		boltIcon.closeSubpath()

		carChargingImageContext.addPath(boltIcon)
		carChargingImageContext.setLineWidth(2)
		carChargingImageContext.setStrokeColor(new Color(colors.icons.charging_bolt_outline))
		carChargingImageContext.strokePath()
		carChargingImageContext.addPath(boltIcon)
		carChargingImageContext.setFillColor(new Color(colors.icons.charging_bolt))
		carChargingImageContext.fillPath()

		return carChargingImageContext.getImage();
	}
}

theme.drawCarName = function (widget, niu_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.25);
	stack.centerAlignContent();
	stack.setPadding(0, 3, 5, 3);

	let carName = stack.addText(car_name);
	carName.textColor = new Color(colors.text.primary);
	carName.centerAlignText()
	carName.font = Font.semiboldSystemFont(24)
	carName.minimumScaleFactor = 0.5
}

theme.drawStatusLights = function (widget, niu_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.20);
	stack.setPadding(3, 10, 3, 10);
	stack.backgroundColor = new Color(colors.background_status);;
	stack.cornerRadius = 3;
	stack.centerAlignContent();

	var carControlLockIconImage = this.getShieldIcon();
	let carControlLockIcon = stack.addImage(carControlLockIconImage);
	carControlLockIcon.imageSize = scaleImage(carControlLockIcon.image.size, 12)
	carControlLockIcon.containerRelativeShape = true
	if (niu_data.fortification_on)
		carControlLockIcon.tintColor = new Color(colors.icons.locked);
	else
		carControlLockIcon.tintColor = new Color(colors.icons.default);
	let carControlSpacer = stack.addSpacer(null)

	lastTrackIconImage = this.getlastTrackIcon();
	let lastTrackIcon = stack.addImage(lastTrackIconImage);
	lastTrackIcon.imageSize = scaleImage(lastTrackIcon.image.size, 12)
	lastTrackIcon.containerRelativeShape = true
	lastTrackIcon.tintColor = new Color(colors.icons.default);

	var lastTrackText = " " + (niu_data.lastTrack_distance / 1000).toFixed(1) + 'KM/' + Math.round(niu_data.lastTrack_ridingTime / 60) + "min";

	let lastTrack = stack.addText(lastTrackText)
	lastTrack.textColor = new Color(colors.icons.default);
	lastTrack.font = Font.systemFont(12)
	lastTrack.textOpacity = 1.0
}

{ // helper functions to draw things for status lights
	theme.getShieldIcon = function () {
		return SFSymbol.named("lock.shield").image;
	}

	theme.getlastTrackIcon = function () {
		unlockSymbol = SFSymbol.named("map");
		return unlockSymbol.image;
	}
}

theme.drawRangeInfo = function (widget, niu_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.15);
	stack.centerAlignContent();
	stack.setPadding(5, 10, 0, 10);

	if (niu_data.usable_battery_level > -1) {
		let batteryCurrentChargePercentTxt = "";
		if (niu_data.battery_connected)
			batteryCurrentChargePercentTxt = stack.addText(niu_data.usable_battery_level + "%")
		else
			batteryCurrentChargePercentTxt = stack.addText(niu_data.centre_battery_level + "%")
		batteryCurrentChargePercentTxt.textColor = new Color(colors.text.primary);
		batteryCurrentChargePercentTxt.textOpacity = 0.6
		batteryCurrentChargePercentTxt.font = Font.systemFont(12)
		batteryCurrentChargePercentTxt.centerAlignText()
	}
	if (niu_data.battery_range > -1) {
		let carChargingSpacer1 = stack.addSpacer(null)
		batteryCurrentCharge = "" + Math.floor(niu_data.battery_range) + distance_label;
		if (batteryCurrentCharge.length > 0) {
			let batteryCurrentRangeTxt = stack.addText(batteryCurrentCharge)
			batteryCurrentRangeTxt.textColor = new Color(colors.text.primary);
			batteryCurrentRangeTxt.textOpacity = 0.6
			batteryCurrentRangeTxt.font = Font.systemFont(12)
			batteryCurrentRangeTxt.centerAlignText()
		}
	}

	if (niu_data.car_state == "charging") {
		let carChargingSpacer2 = stack.addSpacer(null);

		// currently charging
		minutes = Math.round((niu_data.time_to_charge - Math.floor(niu_data.time_to_charge)) * 12) * 5;
		if (minutes < 10) { minutes = "0" + minutes }

		chargingSymbol = this.getChargerConnectedIcon();
		let carControlIconBolt = stack.addImage(chargingSymbol);
		carControlIconBolt.imageSize = scaleImage(chargingSymbol.size, 12);
		carControlIconBolt.tintColor = new Color(colors.text.primary);
		carControlIconBolt.imageOpacity = 0.8;

		let carChargeCompleteTime = stack.addText(" " + Math.floor(niu_data.time_to_charge) + ":" + minutes);
		carChargeCompleteTime.textColor = new Color(colors.text.primary);
		carChargeCompleteTime.font = Font.systemFont(12);
		carChargeCompleteTime.textOpacity = 0.6;

		stack.setPadding(5, 5, 0, 5);
	}

}

{ // helper functions to draw things for range info
	theme.getChargerConnectedIcon = function () {
		lockSymbol = SFSymbol.named("bolt.circle.fill");
		return lockSymbol.image;
	}
}

theme.drawBatteryBar = function (widget, niu_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.20);
	stack.topAlignContent();
	stack.setPadding(3, 0, 0, 0);

	let batteryBarImg = stack.addImage(battery_bar.draw(niu_data, colors, widgetSize));
	batteryBarImg.centerAlignImage()
}


var battery_bar = { // battery bar draw functions
	batteryPath: new Path(),
	batteryPathInset: new Path(),
	width: widgetSize.width - 6,
	height: 18,
	init: function () {
	},
	draw: function (niu_data, colors, widgetSize) {
		this.width = widgetSize.width - 6;
		this.batteryPath.addRoundedRect(new Rect(1, 1, this.width, this.height), 7, 7);
		this.batteryPathInset.addRoundedRect(new Rect(2, 2, this.width - 2, this.height - 2), 7, 7);

		let myDrawContext = new DrawContext();
		myDrawContext.opaque = false;
		myDrawContext.size = new Size(this.width + 2, this.height + 2);

		// draw the background
		myDrawContext.addPath(this.batteryPath);
		myDrawContext.setFillColor(new Color(colors.battery.background));
		myDrawContext.fillPath();

		// draw the max charge (as set by the user)
		let batteryMaxCharge = new DrawContext();
		batteryMaxCharge.opaque = false;
		batteryMaxCharge.size = new Size(this.width, this.height)
		if (niu_data.car_state == "charging") {
			batteryMaxCharge.setFillColor(new Color(colors.battery.charging));
		} else {
			batteryMaxCharge.setFillColor(new Color(colors.battery.max_charge));
		}
		batteryMaxCharge.addPath(this.batteryPath);
		batteryMaxCharge.fillPath();

		myDrawContext.drawImageAtPoint(batteryMaxCharge.getImage(), new Point(0, 0));

		// draw the available charge
		let availableCharge = new DrawContext();
		availableCharge.opaque = false;
		if (niu_data.battery_connected) {
			let usable_battery_level = Number(niu_data.usable_battery_level);
			availableCharge.size = new Size(this.width * usable_battery_level / 100, this.height);
			availableCharge.setFillColor(new Color(colors.battery.usable_charge));
		}
		else {
			let centre_battery_level = Number(niu_data.centre_battery_level);
			availableCharge.size = new Size(this.width * centre_battery_level / 100, this.height);
			availableCharge.setFillColor(new Color(colors.battery.centreCtrl));
		}

		availableCharge.addPath(this.batteryPath);
		availableCharge.fillPath();

		myDrawContext.drawImageAtPoint(availableCharge.getImage(), new Point(0, 0));
		myDrawContext.addPath(this.batteryPath);// have to add the path again for some reason
		myDrawContext.setStrokeColor(new Color(colors.battery.border));
		myDrawContext.setLineWidth(1);
		myDrawContext.strokePath();

		return myDrawContext.getImage(); // return our final image

	}

}

battery_bar.init();

// Start processing our code (load the car data, then render)
let response = await loadNiuData()

addMapArea(); // after loading car data we can decide if we can display the map

if (response == "ok") {
	let widget = await createWidget(niu_data, colors);
	Script.setWidget(widget);
	presentWidget(widget);
	Script.complete();
} else {
	let widget = errorWidget(response);
	Script.setWidget(widget);
	presentWidget(widget);
	Script.complete();
}

function presentWidget(widget) {
	switch (debug_size) {
		case "medium":
			widget.presentMedium();
			break;
		case "large":
			widget.presentLarge();
			break;
		case "small":
		default:
			widget.presentSmall();
			break;
	}
}

async function createWidget(niu_data, colors) {
	themeDebugArea();

	let td_theme = FileManager.iCloud()

	// create the themes directory if needed (so the user doesn't have to do this)
	theme_file = td_theme.joinPath(td_theme.documentsDirectory(), "niu_data");
	if (!td_theme.isDirectory(theme_file)) {
		// create the directory
		td_theme.createDirectory(theme_file);
	}

	let w = new ListWidget()
	theme.init();
	await theme.draw(w, niu_data, colors);

	return w
}

function errorWidget(reason) {
	let w = new ListWidget()
	drawErrorWidget(w, reason);
	return w
}

function drawErrorWidget(w, reason) {
	w.setPadding(5, 5, 5, 5)
	let myGradient = new LinearGradient()

	w.backgroundColor = new Color("#933")
	myGradient.colors = [new Color("#44444466"), new Color("#88888855"), new Color("#66666655")]
	myGradient.locations = [0, 0.8, 1]
	w.backgroundGradient = myGradient

	let title = w.addText("Error")
	title.textColor = Color.white()
	title.font = Font.semiboldSystemFont(30)
	title.minimumScaleFactor = 0.5

	let reasonText = w.addText(reason)
	reasonText.textColor = Color.white()
	reasonText.minimumScaleFactor = 0.5

}

async function fetchNiuData(token) {
	var req = await new Request('https://app-api.niu.com/v3/motor_data/index_info?&sn=' + sn);
	req.method = 'GET';
	req.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
		'token': token
	};
	var json = await req.loadJSON();
	return json;
}

async function getLocation(lat, lng) {
	var req = await new Request('https://restapi.amap.com/v3/geocode/regeo?key=e52862f1882aadbd8c0318ce29af21a4&location=' + lng + ',' + lat + '&poitype=&radius=1000&extensions=all&batch=false&roadlevel=0');
	var json = await req.loadJSON();
	if (json.status == 1) {
		var address = json.regeocode.formatted_address
		var province = json.regeocode.addressComponent.province
		var city = json.regeocode.addressComponent.city
		address = address.replace(province, "")
		address = address.replace(city, "")
		return address;
	}
	return ''
}

async function loadToken(force = false) {
	let tokenManager = FileManager.iCloud()
	token_file = tokenManager.joinPath(tokenManager.documentsDirectory(), "niu_data/token.dat");

	if (force || !tokenManager.fileExists(token_file)) {
		var request_ = await new Request('https://account.niu.com/v3/api/oauth2/token');
		request_.method = "POST";
		request_.headers = {
			'Content-Type': 'application/x-www-form-urlencoded',
			'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148'
		};
		request_.body = 'account=' + username + '&password=' + password + '&app_id=niu_03cn0n7v&scope=base&countryCode=86&grant_type=password';
		var json = await request_.loadJSON();
		if (json.status == 0) {
			var token = json.data.token.access_token;
			tokenManager.writeString(token_file, token)
			return token;
		}
		else {
			return '';
		}
	}
	else {
		tokenManager.downloadFileFromiCloud(token_file);
		return tokenManager.readString(token_file);
	}
}

function parseCarData(json) {
	niu_data.usable_battery_level = json.data.batteries.compartmentA.batteryCharging;
	niu_data.battery_connected = json.data.batteries.compartmentA.isConnected;
	niu_data.centre_battery_level = json.data.centreCtrlBattery;
	niu_data.battery_range = json.data.estimatedMileage;
	if (json.data.isCharging == 1)
		niu_data.car_state = "charging";
	else if (json.data.isAccOn == 1)
		niu_data.car_state = "acc_on";
	else if (!niu_data.battery_connected)
		niu_data.car_state = "disconnected";
	else
		niu_data.car_state = "acc_off"
	niu_data.fortification_on = (json.data.isFortificationOn == 1);
	niu_data.time_to_charge = json.data.leftTime;
	niu_data.longitude = json.data.postion.lng;
	niu_data.latitude = json.data.postion.lat;
	niu_data.lastTrack_ridingTime = json.data.lastTrack.ridingTime;
	niu_data.lastTrack_distance = json.data.lastTrack.distance;

	let lastUpdate = new Date(json.data.time)
	let now = new Date()
	timeDiff = Math.round((Math.abs(now - lastUpdate)) / (1000 * 60))
	if (timeDiff < 60) {
		// been less than an hour since last update
		niu_data.last_contact = timeDiff + "m ago"
	} else if (timeDiff < 1440) {
		niu_data.last_contact = Math.floor(timeDiff / 60) + "h ago"
	} else {
		niu_data.last_contact = Math.floor(timeDiff / 1440) + "d ago"
	}
	if (timeDiff / 60 > 2) {
		niu_data.data_is_stale = true; // data is more than 2 hours old.
	}
}

async function loadNiuData() {

	if (username != null && username != "" && password != null && password != "" && sn != null && sn != "") {

		var backupManager = FileManager.local();
		var backupLocation = backupManager.joinPath(backupManager.libraryDirectory(), "niu_data.txt")

		try {
			var token = await loadToken();
			var json = await fetchNiuData(token);
			if (json.response == null) {
				var jsonExport = JSON.stringify(json);
				backupManager.writeString(backupLocation, jsonExport);
			}
			else if (json.status == 1131) {
				var token = await loadToken(true);
				var json = await fetchNiuData(token);
			}
			parseCarData(json);
		} catch (e) {
			// offline, grab the backup copy
			if (backupManager.fileExists(backupLocation)) {
				var jsonImport = backupManager.readString(backupLocation);
				var json = JSON.parse(jsonImport);
				parseCarData(json);
			}
			return e;
		}
	} else {
		niu_data = getSampleData(); // the user hasn't provided a url, so we'll show sample data
	}
	return "ok";
}

// utility functions
function scaleLines(lineArray, maxHeight, offsetX, offsetY) {
	//scale an array of lines and make it an array of scaled Points
	let pointArray = [];
	let scaleFactor = 0;
	for (var i = 0; i < lineArray.length; i++) {
		if (lineArray[i][1] > scaleFactor) { scaleFactor = lineArray[i][1]; }
	}
	scaleFactor = maxHeight / scaleFactor;
	for (var i = 0; i < lineArray.length; i++) {
		pointArray[pointArray.length] = new Point(lineArray[i][0] * scaleFactor + offsetX, lineArray[i][1] * scaleFactor + offsetY);
	}
	return pointArray;
}

function scaleImage(imageSize, height) {
	scale = height / imageSize.height
	return new Size(scale * imageSize.width, height)
}

function computeWidgetSize() {
	deviceScreen = Device.screenSize()
	let gutter_size = ((deviceScreen.width - 240) / 5) // if we know the size of the screen, and the size of icons, we can estimate the gutter size
	var widgetSize = new Size(gutter_size + 110, gutter_size + 110) // small widget size
	widgetSize.gutter_size = gutter_size;

	var widgetSizing = debug_size;
	if (config.widgetFamily != null) {
		widgetSizing = config.widgetFamily;
	}
	switch (widgetSizing) {
		case "medium":
			widgetSize = new Size(gutter_size * 3 + 220, gutter_size + 110) // medium widget size
			break;
		case "large":
			widgetSize = new Size(gutter_size * 3 + 220, gutter_size * 3 + 220) // large widget size
			break;
	}

	return widgetSize
}

function getSampleData() {
	return {
		"data_is_stale": false, // if the data is especially old (> 2 hours)
		"usable_battery_level": 88,
		"centre_battery_level": 100,
		"battery_range": 104,
		"car_state": "Unknown",
		"fortification_on": true,
		"time_to_charge": 10000,
		"longitude": -1,
		"latitude": -1,
		"last_contact": "10m ago",
		"lastTrack_ridingTime": 0,
		"lastTrack_distance": 0,
		"battery_connected": true
	}
}

function themeDebugArea() {
	// This is a working area for theme development (so errors will give you correct line numbers
	// Once you've finished, move your code to a JS file in the niu_data folder

}
