const { app, BrowserWindow, ipcMain } = require("electron");
if (require("electron-squirrel-startup"))
	app.quit();

const { startUp, createMainWindow} = require("./window");
const handleAPIEvents = require("./api_events");

app.on("ready", startUp);
app.on("window-all-closed", () => {
	if(process.platform !== "darwin")
		app.dock.hide();
	
	BrowserWindow.getAllWindows().forEach((win) => win.close());
});

app.on("activate", () => {
	if (BrowserWindow.getAllWindows().length === 0) 
		createMainWindow();
	else 
		BrowserWindow.getAllWindows()[0].focus();
});


handleAPIEvents(ipcMain, app);
