const fs = require('fs')
const path = require('path')
const opentype = require('opentype.js')

const FONT_EXTENSIONS = ['.ttf', '.otf', '.ttc', '.woff', '.woff2']

function getSystemFontDirs() {
  const dirs = []
  const platform = process.platform

  if (platform === 'win32') {
    dirs.push(path.join(process.env.WINDIR || 'C:\\Windows', 'Fonts'))
    if (process.env.LOCALAPPDATA) {
      dirs.push(path.join(process.env.LOCALAPPDATA, 'Microsoft', 'Windows', 'Fonts'))
    }
  } else if (platform === 'darwin') {
    dirs.push('/System/Library/Fonts')
    dirs.push('/Library/Fonts')
    dirs.push(path.join(process.env.HOME || '~', 'Library', 'Fonts'))
  } else {
    dirs.push('/usr/share/fonts')
    dirs.push('/usr/local/share/fonts')
    dirs.push(path.join(process.env.HOME || '~', '.fonts'))
    dirs.push(path.join(process.env.HOME || '~', '.local', 'share', 'fonts'))
  }

  return dirs.filter(dir => fs.existsSync(dir))
}

function walkDir(dir, extensions) {
  const results = []
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name)
      try {
        if (entry.isDirectory()) {
          results.push(...walkDir(fullPath, extensions))
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (extensions.includes(ext)) {
            results.push(fullPath)
          }
        }
      } catch (e) {
      }
    }
  } catch (e) {
  }
  return results
}

function classifyFont(fontInfo) {
  const name = (fontInfo.familyName || fontInfo.postScriptName || '').toLowerCase()
  const style = (fontInfo.styleName || '').toLowerCase()
  const fullName = `${name} ${style}`

  const monoKeywords = ['mono', 'monospace', 'monospaced', '等宽', '固定', 'fixed', 'console', 'code', 'courier', 'source code']
  const serifKeywords = ['serif', '衬线', '宋体', '明体', '明朝', 'mincho', 'ming', 'times', 'garamond', 'georgia']
  const handKeywords = [
    'hand', 'handwriting', 'handwritten', 'script', 'cursive', 'brush', '手写', '书法', '楷书', '行书', '草书',
    'brush', 'brush script', 'kaiti', 'xingshu', 'caoshu', 'stkaiti'
  ]
  const sansKeywords = ['sans', 'sans-serif', 'sansserif', '非衬线', '无衬线', '黑体', '雅黑', 'hei', 'arial', 'helvetica', 'verdana', 'tahoma']

  for (const kw of monoKeywords) {
    if (fullName.includes(kw)) return 'monospace'
  }
  for (const kw of handKeywords) {
    if (fullName.includes(kw)) return 'handwriting'
  }
  for (const kw of serifKeywords) {
    if (fullName.includes(kw)) return 'serif'
  }
  for (const kw of sansKeywords) {
    if (fullName.includes(kw)) return 'sans-serif'
  }

  if (fontInfo.isMonospaced) return 'monospace'

  const panose = fontInfo.panose
  if (panose && panose.familyKind) {
    const fk = panose.familyKind
    if (fk === 2 || fk === 3 || fk === 4) return 'text'
    if (fk === 5) return 'handwriting'
    if (fk === 6 || fk === 7) return 'decorative'
    if (fk === 9) return 'monospace'
  }

  return 'sans-serif'
}

function getFontType(ext) {
  const map = {
    '.ttf': 'TrueType',
    '.otf': 'OpenType',
    '.ttc': 'TrueType Collection',
    '.woff': 'Web Open Font Format',
    '.woff2': 'Web Open Font Format 2.0'
  }
  return map[ext.toLowerCase()] || 'Unknown'
}

function extractFontInfoFromBuffer(buffer, filePath) {
  try {
    const font = opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength))
    const names = font.names

    const familyName = (names.fontFamily && (names.fontFamily.en || names.fontFamily.zh || Object.values(names.fontFamily)[0])) || path.basename(filePath, path.extname(filePath))
    const styleName = (names.fontSubfamily && (names.fontSubfamily.en || names.fontSubfamily.zh || Object.values(names.fontSubfamily)[0])) || 'Regular'
    const postScriptName = (names.postScriptName && (names.postScriptName.en || Object.values(names.postScriptName)[0])) || familyName
    const fullName = (names.fullName && (names.fullName.en || names.fullName.zh || Object.values(names.fullName)[0])) || `${familyName} ${styleName}`
    const version = (names.version && (names.version.en || Object.values(names.version)[0])) || ''

    const ext = path.extname(filePath)
    const fontType = getFontType(ext)

    let isMonospaced = false
    let panose = null

    if (font.tables && font.tables.os2) {
      const os2 = font.tables.os2
      if (os2.sFamilyClass) {
        const classId = (os2.sFamilyClass >> 8) & 0xff
        const subclassId = os2.sFamilyClass & 0xff
        if (classId === 9) isMonospaced = true
      }
      if (os2.panose) {
        panose = {
          familyKind: os2.panose[0],
          serifStyle: os2.panose[1],
          weight: os2.panose[2],
          proportion: os2.panose[3],
          contrast: os2.panose[4],
          strokeVariation: os2.panose[5],
          armStyle: os2.panose[6],
          letterform: os2.panose[7],
          midline: os2.panose[8],
          xHeight: os2.panose[9]
        }
        if (panose.proportion === 9) isMonospaced = true
      }
    }

    const fontInfo = {
      familyName,
      styleName,
      postScriptName,
      fullName,
      version,
      filePath,
      fontType,
      extension: ext.toLowerCase(),
      isMonospaced,
      panose
    }

    fontInfo.category = classifyFont(fontInfo)

    return fontInfo
  } catch (e) {
    return {
      familyName: path.basename(filePath, path.extname(filePath)),
      styleName: 'Regular',
      postScriptName: path.basename(filePath, path.extname(filePath)),
      fullName: path.basename(filePath),
      version: '',
      filePath,
      fontType: getFontType(path.extname(filePath)),
      extension: path.extname(filePath).toLowerCase(),
      isMonospaced: false,
      panose: null,
      category: 'sans-serif',
      parseError: e.message
    }
  }
}

async function scanFonts() {
  const fontDirs = getSystemFontDirs()
  const allFontFiles = []
  const seenPaths = new Set()

  for (const dir of fontDirs) {
    const files = walkDir(dir, FONT_EXTENSIONS)
    for (const f of files) {
      const normalized = f.toLowerCase()
      if (!seenPaths.has(normalized)) {
        seenPaths.add(normalized)
        allFontFiles.push(f)
      }
    }
  }

  const fonts = []
  const batchSize = 50

  for (let i = 0; i < allFontFiles.length; i += batchSize) {
    const batch = allFontFiles.slice(i, i + batchSize)
    for (const fontFile of batch) {
      try {
        const stat = fs.statSync(fontFile)
        if (stat.size > 50 * 1024 * 1024) continue

        const buffer = fs.readFileSync(fontFile)
        if (fontFile.toLowerCase().endsWith('.ttc')) {
          try {
            const fontsInCollection = parseTTC(buffer, fontFile)
            fonts.push(...fontsInCollection)
          } catch {
            const info = extractFontInfoFromBuffer(buffer, fontFile)
            if (info) fonts.push(info)
          }
        } else {
          const info = extractFontInfoFromBuffer(buffer, fontFile)
          if (info) fonts.push(info)
        }
      } catch (e) {
      }
    }
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  fonts.sort((a, b) => a.familyName.localeCompare(b.familyName, 'zh-CN'))
  return { count: fonts.length, fonts }
}

function parseTTC(buffer, filePath) {
  const fonts = []
  try {
    let offset = 0
    const dv = new DataView(buffer.buffer, buffer.byteOffset, buffer.byteLength)
    const tag = String.fromCharCode(
      dv.getUint8(offset), dv.getUint8(offset + 1),
      dv.getUint8(offset + 2), dv.getUint8(offset + 3)
    )

    if (tag === 'ttcf') {
      const majorVersion = dv.getUint16(offset + 4)
      const minorVersion = dv.getUint16(offset + 6)
      const numFonts = dv.getUint32(offset + 8)

      for (let i = 0; i < numFonts && i < 5; i++) {
        const fontOffset = dv.getUint32(offset + 12 + i * 4)
        const sliced = buffer.slice(fontOffset)
        try {
          const info = extractFontInfoFromBuffer(sliced, filePath)
          if (info) {
            info.fontIndex = i
            fonts.push(info)
          }
        } catch {
        }
      }
    }
  } catch (e) {
  }
  return fonts
}

async function getFontInfo(fontPath) {
  try {
    const buffer = fs.readFileSync(fontPath)
    return extractFontInfoFromBuffer(buffer, fontPath)
  } catch (error) {
    return { error: error.message }
  }
}

module.exports = {
  scanFonts,
  getFontInfo
}
