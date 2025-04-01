// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

const {contextBridge, ipcRenderer} = require('electron')
  
contextBridge.exposeInMainWorld('myAPI', {
  selectFolder: () => ipcRenderer.invoke('dialog:openDirectory'),
  addFolder: folder => ipcRenderer.invoke('addFolder', folder),
  getFolders: () => ipcRenderer.invoke('getFolders'),
  removeFolder: folder_path => ipcRenderer.invoke('removeFolder', folder_path),
  closeTray: () => ipcRenderer.send('closeTray'),
  processDocuments: document_path => ipcRenderer.invoke('processDocuments', document_path),
  quit: () => ipcRenderer.send('quit'),
  openSettings: () => ipcRenderer.send('openSettings'),
  focusFolder: folder_path => ipcRenderer.invoke('focusFolder', folder_path),
  getDocumentLogs: () => ipcRenderer.invoke('getDocumentLogs'),
  resetDocumentLogs: () => ipcRenderer.invoke('resetDocumentLogs'),
  openLogWindow: () => ipcRenderer.invoke('openLogWindow'),
  getPathSeparator: () => ipcRenderer.invoke('getPathSeparator'),
  getMainWindowUrl: () => ipcRenderer.invoke('getMainWindowUrl'),
  returnToMainWindow: () => ipcRenderer.invoke('returnToMainWindow'),
  setAutoLaunch: value => ipcRenderer.invoke('setAutoLaunch', value),
  isAutoLaunchEnabled: () => ipcRenderer.invoke('isAutoLaunchEnabled'),
  setOpenAIKey: (value) => ipcRenderer.invoke("setOpenAIKey", value),
  getOpenAIKey: () => ipcRenderer.invoke("getOpenAIKey"),
  handle: (channel, callable) => ipcRenderer.on(channel, (event, data) => callable(event, data))
});
