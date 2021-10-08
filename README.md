# NiuData Widget

[[English](README.md)] [[中文](README_CN.md)]

A Scriptable widget to display NIU electric scooter data on your iPhone. 

<img src="screenshots/screen_001.jpg" width="400" />
<img src="screenshots/screen_002.jpg" width="400" />

## Usage
### Install

* Get Scriptable in the Apple App Store.
* Download the `NiuDataWidget.js` file to your `iCloud/Scriptable` folder (or create a new widget in the scriptable app).
* Fill `username`, `password`, and `sn` in `NiuDataWidget.js`
    * Set password to `md5(password)`.

```
var username = "";
var password = "";
var sn = "";
```

### Optional/Advanced
* Get a [map API key from MapQuest](https://developer.mapquest.com/) and add it to your `NiuDataWidget.js` file.
* If you do not want the map area, config the `NiuDataWidget.js` file as follows
    * `var show_last_track_map = false`
    * `var hide_map = true`
* If you want the map area to display the location, config the `NiuDataWidget.js` file as follows
    * `var show_last_track_map = false`
    * `var hide_map = false`
* If you want the map area to display the last track, config the `NiuDataWidget.js` file as follows
    * `var show_last_track_map = true`
    * `var hide_map = true`

## Features

This widget support:
* charging overview (current charge and time until charge complete)
* locked/unlocked
* acc on/off
* GPS && GSM signal
* battery connect indicator, display centre control battery if battery disconnected
* time since the data was retreived from the car
* map location of the current position
* last track information

## Special Thanks

Special thanks to [DrieStone](https://github.com/DrieStone). This project used
part of the code of
[TeslaData-Widget](https://github.com/DrieStone/TeslaData-Widget).
