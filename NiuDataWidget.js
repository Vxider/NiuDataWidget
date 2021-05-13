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
	colors.text.primary = "#FFFFFF";
	colors.icons.default = "#FFFFFF";
	colors.map.type = "dark";
	colors.map.position = "CB4335";
}

battery_icon = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFcAAAAtCAYAAADbcffLAAADIUlEQVRoBe2bzWsTQRTA501WENRTEeoXCGKTNKmtCBUErdWr6LXpxVsP/gOCB73oTfSu3ork7s0PtO1FEYSaNG5E/ECpCm0vfoCH7D7fJiWks2/JdJlT9i2UzvzmzYP3IwyTzQwo5ik1x6cVYkWBOk3Dh+hvFxM2yOgvFfdNASxBCNWV4vJCmmKhd1L5Q/kIBvoesXO9POttQPVMg5qrFWqft+OiK7fsl08h6Ec0eWg7CTIUu64RL9aL9Ze2NbflFvyJwzkIX9OkvbYTMxq3Abnw5MrRlY829esoiMQ+oH8itr+xIVo27/cP60ToUvNYtL6et50gcWq67E+ctfHgKVQztCvgnn8K8JpqhdVGqfGTCxhUVnx3Yp/OtSq0Y7pFNe6M1QnBDLGFGDeAR2LPGKzTJbGNfP0uOzbg0B9984NKvDPqjwMA3jbLRQW8MyMwWnMPGKzTpU8syzMEIWw9TCj3YALfgiO5u7eQzU7WloJtOtjDxZusvVswofTdGBC5bjyyWUQuq8UNFLluPLJZRC6rxQ303KTJdhb6los9Br4rBfMqaF0XuT1WHDX3K4VXVc5Tsiw4MhpPg5dFbtyKKzIscl2pZPKIXEaKKyRyXZlk8ohcRoorJHJdmWTyiFxGiiskcl2ZZPKIXEaKKyRyXZmM51kVuXEpbgjivLy4caOyN0vnrVgY3BC5vVpSthuFGnvyQ5aFlEJtpolcG0spY0RuSnE200SujaWUMSI3pTibaZHc31xgqVEa5niWWL55nH4P4x78xVGTRXJpX8Y8njfL0EyhHRgkOIBVGxF0hBQW6RxqPhZMZ1NL78dVGHjVzSOVsZBBBdH5XIDWLALe5Gqk39EXOW4yaF+LUvjcHJB+soFQ45Q/Ul9KjuiM6Ebh7Qv69D7tFyjjXQOPbcRG0e3dQhDCHLXXutOlkWRgQ2u8kjRo8rbcZnH5C92xukSD62aA9LsG1sJQXaiP1D91SZ9GW24UE11eyyk1KUsEZwyfBKgn/dHaK240ibFvc8b8sSkEVdm8WBHd/WWP9iclHQD+h3ZQX5Hu/qLGqu0aa9b9HyijvIXRaGahAAAAAElFTkSuQmCC'

shield_icon = 'data:image/png;base64,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'
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
	scooter_img: "",
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
			let req = new Request(shield_icon)
			let lockIcon = await req.loadImage()
			var scooterState = stack.addImage(lockIcon);
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

theme.drawScooterInfo = async function (widget, info_data, colors) {
	let stack = widget.addStack();
	stack.centerAlignContent();
	stack.layoutHorizontally();


	let imageFileManager = FileManager.iCloud();
	var imageFile = imageFileManager.joinPath(imageFileManager.documentsDirectory(), 'niu_data/niu_scooter_img_' + sn + '.png');

	if (imageFileManager.fileExists(imageFile))
	{
		imageFileManager.downloadFileFromiCloud(imageFile);
		var imageContent = imageFileManager.readImage(imageFile);
	}
	else
	{
		var req = new Request(info_data.scooter_img);
		var imageContent = await req.loadImage();
		imageFileManager.writeImage(imageFile, imageContent);
	}

		let imageStack = stack.addImage(imageContent);
	}

	stack.addSpacer(null);

	var column_right = stack.addStack();
	column_right.layoutVertically();
	column_right.topAlignContent();

	let estimatedMileage = column_right.addStack();
	estimatedMileage.layoutHorizontally();
	estimatedMileage.addSpacer(null);
	estimatedMileageText.font = Font.boldMonospacedSystemFont(19);
	estimatedMileageText.textColor = new Color(colors.text.distance);
	estimatedMileageText.rightAlignText();

	column_right.addSpacer(3);

	let battery = column_right.addStack();
	battery.layoutHorizontally();
	battery.centerAlignContent();
	battery.addSpacer(null);
	if (info_data.is_charging)
	{
		var battery_image = SFSymbol.named("battery.100.bolt").image;
		var image_stack = battery.addImage(battery_image);
		image_stack.tintColor = new Color(colors.battery.charging);
		image_stack.imageSize = scaleImage(image_stack.image.size, 10)
		image_stack.rightAlignImage();
	}
	else if (info_data.battery_connected)
	{
		let req = new Request(battery_icon)
		let battery_image = await req.loadImage()
		let batteryImageContext = new DrawContext()
		batteryImageContext.opaque = true
		batteryImageContext.size = battery_image.size;
		batteryImageContext.setFillColor(new Color(colors.background));
		batteryImageContext.fillRect(new Rect(0, 0, battery_image.size.width, battery_image.size.height))
		batteryImageContext.drawImageAtPoint(battery_image, new Point(0, 0))
		batteryImageContext.setFillColor(new Color(colors.battery.default));

		var bar_width = (info_data.usable_battery_level / 100) * (battery_image.size.width - 28);
		batteryImageContext.fillRect(new Rect(10, 8, bar_width, battery_image.size.height - 17))

		var image_stack = battery.addImage(batteryImageContext.getImage());
		image_stack.imageSize = scaleImage(image_stack.image.size, 10)
		image_stack.rightAlignImage();
	}
	else
	{
		var battery_image = SFSymbol.named("minus.plus.batteryblock.fill").image;
		var image_stack = battery.addImage(battery_image);
		image_stack.tintColor = new Color(colors.battery.centreCtrl);
		image_stack.imageSize = scaleImage(image_stack.image.size, 10)
		image_stack.rightAlignImage();
	}
	
	if (info_data.battery_connected)
		var batteryText = battery.addStack().addText(' ' + Math.floor(info_data.usable_battery_level) + "%");
	else
		var batteryText = battery.addStack().addText(' ' + Math.floor(info_data.centre_battery_level) + "%");
	batteryText.font = Font.boldMonospacedSystemFont(12);
	batteryText.rightAlignText();
	if (info_data.is_charging)
		batteryText.textColor = new Color(colors.battery.charging)
	else if (info_data.battery_connected)
		batteryText.textColor = new Color(colors.battery.default)
	else
		batteryText.textColor = new Color(colors.battery.centreCtrl)

	column_right.addSpacer(1);
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

async function loadLastTrackData(token, from_local = true) {
	if (from_local)
	{
		let fileManager = FileManager.local();
		let file = fileManager.joinPath(fileManager.cacheDirectory(), 'niu_last_track_' + sn + '.dat');
		if (fileManager.fileExists(file))
			return fileManager.readString(file);
		else
			return loadLastTrackData(token, false);
	}
	else
	{
		var req = await new Request('https://app-api.niu.com/v5/track/list/v2');
		req.method = 'POST';
		req.headers = {
			'Content-Type': 'application/json',
			'User-Agent': 'manager/4.6.20 (iPhone; iOS 14.5.1; Scale/3.00);deviceName=Vxider-iPhone;timezone=Asia/Shanghai;model=iPhone13,2;lang=zh-CN;ostype=iOS;clientIdentifier=Domestic',
			'token': token
		};
		req.body = '{"sn":"' + sn + '","index":"0","token":"' + token + '","pagesize":1}';
		var json = await req.loadJSON();
		return json;
	}
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
	info_data.scooter_img = json.data.list_scooter_img;
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
			var lastTrackJSON = await loadLastTrackData(token, (infoJson.data.isAccOn == 1));
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
