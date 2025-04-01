const { app, BrowserWindow, Tray, nativeImage, ipcMain } = require("electron");
const path = require("path");
const TrayWindow = require("./lib/electron-tray");
const config = require("./config");
let globals = require("./globals");
const { setAutoLaunch } = require("./auto-launch");    
const log = require('electron-log');

ipcMain.on("closeTray", () => {
	globals.tray_window.hide();
});


async function startUp(){
	log.info("Starting up the app");
	const gotTheLock = app.requestSingleInstanceLock();
	if (!gotTheLock) {
		log.info("Another instance of the app is already running. This instance will be closed.");
		app.quit()
		return;
	}
	else {
		app.on('second-instance', (event, commandLine, workingDirectory) => {
			// Listen to the event when someone tries to run a second instance, we should focus our window.
			if (globals.main_window) {
				if (globals.main_window.isMinimized()) globals.main_window.restore();
				globals.main_window.focus();
				log.info("Another instance of the app was opened. Focusing the main window.");
			}
		});
	}
	log.info("Got lock");


	// setAutoLaunch();

	let tray = createTray();
	createTrayWindow(tray);
	log.info("Is first time:"+ config.isFirstTime());
	config.setFirstTime();
	globals.tray_window.on("hide", hideDockIfNeeded);
	

}

function createMainWindow(){
	if (globals.main_window){
		globals.main_window.focus();
		return;
	}

    globals.main_window = new BrowserWindow({
		width: 960,
		height: 720,
		webPreferences: {
			preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
			partition: 'persist:data'
		},
		titleBarStyle: 'hidden',
		titleBarOverlay: {
			color: '#121212',
			symbolColor: '#74b1be',
		},
		autoHideMenuBar: true,
	});	

	globals.main_window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
	globals.main_window.on("closed", () => {
		globals.main_window = null;
		hideDockIfNeeded();
	});
	globals.main_window.on("hide", hideDockIfNeeded);
}

function openSettings(){
	// if main window has not been destoryed, focus it. if not create it
	if(globals.main_window){
		globals.main_window.focus();
		return;
	}
	createMainWindow();
}

function createTray() {
	// if macos, create a tray icon
	let tray_icon;
	if (process.platform === "darwin") {
		tray_icon = nativeImage.createFromPath(path.join(__dirname, "icons", "TrayTemplate.png"));
	}
	else {
		tray_icon = nativeImage.createFromPath(path.join(__dirname, "icons", "WindowsTrayTemplate.png"));
	}

	tray_icon.setTemplateImage(true);
	let tray = new Tray(tray_icon);
	return tray;
}

function createTrayWindow(tray) {
	globals.tray_window = new BrowserWindow({
		width: 340,
		height: 405,
		maxWidth: 340,
		maxHeight: 405,
		show: false,
		frame: false,
		fullscreenable: false,
		resizable: false,
		useContentSize: true,
		transparent: true,
		alwaysOnTop: true,
		webPreferences: {
			preload: TRAY_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: path.join(__dirname, "icons", "icon.png")
	});
	globals.tray_window.setMenu(null);
	globals.tray_window.loadURL(TRAY_WINDOW_WEBPACK_ENTRY);

	setTimeout(function () {
		TrayWindow.setOptions({
			trayIconPath: path.join(__dirname, "icons", "icon.png"),
			window: globals.tray_window,
			tray: tray
		});
	}, process.platform === "linux" ? 200 : 10);
}

function hideDockIfNeeded(){
	if(!any_window_open())
		hideDock();
}

function any_window_open(){
	let any_window_open = false;
	let windows = BrowserWindow.getAllWindows();

	for(let i = 0; i < windows.length; i++){
		if(windows[i].isVisible())
			any_window_open=true;
	}
	return any_window_open;
}

function hideDock(){
	if(process.platform == "darwin")
		app.dock.hide();
}

function createLogWindow(){
	if(globals.log_window){
		globals.log_window.focus();
		return;
	}

	globals.log_window = new BrowserWindow({
		width: 800,
		height: 600,
		autoHideMenuBar: true,
		webPreferences: {
			preload: LOG_WINDOW_PRELOAD_WEBPACK_ENTRY,
		},
		icon: path.join(__dirname, "icons", "icon.png")
	});

	globals.log_window.loadURL(LOG_WINDOW_WEBPACK_ENTRY);
	globals.log_window.on("closed", () => {
		globals.log_window = null;
	});
}

module.exports = {
    startUp,
    createMainWindow,
    createTray,
	hideDockIfNeeded,
	openSettings,
	createLogWindow
}