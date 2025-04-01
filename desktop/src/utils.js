const { app } = require('electron');

function wasOpenedAtLogin() {
	// if mac os
	if (process.platform === "darwin"){
		let loginSettings = app.getLoginItemSettings();
		return loginSettings.wasOpenedAtLogin;
	}
	return app.commandLine.hasSwitch("hidden");
}

module.exports = {
	wasOpenedAtLogin
}