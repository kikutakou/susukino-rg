interface EncryptedData {
  salt: string
  iv: string
  authTag: string
  data: string
}

interface PasswordHash {
  hash: string
  salt: string
}

// Convert base64 to Uint8Array
function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

// Convert ArrayBuffer to hex string
function bufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

// Hash password using SHA-256
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  return bufferToHex(hashBuffer)
}

// Verify password against stored hash
export async function verifyPassword(
  password: string,
  hashData: PasswordHash,
): Promise<boolean> {
  const passwordHash = await hashPassword(password)
  const combinedData = passwordHash + hashData.salt
  const encoder = new TextEncoder()
  const verificationBuffer = await crypto.subtle.digest(
    'SHA-256',
    encoder.encode(combinedData),
  )
  const verificationHash = bufferToHex(verificationBuffer)
  return verificationHash === hashData.hash
}

// Derive encryption key from password using PBKDF2
async function deriveKey(
  password: string,
  salt: Uint8Array,
): Promise<CryptoKey> {
  const encoder = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(password),
    'PBKDF2',
    false,
    ['deriveKey'],
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt.buffer as ArrayBuffer,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt'],
  )
}

// Decrypt data using AES-GCM
export async function decryptData<T>(
  password: string,
  encryptedData: EncryptedData,
): Promise<T> {
  const salt = base64ToBytes(encryptedData.salt)
  const iv = base64ToBytes(encryptedData.iv)
  const authTag = base64ToBytes(encryptedData.authTag)
  const ciphertext = base64ToBytes(encryptedData.data)

  // Combine ciphertext and authTag (Web Crypto API expects them together)
  const combined = new Uint8Array(ciphertext.length + authTag.length)
  combined.set(ciphertext)
  combined.set(authTag, ciphertext.length)

  const key = await deriveKey(password, salt)

  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: iv.buffer as ArrayBuffer },
    key,
    combined.buffer as ArrayBuffer,
  )

  const decoder = new TextDecoder()
  const jsonString = decoder.decode(decrypted)
  return JSON.parse(jsonString) as T
}
