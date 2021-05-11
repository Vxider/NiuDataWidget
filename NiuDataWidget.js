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
	var is_dark_mode_working = true;
}

var mapKey = "";
var useGoogleMaps = false;

// set up all the colors we want to use
var colors = {
	background: "#dddddd",
	background_status: "#ffffff33",
	text: {
		primary: "#333333cc",
		distance: "#333333"
	},
	battery: {
		charging: "#ddbb22",
		centreCtrl: "#FF0000",
		default: "#2BD82E"
	},
	icons: {
		default: "#33333399",
		locked: "#0080FF",
		acc_on: "#00CC00"
	},
	map: {
		type: "light", // light or dark
		position: "222222" // hex without the #
	}
}

if (Device.isUsingDarkAppearance() && is_dark_mode_working) {
	colors.background = "#333333";
	colors.text.distance = "#FFFFFF";
	colors.text.primary = "#ffffff";
	colors.icons.default = "#ffffff";
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

var theme = {
	small: {
		available: true,
		init: function () {

		},
		draw: async function (widget, info_data, colors) {
			widget.setPadding(10, 10, 10, 10)
			widget.backgroundColor = new Color(colors.background)
			theme.drawScooterStatus(widget, info_data, colors);
			theme.drawScooterInfo(widget, info_data, colors);
			theme.drawLastTrack(widget, last_track_data, colors, true);
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
			column_left.setPadding(5, 5, 5, 5);
			column_left.layoutVertically();

			theme.drawScooterStatus(column_left, info_data, colors);
			theme.drawScooterInfo(column_left, info_data, colors);
			column_left.addSpacer(null);
			theme.drawLastTrack(column_left, last_track_data, colors, false);

			let center_padding = body.addSpacer(10);
			let column_right = body.addStack();

			var mapImage;

			configFilePath = 'niu_last_track_id_' + sn + '.data';
			imageFilePath = 'niu_last_track_thumb_' + sn + '.png';

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
				var req = new Request(last_track_data.track_thumb);
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
			column_left.layoutVertically();
			column_left.setPadding(5, 5, 5, 5);

			theme.drawScooterStatus(column_left, info_data, colors);
			theme.drawScooterInfo(column_left, info_data, colors);
			theme.drawLastTrack(column_left, last_track_data, colors, false);

			let center_padding = body.addSpacer(10);
			let column_right = body.addStack();
			var mapImage;

			roundedLat = Math.round(info_data.latitude * 2000) / 2000;
			roundedLong = Math.round(info_data.longitude * 2000) / 2000;
			storedFile = "niu_widget_map_" + roundedLat * 2000 + "_" + roundedLong * 2000 + ".image";

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

theme.drawScooterStatus = function (widget, info_data, colors) {
	let stack = widget.addStack();
	stack.topAlignContent();
	stack.setPadding(0, 6, 0, 6);
	// stack.layoutVertically();

	var column_left = stack.addStack();
	column_left.layoutVertically();

	let scooterName = column_left.addText(info_data.scooter_name);
	scooterName.textColor = new Color(colors.text.primary);
	scooterName.centerAlignText()
	scooterName.font = Font.semiboldSystemFont(12)
	scooterName.minimumScaleFactor = 0.5

	let signal_info = column_left.addStack();
	signal_info.layoutHorizontally();
	signal_info.setPadding(3, 0, 3, 0);

	var GPStext1 = "GPS";
	for (i = 0; i < info_data.gps && i < 5; i++)
		GPStext1 = GPStext1 + "•";
	var GPStext2 = '';
	for (i = info_data.gps; i < 5; i++)
		GPStext2 = GPStext2 + "◦";

	let gpsLabel1 = signal_info.addText(GPStext1)
	gpsLabel1.font = Font.boldMonospacedSystemFont(8)
	gpsLabel1.textColor = new Color(colors.text.primary);
	let gpsLabel2 = signal_info.addText(GPStext2)
	gpsLabel2.font = Font.boldMonospacedSystemFont(8)
	gpsLabel2.textColor = new Color("#CCCCCC");

	var GSMtext1 = "GSM";
	for (i = 0; i < info_data.gsm && i < 5; i++)
		GSMtext1 = GSMtext1 + "•";
	var GSMtext2 = "";
	for (i = info_data.gsm; i < 5; i++)
		GSMtext2 = GSMtext2 + "◦";

	let gsmLabel1 = signal_info.addText(' ' + GSMtext1);
	gsmLabel1.font = Font.boldMonospacedSystemFont(8);
	gsmLabel1.textColor = new Color(colors.text.primary);
	let gsmLabel2 = signal_info.addText(GSMtext2);
	gsmLabel2.font = Font.boldMonospacedSystemFont(8);
	gsmLabel2.textColor = new Color("#CCCCCC");

	stack.addSpacer(null)
	switch (info_data.scooter_state) {
		case "fortification_on": {
			lockIcon = this.getLockIcon();
			var scooterState = stack.addImage(lockIcon);
			scooterState.tintColor = new Color(colors.icons.locked);
			scooterState.imageSize = scaleImage(lockIcon.size, 22);
			scooterState.rightAlignImage();
			break;
		}
		case "acc_off": {
			idlingIcon = this.getPowerIcon(colors);
			var scooterState = stack.addImage(idlingIcon);
			scooterState.tintColor = new Color(colors.icons.default);
			scooterState.imageSize = scaleImage(idlingIcon.size, 22);
			scooterState.rightAlignImage();
			break;
		}
		case "acc_on": {
			let drivingIcon = SFSymbol.named("power").image;
			var scooterState = stack.addImage(drivingIcon);
			scooterState.tintColor = new Color(colors.icons.acc_on);
			scooterState.imageSize = scaleImage(drivingIcon.size, 22);
			scooterState.rightAlignImage();
			break;
		}
		case "disconnected": {
			let disconnectIcon = SFSymbol.named("bolt.slash.fill").image;
			var scooterState = stack.addImage(disconnectIcon);
			scooterState.tintColor = new Color(colors.battery.centreCtrl);
			scooterState.imageSize = scaleImage(disconnectIcon.size, 22);
			scooterState.rightAlignImage();
			break;
		}
		default: {
		}
	}
}

theme.drawScooterInfo = function (widget, info_data, colors) {
	let stack = widget.addStack();
	stack.centerAlignContent();
	stack.layoutHorizontally();

	let imageFileManager = FileManager.local();
	var imageFile = imageFileManager.joinPath(imageFileManager.cacheDirectory(), 'niu_scooter_img_' + sn + '.image');
	if (imageFileManager.fileExists(imageFile))
	{
		var imageContent = imageFileManager.readImage(imageFile);
		let imageStack = stack.addImage(imageContent);
	}

	stack.addSpacer(null);

	var column_right = stack.addStack();
	column_right.layoutVertically();
	column_right.topAlignContent();

	let estimatedMileage = column_right.addStack();
	estimatedMileage.layoutHorizontally();
	estimatedMileage.addSpacer(null);
	let estimatedMileageText = estimatedMileage.addStack().addText(Math.floor(info_data.battery_range) + "KM");
	estimatedMileageText.font = Font.boldMonospacedSystemFont(20);
	estimatedMileageText.textColor = new Color(colors.text.distance);
	estimatedMileageText.rightAlignText();

	column_right.addSpacer(5);

	let battery = column_right.addStack();
	battery.layoutHorizontally();
	battery.addSpacer(null);
	if (info_data.is_charging)
	{
		var battery_image = SFSymbol.named("battery.100.bolt").image;
		var image_stack = battery.addImage(battery_image);
		image_stack.tintColor = new Color(colors.battery.charging);
		image_stack.imageSize = scaleImage(image_stack.image.size, 12)
		image_stack.rightAlignImage();
	}
	else if (info_data.battery_connected)
	{
		if (info_data.usable_battery_level > 50)
			var battery_image = SFSymbol.named("battery.100").image;
		else 
			var battery_image = SFSymbol.named("battery.25").image;
		var image_stack = battery.addImage(battery_image);
		image_stack.tintColor = new Color(colors.battery.default);
		image_stack.imageSize = scaleImage(image_stack.image.size, 12)
		image_stack.rightAlignImage();
	}
	else
	{
		var battery_image = SFSymbol.named("minus.plus.batteryblock.fill").image;
		var image_stack = battery.addImage(battery_image);
		image_stack.tintColor = new Color(colors.battery.centreCtrl);
		image_stack.imageSize = scaleImage(image_stack.image.size, 12)
		image_stack.rightAlignImage();
	}
	
	if (info_data.battery_connected)
		var batteryText = battery.addStack().addText('  ' + Math.floor(info_data.usable_battery_level) + "%");
	else
		var batteryText = battery.addStack().addText('  ' + Math.floor(info_data.centre_battery_level) + "%");
	batteryText.font = Font.boldMonospacedSystemFont(12);
	batteryText.rightAlignText();
	if (info_data.is_charging)
		batteryText.textColor = new Color(colors.battery.charging)
	else if (info_data.battery_connected)
		batteryText.textColor = new Color(colors.battery.default)
	else
		batteryText.textColor = new Color(colors.battery.centreCtrl)

	column_right.addSpacer(null);
	if (info_data.last_contact.length > 0) {
		let lastUpdate = column_right.addStack();
		lastUpdate.layoutHorizontally();
		lastUpdate.addSpacer(null);
		let lastUpdateText = lastUpdate.addStack().addText(info_data.last_contact)
		lastUpdateText.textColor = new Color(colors.text.primary);
		lastUpdateText.textOpacity = 0.6
		lastUpdateText.font = Font.systemFont(12)
		lastUpdateText.rightAlignText()
	}
	column_right.addSpacer(10);
}

theme.drawLastTrack = function (widget, last_track_data, colors, is_small) {
	let stack = widget.addStack();
	stack.setPadding(3, 5, 3, 5);
	stack.backgroundColor = new Color(colors.background_status);;
	stack.cornerRadius = 5;
	stack.centerAlignContent();

	let mapIcon = stack.addImage(this.getMapIcon());
	mapIcon.imageSize = scaleImage(mapIcon.image.size, 8)
	mapIcon.tintColor = new Color(colors.icons.default);

	let distance = stack.addText((last_track_data.distance / 1000).toFixed(1) + 'KM')
	distance.textColor = new Color(colors.text.primary);
	distance.font = Font.systemFont(10)

	stack.addSpacer(null);
	let clockIcon = stack.addImage(this.getClockIcon());
	clockIcon.imageSize = scaleImage(clockIcon.image.size, 8)
	clockIcon.tintColor = new Color(colors.icons.default);

	if(is_small)
		var clock = stack.addText(Math.round(last_track_data.ridingTime / 60) + "m")
	else
		var clock = stack.addText(Math.round(last_track_data.ridingTime / 60) + "min")
	clock.textColor = new Color(colors.text.primary);
	clock.font = Font.systemFont(10)

	stack.addSpacer(null);
	let batteryIcon = stack.addImage(this.getFlashIcon());
	batteryIcon.imageSize = scaleImage(batteryIcon.image.size, 8)
	batteryIcon.tintColor = new Color(colors.icons.default);

	let battery = stack.addText(last_track_data.power_consumption + "%")
	battery.textColor = new Color(colors.text.primary);
	battery.font = Font.systemFont(10)
}

{ // helper functions to draw things for status lights
	theme.getLockIcon = function () {
		return SFSymbol.named("lock.circle.fill").image;
	}

	theme.getMapIcon = function () {
		return SFSymbol.named("location.circle.fill").image;
	}

	theme.getClockIcon = function () {
		return SFSymbol.named("clock.fill").image;
	}

	theme.getFlashIcon = function () {
		return SFSymbol.named("bolt.circle.fill").image;
	}
}

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
	var req = new Request('https://app-api.niu.com/v5/scooter/detail/' + sn);
	req.method = 'GET';
	req.headers = {
		'Content-Type': 'application/x-www-form-urlencoded',
		'User-Agent': 'manager/4.6.20 (iPhone; iOS 14.5.1; Scale/3.00);deviceName=Vxider-iPhone;timezone=Asia/Shanghai;model=iPhone13,2;lang=zh-CN;ostype=iOS;clientIdentifier=Domestic',
		'token': token
	};
	var json = await req.loadJSON();
	console.log(JSON.stringify(json));
	return json;
}

async function fetchInfoData(token) {
	var req = new Request('https://app-api.niu.com/v3/motor_data/index_info?&sn=' + sn);
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

async function parseScooterDetail(json) {
	info_data.scooter_name = json.data.scooter_name;

	let imageFileManager = FileManager.local();
	var imageFile = imageFileManager.joinPath(imageFileManager.cacheDirectory(), 'niu_scooter_img_' + sn + '.image');
	if (!imageFileManager.fileExists(imageFile))
	{
		var req = new Request(json.data.index_scooter_img);
		var imageContent = await req.loadImage();
		imageFileManager.writeImage(imageFile, imageContent);
	}
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
		var backupLocation = backupManager.joinPath(backupManager.cacheDirectory(), 'niu_widget_last_updated_' + sn + '.txt')

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
			await parseScooterDetail(scooterDetailJSON);
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
