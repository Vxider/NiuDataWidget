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
	var show_last_track_map = true;
	var hide_map = true;
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

// If you want to do additional post-processing of data from your API, you should create a theme that modifies info_data.postLoad(json).

var info_data = {
	scooter_name: '',
	source: "Unknown",
	last_contact: "",
	data_is_stale: false, // if the data is especially old (> 2 hours)
	usable_battery_level: -1,
	centre_battery_level: -1,
	battery_range: -1,
	scooter_state: "Unknown",
	is_charging: false,
	fortification_on: true,
	time_to_charge: 10000,
	longitude: -1,
	latitude: -1,
	gps: 0,
	gsm: 0,
	lastTrack_ridingTime: 0,
	lastTrack_distance: 0,
	battery_connected: false
};

var last_track_data = {
	trackId: '',
	ridingTime: 0,
	distance: 0,
	avespeed: 0,
	track_thumb: '',
	power_consumption: 0
};

// a little helper to try to estimate the size of the widget in pixels
var widgetSize = computeWidgetSize();

var theme = {
	small: {
		available: true,
		init: function () {

		},
		draw: async function (widget, info_data, colors) {
			widget.setPadding(5, 5, 5, 5)
			widget.backgroundColor = new Color(colors.background)
			theme.drawScooterStatus(widget, info_data, colors, widgetSize);
			theme.drawScooterName(widget, info_data, colors, widgetSize);
			theme.drawScooterInfo(widget, info_data, colors, widgetSize);
			theme.drawStatusLights(widget, info_data, colors, widgetSize);
			theme.drawRangeInfo(widget, info_data, colors, widgetSize);
			theme.drawBatteryBar(widget, info_data, colors, widgetSize);

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
	draw: async function (widget, info_data, colors) {
		var widgetSizing = debug_size;
		if (config.widgetFamily != null) {
			widgetSizing = config.widgetFamily;
		}
		switch (widgetSizing) {
			case "medium":
				if (this.medium.available) { await this.medium.draw(widget, info_data, colors); }
				else { drawErrorWidget(widget, 'Theme not available at this size'); }
				break;
			case "large":
				if (this.large.available) { await this.large.draw(widget, info_data, colors); }
				else { drawErrorWidget(widget, 'Theme not available at this size'); }
				break;
			case "small":
			default:
				if (this.small.available) { await this.small.draw(widget, info_data, colors); }
				else { drawErrorWidget(widget, 'Theme not available at this size'); }
				break;
		}
	}
}
theme.medium.available = true;
theme.medium.init = theme.small.init;
theme.medium.draw = theme.small.draw;

function addLastTrackMapArea() { // add the last track map area for medium size.
	if (show_last_track_map && hide_map) {
		// only if we have everything we need, otherwise leave the medium size as is.

		theme.medium.draw = async function (widget, info_data, colors) {
			widget.setPadding(5, 5, 5, 5);
			widget.backgroundColor = new Color(colors.background);
			let body = widget.addStack();

			body.layoutHorizontally();

			let column_left = body.addStack();
			column_left.size = new Size(widgetSize.width / 2, widgetSize.height);
			column_left.layoutVertically();

			theme.drawScooterStatus(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawScooterName(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawScooterInfo(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawStatusLights(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawRangeInfo(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawBatteryBar(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));

			let center_padding = body.addSpacer(10);
			let column_right = body.addStack();

			var mapImage;

			configFilePath = "niu_last_track_id.data";
			imageFilePath = "niu_last_track_thumb.png";

			var last_track_id = '';
			let imageManager = FileManager.local();
			let configFile = imageManager.joinPath(imageManager.cacheDirectory(), configFilePath);
			let imageFile = imageManager.joinPath(imageManager.cacheDirectory(), imageFilePath);
			if (imageManager.fileExists(configFile))
				last_track_id = imageManager.readString(configFile);
			if (last_track_id == last_track_data.trackId && imageManager.fileExists(imageFile))
				mapImage = await imageManager.readImage(imageFile);
			else
			{
				var req = await new Request(last_track_data.track_thumb);
				mapImage = await req.loadImage()
				imageManager.writeImage(imageFile, mapImage);
				imageManager.writeString(configFile, last_track_data.trackId);
			}

			column_right.topAlignContent();

			let mapImageContext = new DrawContext()
			mapImageContext.opaque = true
			mapImageContext.size = mapImage.size;
			mapImageContext.drawImageAtPoint(mapImage, new Point(0, 0))

			let mapImageObj = column_right.addImage(mapImageContext.getImage());
			mapImageObj.cornerRadius = 22;
			mapImageObj.rightAlignImage();
		}
	}
}

function addMapArea() { // add the map area for medium size.
	if (!show_last_track_map && !hide_map && info_data.longitude != -1 && info_data.latitude != -1) {
		// only if we have everything we need, otherwise leave the medium size as is.

		const mapZoomLevel = 15;

		theme.medium.draw = async function (widget, info_data, colors) {
			widget.setPadding(5, 5, 5, 5);
			widget.backgroundColor = new Color(colors.background);
			let body = widget.addStack();

			body.layoutHorizontally();

			let column_left = body.addStack();
			column_left.size = new Size(widgetSize.width / 2, widgetSize.height);
			column_left.layoutVertically();


			theme.drawScooterStatus(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawScooterName(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawScooterInfo(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawStatusLights(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawRangeInfo(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));
			theme.drawBatteryBar(column_left, info_data, colors, new Size(widgetSize.width / 2, widgetSize.height));

			let center_padding = body.addSpacer(10);
			let column_right = body.addStack();
			var mapImage;

			roundedLat = Math.round(info_data.latitude * 2000) / 2000;
			roundedLong = Math.round(info_data.longitude * 2000) / 2000;
			storedFile = "niu_widget_map" + roundedLat * 2000 + "!" + roundedLong * 2000 + ".image";

			let map_image_manager = FileManager.local();
			let map_image_file = map_image_manager.joinPath(map_image_manager.cacheDirectory(), storedFile);
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
				column_right.url = `comgooglemaps://maps.google.com/?center=${info_data.latitude},${info_data.longitude}&zoom=${mapZoomLevel}&q=${info_data.latitude},${info_data.longitude}`;
			} else {
				// use Apple Maps
				column_right.url = `http://maps.apple.com/?ll=${info_data.latitude},${info_data.longitude}&q=Niu`;

			}

			var location = await getLocation(info_data.latitude, info_data.longitude)
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

theme.drawScooterStatus = function (widget, info_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.20);
	stack.topAlignContent();
	stack.setPadding(0, 6, 0, 6);

	let timeDiff = 0
	if (info_data.last_contact.length > 0) {
		let lastUpdateText = stack.addText(info_data.last_contact)
		lastUpdateText.textColor = new Color(colors.text.primary);
		lastUpdateText.textOpacity = 0.4
		lastUpdateText.font = Font.systemFont(12)
		lastUpdateText.leftAlignText()

	}
	stack.addSpacer(null)

	switch (info_data.scooter_state) {
		case "fortification_on": {
			lockIcon = this.getLockIcon();
			var scooterState = stack.addImage(lockIcon);
			scooterState.tintColor = new Color(colors.icons.locked);
			scooterState.imageSize = scaleImage(lockIcon.size, 18);
			scooterState.rightAlignImage();
			break;
		}
		case "acc_off": {
			idlingIcon = this.getPowerIcon(colors);
			var scooterState = stack.addImage(idlingIcon);
			scooterState.tintColor = new Color(colors.icons.default);
			scooterState.imageSize = scaleImage(idlingIcon.size, 18);
			scooterState.rightAlignImage();
			break;
		}
		case "acc_on": {
			drivingIcon = this.getPowerIcon(colors);
			var scooterState = stack.addImage(drivingIcon);
			scooterState.tintColor = new Color(colors.icons.acc_on);
			scooterState.imageSize = scaleImage(drivingIcon.size, 18);
			scooterState.rightAlignImage();
			break;
		}
		case "charging": {
			chargingIcon = this.getChargingIcon(colors);
			var scooterState = stack.addImage(chargingIcon);
			scooterState.imageSize = scaleImage(chargingIcon.size, 18);
			scooterState.rightAlignImage();
			break;
		}
		case "disconnected": {
			disconnectIcon = this.getDisconnectIcon(colors);
			var scooterState = stack.addImage(disconnectIcon);
			scooterState.tintColor = new Color(colors.icons.default);
			scooterState.imageSize = scaleImage(disconnectIcon.size, 18);
			scooterState.rightAlignImage();
			break;
		}
		default: {
		}
	}
}

{ // helper functions to draw things for scooter status
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

		let scooterChargingImageContext = new DrawContext()
		scooterChargingImageContext.opaque = false
		scooterChargingImageContext.size = new Size(12, iconHeight)

		let boltLines = [[5, 0], [0, 7], [3, 7], [2, 12], [7, 5], [4, 5]];
		const boltIcon = new Path()
		boltIcon.addLines(scaleLines(boltLines, iconHeight - 2, 1, 1));
		boltIcon.closeSubpath()

		scooterChargingImageContext.addPath(boltIcon)
		scooterChargingImageContext.setLineWidth(2)
		scooterChargingImageContext.setStrokeColor(new Color(colors.icons.charging_bolt_outline))
		scooterChargingImageContext.strokePath()
		scooterChargingImageContext.addPath(boltIcon)
		scooterChargingImageContext.setFillColor(new Color(colors.icons.charging_bolt))
		scooterChargingImageContext.fillPath()

		return scooterChargingImageContext.getImage();
	}
}

theme.drawScooterName = function (widget, info_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.20);
	stack.centerAlignContent();
	stack.setPadding(0, 3, 5, 3);

	let scooterName = stack.addText(info_data.scooter_name);
	scooterName.textColor = new Color(colors.text.primary);
	scooterName.centerAlignText()
	scooterName.font = Font.semiboldSystemFont(24)
	scooterName.minimumScaleFactor = 0.5
}

theme.drawScooterInfo = function (widget, info_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.13);
	stack.setPadding(3, 0, 3, 0);
	stack.centerAlignContent();

	var GPStext1 = "GPS ";
	for (i = 0; i < info_data.gps && i < 5; i++)
		GPStext1 = GPStext1 + "•";
	var GPStext2 = '';
	for (i = info_data.gps; i < 5; i++)
		GPStext2 = GPStext2 + "◦";

	let gpsLabel1 = stack.addText(GPStext1)
	gpsLabel1.font = Font.semiboldSystemFont(10)
	gpsLabel1.textColor = new Color(colors.icons.default);
	let gpsLabel2 = stack.addText(GPStext2)
	gpsLabel2.font = Font.semiboldSystemFont(10)
	gpsLabel2.textColor = new Color("#CCCCCC");

	var GSMtext1 = "   GSM ";
	for (i = 0; i < info_data.gsm && i < 5; i++)
		GSMtext1 = GSMtext1 + "•";
	var GSMtext2 = "";
	for (i = info_data.gsm; i < 5; i++)
		GSMtext2 = GSMtext2 + "◦";

	let gsmLabel1 = stack.addText(GSMtext1);
	gsmLabel1.font = Font.semiboldSystemFont(10)
	gsmLabel1.textColor = new Color(colors.icons.default);
	let gsmLabel2 = stack.addText(GSMtext2);
	gsmLabel2.font = Font.semiboldSystemFont(10)
	gsmLabel2.textColor = new Color("#CCCCCC");
}

theme.drawStatusLights = function (widget, info_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.15);
	stack.setPadding(3, 3, 3, 3);
	stack.backgroundColor = new Color(colors.background_status);;
	stack.cornerRadius = 3;
	stack.centerAlignContent();

	let mapIcon = stack.addImage(this.getMapIcon());
	mapIcon.imageSize = scaleImage(mapIcon.image.size, 10)
	mapIcon.containerRelativeShape = true
	mapIcon.tintColor = new Color(colors.icons.default);

	let distance = stack.addText(" " + (last_track_data.distance / 1000).toFixed(1) + 'KM')
	distance.textColor = new Color(colors.icons.default);
	distance.font = Font.systemFont(10)
	distance.textOpacity = 1.0

	stack.addSpacer(null);
	let clockIcon = stack.addImage(this.getClockIcon());
	clockIcon.imageSize = scaleImage(mapIcon.image.size, 10)
	clockIcon.containerRelativeShape = true
	clockIcon.tintColor = new Color(colors.icons.default);

	let clock = stack.addText(" " + Math.round(last_track_data.ridingTime / 60) + "min")
	clock.textColor = new Color(colors.icons.default);
	clock.font = Font.systemFont(10)
	clock.textOpacity = 1.0

	stack.addSpacer(null);
	let batteryIcon = stack.addImage(this.getFlashIcon());
	batteryIcon.imageSize = scaleImage(mapIcon.image.size, 10)
	batteryIcon.containerRelativeShape = true
	batteryIcon.tintColor = new Color(colors.icons.default);

	let battery = stack.addText(" " + last_track_data.power_consumption + "%")
	battery.textColor = new Color(colors.icons.default);
	battery.font = Font.systemFont(10)
	battery.textOpacity = 1.0
}

{ // helper functions to draw things for status lights
	theme.getLockIcon = function () {
		return SFSymbol.named("lock.circle.fill").image;
	}

	theme.getMapIcon = function () {
		return SFSymbol.named("mappin.circle.fill").image;
	}

	theme.getClockIcon = function () {
		return SFSymbol.named("clock.fill").image;
	}

	theme.getFlashIcon = function () {
		return SFSymbol.named("bolt.circle.fill").image;
	}
}

theme.drawRangeInfo = function (widget, info_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.13);
	stack.centerAlignContent();
	stack.setPadding(3, 10, 0, 10);

	if (info_data.usable_battery_level > -1) {
		let batteryCurrentChargePercentTxt = "";
		if (info_data.battery_connected)
			batteryCurrentChargePercentTxt = stack.addText(info_data.usable_battery_level + "%")
		else
			batteryCurrentChargePercentTxt = stack.addText(info_data.centre_battery_level + "%")
		batteryCurrentChargePercentTxt.textColor = new Color(colors.text.primary);
		batteryCurrentChargePercentTxt.textOpacity = 0.6
		batteryCurrentChargePercentTxt.font = Font.systemFont(12)
		batteryCurrentChargePercentTxt.centerAlignText()
	}
	if (info_data.battery_range > -1) {
		stack.addSpacer(null)
		batteryCurrentCharge = "" + Math.floor(info_data.battery_range) + 'KM';
		if (batteryCurrentCharge.length > 0) {
			let batteryCurrentRangeTxt = stack.addText(batteryCurrentCharge)
			batteryCurrentRangeTxt.textColor = new Color(colors.text.primary);
			batteryCurrentRangeTxt.textOpacity = 0.6
			batteryCurrentRangeTxt.font = Font.systemFont(12)
			batteryCurrentRangeTxt.centerAlignText()
		}
	}

	if (info_data.scooter_state == "charging") {
		stack.addSpacer(null);

		// currently charging
		minutes = Math.round((info_data.time_to_charge - Math.floor(info_data.time_to_charge)) * 12) * 5;
		if (minutes < 10) { minutes = "0" + minutes }

		chargingSymbol = this.getChargerConnectedIcon();
		let scooterControlIconBolt = stack.addImage(chargingSymbol);
		scooterControlIconBolt.imageSize = scaleImage(chargingSymbol.size, 12);
		scooterControlIconBolt.tintColor = new Color(colors.text.primary);
		scooterControlIconBolt.imageOpacity = 0.8;

		let scooterChargeCompleteTime = stack.addText(" " + Math.floor(info_data.time_to_charge) + ":" + minutes);
		scooterChargeCompleteTime.textColor = new Color(colors.text.primary);
		scooterChargeCompleteTime.font = Font.systemFont(12);
		scooterChargeCompleteTime.textOpacity = 0.6;

		stack.setPadding(5, 5, 0, 5);
	}

}

{ // helper functions to draw things for range info
	theme.getChargerConnectedIcon = function () {
		lockSymbol = SFSymbol.named("bolt.circle.fill");
		return lockSymbol.image;
	}
}

theme.drawBatteryBar = function (widget, info_data, colors, widgetSize) {
	let stack = widget.addStack();
	stack.size = new Size(widgetSize.width, widgetSize.height * 0.15);
	stack.topAlignContent();
	stack.setPadding(3, 0, 0, 0);

	let batteryBarImg = stack.addImage(battery_bar.draw(info_data, colors, widgetSize));
	batteryBarImg.centerAlignImage()
}


var battery_bar = { // battery bar draw functions
	batteryPath: new Path(),
	batteryPathInset: new Path(),
	width: widgetSize.width - 6,
	height: 15,
	init: function () {
	},
	draw: function (info_data, colors, widgetSize) {
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
		if (info_data.scooter_state == "charging") {
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
		if (info_data.battery_connected) {
			let usable_battery_level = Number(info_data.usable_battery_level);
			availableCharge.size = new Size(this.width * usable_battery_level / 100, this.height);
			availableCharge.setFillColor(new Color(colors.battery.usable_charge));
		}
		else {
			let centre_battery_level = Number(info_data.centre_battery_level);
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

// Start processing our code (load the scooter data, then render)
let response = await loadNiuData()

addMapArea(); // after loading scooter data we can decide if we can display the map
addLastTrackMapArea();

if (response == "ok") {
	let widget = await createWidget(info_data, colors);
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

async function createWidget(info_data, colors) {
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
	await theme.draw(w, info_data, colors);

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

async function fetchScooterDetail(token, sn) {
	var req = await new Request('https://app-api.niu.com/v5/scooter/detail/' + sn);
	req.method = 'GET';
	req.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'User-Agent': 'manager/4.6.20 (iPhone; iOS 14.5.1; Scale/3.00);deviceName=Vxider-iPhone;timezone=Asia/Shanghai;model=iPhone13,2;lang=zh-CN;ostype=iOS;clientIdentifier=Domestic',
		'token': token
	};
	var json = await req.loadJSON();
	return json;
}

async function fetchInfoData(token) {
	var req = await new Request('https://app-api.niu.com/v3/motor_data/index_info?&sn=' + sn);
	req.method = 'GET';
	req.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 12_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148',
		'token': token
	};
	var json = await req.loadJSON();
	console.log("FetchInfoData:" + JSON.stringify(json));
	return json;
}

async function fetchLastTrackData(token) {
	var req = await new Request('https://app-api.niu.com/v5/track/list/v2');
	req.method = 'POST';
	req.headers = {
		'Content-Type': 'application/json',
		'User-Agent': 'manager/4.6.20 (iPhone; iOS 14.5.1; Scale/3.00);deviceName=Vxider-iPhone;timezone=Asia/Shanghai;model=iPhone13,2;lang=zh-CN;ostype=iOS;clientIdentifier=Domestic',
		'token': token
	};
	req.body = '{"sn":"' + sn + '","index":"0","token":"' + token + '","pagesize":1}';
	var json = await req.loadJSON();
	console.log("FetchLastTrackData:" + JSON.stringify(json));
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

function parseInfoData(json) {
	info_data.usable_battery_level = json.data.batteries.compartmentA.batteryCharging;
	info_data.battery_connected = json.data.batteries.compartmentA.isConnected;
	info_data.centre_battery_level = json.data.centreCtrlBattery;
	info_data.battery_range = json.data.estimatedMileage;
	info_data.is_charging = json.data.isCharging == 1;
	if (!info_data.battery_connected)
		info_data.scooter_state = "disconnected";
	else if (json.data.isFortificationOn == 1)
		info_data.scooter_state = "fortification_on";
	else if (json.data.isAccOn == 1)
		info_data.scooter_state = "acc_on";
	else
		info_data.scooter_state = "acc_off"
	info_data.gps = json.data.gps;
	info_data.gsm = Math.ceil(json.data.gsm / 2.5);
	info_data.fortification_on = (json.data.isFortificationOn == 1);
	info_data.time_to_charge = json.data.leftTime;
	info_data.longitude = json.data.postion.lng;
	info_data.latitude = json.data.postion.lat;
	info_data.lastTrack_ridingTime = json.data.lastTrack.ridingTime;
	info_data.lastTrack_distance = json.data.lastTrack.distance;

	let lastUpdate = new Date(json.data.time)
	let now = new Date()
	timeDiff = Math.round((Math.abs(now - lastUpdate)) / (1000 * 60))
	if (timeDiff < 60) {
		// been less than an hour since last update
		info_data.last_contact = timeDiff + "m ago"
	} else if (timeDiff < 1440) {
		info_data.last_contact = Math.floor(timeDiff / 60) + "h ago"
	} else {
		info_data.last_contact = Math.floor(timeDiff / 1440) + "d ago"
	}
	if (timeDiff / 60 > 2) {
		info_data.data_is_stale = true; // data is more than 2 hours old.
	}
}

function parseScooterDetail(json) {
	info_data.scooter_name = json.data.scooter_name;
}

function parseLastTrackData(json) {
	last_track_data.ridingTime = json.data.items[0].ridingtime;
	last_track_data.trackId= json.data.items[0].trackId;
	last_track_data.distance = json.data.items[0].distance;
	last_track_data.avespeed = json.data.items[0].avespeed;
	last_track_data.track_thumb = json.data.items[0].track_thumb;
	last_track_data.power_consumption = json.data.items[0].power_consumption;
}

async function loadNiuData() {

	if (username != null && username != "" && password != null && password != "" && sn != null && sn != "") {

		var backupManager = FileManager.local();
		var backupLocation = backupManager.joinPath(backupManager.cacheDirectory(), "niu_widget_last_updated.txt")

		try {
			var token = await loadToken();
			var infoJson = await fetchInfoData(token);
			if (infoJson.status == 1131) {
				token = await loadToken(true);
				infoJson = await fetchInfoData(token);
			}
			var lastTrackJSON = await fetchLastTrackData(token);
			var scooterDetailJSON = await fetchScooterDetail(token, sn);

			backupManager.writeString(backupLocation, JSON.stringify(infoJson));
			parseInfoData(infoJson);
			parseLastTrackData(lastTrackJSON);
			parseScooterDetail(scooterDetailJSON);
		} catch (e) {
			// offline, grab the backup copy
			if (backupManager.fileExists(backupLocation)) {
				var jsonImport = backupManager.readString(backupLocation);
				var infoJson = JSON.parse(jsonImport);
				parseInfoData(infoJson);
			}
			return e;
		}
	} else {
		niu_data = getSampleData();
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
		"scooter_name": 'Test',
		"data_is_stale": false, // if the data is especially old (> 2 hours)
		"usable_battery_level": 88,
		"centre_battery_level": 100,
		"battery_range": 104,
		"scooter_state": "Unknown",
		"fortification_on": true,
		"is_charging": false,
		"time_to_charge": 10000,
		"longitude": -1,
		"latitude": -1,
		"last_contact": "10m ago",
		"lastTrack_ridingTime": 0,
		"lastTrack_distance": 0,
		"battery_connected": true,
		"gps": 0,
		"gsm": 0
	}
}

function themeDebugArea() {
	// This is a working area for theme development (so errors will give you correct line numbers
	// Once you've finished, move your code to a JS file in the niu_data folder

}
