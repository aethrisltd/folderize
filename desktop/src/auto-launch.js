let AutoLaunch = require('auto-launch');
let config = require("./config");
const { app } = require('electron');
const log = require('electron-log');

let autoLaunch = new AutoLaunch({
    name: "Folders.pro - AI Powered Documents Organizer",
    path: app.getPath('exe'),
    isHidden: true
});

function isAutoLaunchEnabled(){
    return autoLaunch.isEnabled();
}

async function setAutoLaunchValue(value){
    if(value){
        autoLaunch.enable();
        log.info("Auto launch enabled");
    }
    else {
        autoLaunch.disable();
        log.info("Auto launch disabled");
    }
}

function setAutoLaunch(){
    if(process.env['WEBPACK_SERVE'] !== 'true' && config.isFirstTime()){
        config.setAutoStartSettings(true);
        autoLaunch.enable();
        log.info("Auto launch enabled by default");
    }
}

module.exports = {
    setAutoLaunch,
    isAutoLaunchEnabled,
    setAutoLaunchValue
}