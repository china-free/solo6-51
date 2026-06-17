const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  scanFonts: () => ipcRenderer.invoke('scan-fonts'),
  getFontInfo: (fontPath) => ipcRenderer.invoke('get-font-info', fontPath),
  saveImageDialog: (defaultName) => ipcRenderer.invoke('save-image-dialog', defaultName),
  saveImageFile: (data) => ipcRenderer.invoke('save-image-file', data)
})
