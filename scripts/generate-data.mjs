import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { extname, join } from 'node:path'

const DATA_DIR = 'data'
const OUTPUT_FILE = 'src/data.json'

// Get MIME type from extension
function getMimeType(ext) {
  const mimeTypes = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
  }
  return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

// Convert image to data URL
function imageToDataUrl(filePath) {
  const ext = extname(filePath)
  const mimeType = getMimeType(ext)
  const data = readFileSync(filePath)
  return `data:${mimeType};base64,${data.toString('base64')}`
}

const items = []

// Read all directories in data folder
const entries = readdirSync(DATA_DIR, { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
  .sort((a, b) => {
    // Sort by number prefix
    const numA = Number.parseInt(a.name.split('_')[0]) || 0
    const numB = Number.parseInt(b.name.split('_')[0]) || 0
    return numA - numB
  })

for (const entry of entries) {
  const dirPath = join(DATA_DIR, entry.name)
  const files = readdirSync(dirPath)

  // Parse directory name: "1_タイトル" -> id=1, title="タイトル"
  const match = entry.name.match(/^(\d+)_(.+)$/)
  if (!match) {
    console.warn(`Skipping directory with invalid name format: ${entry.name}`)
    continue
  }

  const id = Number.parseInt(match[1])
  const title = match[2]

  // Find front image (表.jpg, 表.jpeg, 表.png, etc.)
  const frontFile = files.find(
    (f) => f.startsWith('表.') && /\.(jpg|jpeg|png|gif|webp)$/i.test(f),
  )
  // Find back image (裏.jpg, 裏.jpeg, 裏.png, etc.)
  const backFile = files.find(
    (f) => f.startsWith('裏.') && /\.(jpg|jpeg|png|gif|webp)$/i.test(f),
  )
  // Find comment file
  const commentFile = files.find(
    (f) => f.includes('コメント') && f.endsWith('.txt'),
  )

  if (!frontFile || !backFile) {
    console.warn(
      `Missing images in ${entry.name}: front=${frontFile}, back=${backFile}`,
    )
    continue
  }

  // Copy images to assets
  const frontExt = extname(frontFile)
  const backExt = extname(backFile)
  const frontDest = `${id}_front${frontExt}`
  const backDest = `${id}_back${backExt}`

  copyFileSync(join(dirPath, frontFile), join(ASSETS_DIR, frontDest))
  copyFileSync(join(dirPath, backFile), join(ASSETS_DIR, backDest))

  // Read comment
  let comment = ''
  if (commentFile) {
    comment = readFileSync(join(dirPath, commentFile), 'utf-8').trim()
  }

  items.push({
    id,
    title,
    frontImage: `./assets/${frontDest}`,
    backImage: `./assets/${backDest}`,
    comment,
  })

  console.log(`Processed: ${title}`)
}

// Write JSON file
writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2))
console.log(`\nGenerated ${OUTPUT_FILE} with ${items.length} items`)
