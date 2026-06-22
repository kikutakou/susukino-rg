import {
  createCipheriv,
  createHash,
  pbkdf2Sync,
  randomBytes,
} from 'node:crypto'
import { readFileSync, writeFileSync } from 'node:fs'

const DATA_FILE = 'src/data.json'
const ENCRYPTED_FILE = 'src/encryptedData.json'
const PASSWORD_HASH_FILE = 'src/passwordHash.json'
const DEFAULT_PASSWORD = 'susukino2026'

// Get password from environment variable or use default
const password = process.env.GALLERY_PASSWORD || DEFAULT_PASSWORD
if (password === DEFAULT_PASSWORD) {
  console.log(`Using default password: ${DEFAULT_PASSWORD}`)
}

// Read the original data
const data = readFileSync(DATA_FILE, 'utf-8')

// Generate a random salt for PBKDF2
const salt = randomBytes(16)

// Derive encryption key from password using PBKDF2
const key = pbkdf2Sync(password, salt, 100000, 32, 'sha256')

// Generate a random IV for AES-GCM
const iv = randomBytes(12)

// Encrypt the data using AES-256-GCM
const cipher = createCipheriv('aes-256-gcm', key, iv)
let encrypted = cipher.update(data, 'utf8', 'base64')
encrypted += cipher.final('base64')
const authTag = cipher.getAuthTag()

// Create the encrypted data object
const encryptedData = {
  salt: salt.toString('base64'),
  iv: iv.toString('base64'),
  authTag: authTag.toString('base64'),
  data: encrypted,
}

// Write encrypted data
writeFileSync(ENCRYPTED_FILE, `${JSON.stringify(encryptedData, null, 2)}\n`)
console.log(`Encrypted data written to ${ENCRYPTED_FILE}`)

// Generate password hash for verification (double hash for security)
const passwordHash = createHash('sha256').update(password).digest('hex')
const verificationHash = createHash('sha256')
  .update(passwordHash + salt.toString('base64'))
  .digest('hex')

// Write password verification hash
const hashData = {
  hash: verificationHash,
  salt: salt.toString('base64'),
}
writeFileSync(PASSWORD_HASH_FILE, `${JSON.stringify(hashData, null, 2)}\n`)
console.log(`Password hash written to ${PASSWORD_HASH_FILE}`)

console.log('\nEncryption complete!')
console.log('The gallery is now password-protected.')
