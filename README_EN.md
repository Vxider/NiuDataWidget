# NiuData Widget

[[English](README_EN.md)] [[中文](README.md)]

A Scriptable widget to display and control NIU electric scooter data on your iPhone. 

<img src="screenshots/screen_001.jpg" width="400" />
<img src="screenshots/screen_002.jpg" width="200" />
<img src="screenshots/screen_003.jpg" width="400" />

## Usage
### Install

* Get Scriptable in the Apple App Store.
* Download the `NiuDataWidget.js` file to your `iCloud/Scriptable` folder (or create a new widget in the scriptable app).
* Fill `username`, `password`, and `sn` in `NiuDataWidget.js`
    * Set password to `md5(password)`.
* Use the following shortcuts to enable remote control
    * [ACC ON](https://www.icloud.com/shortcuts/25ea79d45bb84aa1a9b45a3c70ac61a6)
    * [ACC OFF](https://www.icloud.com/shortcuts/77fb596c05214521a0faa687e3f113b2)
    * [Fortification ON](https://www.icloud.com/shortcuts/003cff2ec216426da2275722a342d702)
    * [Fortification OFF](https://www.icloud.com/shortcuts/3f09f3a99f21421ca95fa479d9df849b)

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
* Dark theme
    * Automatically switch to the dark theme when the device is using a dark appearance.
      Set `is_dark_mode_working = false` to always use white theme.

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
* Remote control

## Special Thanks

Special thanks to [DrieStone](https://github.com/DrieStone). This project used
part of the code of
[TeslaData-Widget](https://github.com/DrieStone/TeslaData-Widget).
