const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const path = require('path')
const { scanFonts, getFontInfo } = require('./font-scanner')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 640,
    title: '字体管理器',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      enableRemoteModule: false
    }
  })

  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

ipcMain.handle('scan-fonts', async () => {
  try {
    return await scanFonts()
  } catch (error) {
    return { error: error.message, fonts: [] }
  }
})

ipcMain.handle('get-font-info', async (_, fontPath) => {
  try {
    return await getFontInfo(fontPath)
  } catch (error) {
    return { error: error.message }
  }
})

ipcMain.handle('save-image-dialog', async () => {
  const result = await dialog.showSaveDialog(mainWindow, {
    title: '导出字体预览图片',
    defaultPath: path.join(app.getPath('pictures'), 'font-preview.png'),
    filters: [
      { name: 'PNG 图片', extensions: ['png'] },
      { name: 'JPEG 图片', extensions: ['jpg', 'jpeg'] }
    ]
  })
  return result
})
