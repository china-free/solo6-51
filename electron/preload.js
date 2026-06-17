const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  scanFonts: () => ipcRenderer.invoke('scan-fonts'),
  getFontInfo: (fontPath) => ipcRenderer.invoke('get-font-info', fontPath),
  saveImageDialog: () => ipcRenderer.invoke('save-image-dialog')
})
