const { dialog, shell } = require("electron");
const config = require("./config");
const { processDocuments } = require("./file_processor");
const { openSettings, createLogWindow } = require("./window");
const path = require("path");
const globals = require("./globals");
let { setAutoLaunchValue, isAutoLaunchEnabled } = require("./auto-launch");

function handleAPIEvents(ipcMain, app){
    ipcMain.handle("dialog:openDirectory", async () => {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ["openDirectory"],
        });
        if (canceled)
            return;
        return filePaths[0];
    });
    
    ipcMain.handle("addFolder", async (event, folder) => {
        config.addFolder(folder);
    });
    
    ipcMain.handle("getFolders", async () => {
        return config.getFolders();
    });
    
    ipcMain.handle("removeFolder", async (event, folder_path) => {
        config.removeFolder(folder_path);
    });

    ipcMain.handle("processDocuments", async (event, documents_paths) => {
        const results = await processDocuments(documents_paths)
        console.table(results);
        return results;
    });

    ipcMain.on("openSettings", async () => {
        openSettings();
    });

    ipcMain.handle("openLogWindow", async () => {
        createLogWindow();
    });

    ipcMain.handle("getOpenAIKey", async () => {
        return config.getOpenAIKey();
    });

    ipcMain.handle("setOpenAIKey", async (event, value) => {
        return config.setOpenAIKey(value);
    });

    ipcMain.on("quit", () => {
        app.quit();
    })

    ipcMain.handle("focusFolder", async (event, folder_path) => {
        shell.showItemInFolder(folder_path);
    });

    ipcMain.handle("getDocumentLogs", async () => {
        return config.getDocumentLogs();
    });

    ipcMain.handle("resetDocumentLogs", async () => {
        config.resetDocumentLogs();
    });

    ipcMain.handle("getPathSeparator", () => {
        return path.sep;
    });

    ipcMain.handle("getMainWindowUrl", () => {
        return MAIN_WINDOW_WEBPACK_ENTRY;
    });

    ipcMain.handle("returnToMainWindow", async () => {
        globals.main_window.loadURL(MAIN_WINDOW_WEBPACK_ENTRY);
    });

    ipcMain.handle("setAutoLaunch", async (event, value) => {
        setAutoLaunchValue(value);
    });

    ipcMain.handle("isAutoLaunchEnabled", async () => {
        return isAutoLaunchEnabled();
    });
}

module.exports = handleAPIEvents; 