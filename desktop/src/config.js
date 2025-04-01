const Store = require('electron-store');

config = {
    store: new Store(),
    addFolder: (folder) => {
        config.store.set("folders", config.store.get("folders", []).concat(folder));
    },
    getFolders() {
        return config.store.get("folders", []);
    },
    removeFolder(folder_path) {
        config.store.set("folders", config.store.get("folders", []).filter(folder => folder.path !== folder_path));
    },
    addDocumentLog(document_log) {
        config.store.set("document_logs", config.store.get("document_logs", []).concat(document_log));
    },
    getDocumentLogs() {
        return config.store.get("document_logs", []);
    },
    resetDocumentLogs() {
        config.store.set("document_logs", []);
    },
    setFirstTime() {
        config.store.set("first_time", false);
    },
    isFirstTime() {
        return config.store.get("first_time", true);
    },
    setOpenAIKey(key) {
        config.store.set("open_ai_key", key);
    },
    getOpenAIKey() {
        return config.store.get("open_ai_key")
    }
}

module.exports = config;