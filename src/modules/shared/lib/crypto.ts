/**
 * Advanced AES-256-GCM Data Encryption & Cryptographic Utilities
 * Compliant with OWASP & Web Security Encryption Standards using native Web Crypto API.
 */

// Default internal system pepper for AES-256 key derivation
const DEFAULT_PEPPER = 'DAIG_SECURE_VAULT_KEY_2026_AES_GCM_V1'

/**
 * Derives an AES-256-GCM CryptoKey using PBKDF2 with 100,000 iterations.
 */
async function deriveEncryptionKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  )
}

/**
 * Encrypts sensitive string payloads using AES-256-GCM encryption.
 * Returns Base64-encoded payload string containing IV, Salt, and Ciphertext.
 */
export async function encryptSensitiveData(plainText: string, secretKey = DEFAULT_PEPPER): Promise<string> {
  if (!plainText) return ''
  
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const iv = crypto.getRandomValues(new Uint8Array(12))

  const key = await deriveEncryptionKey(secretKey, salt)
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    enc.encode(plainText)
  )

  const ciphertextArray = new Uint8Array(ciphertextBuffer)
  
  // Combine salt (16 bytes) + iv (12 bytes) + ciphertext
  const combined = new Uint8Array(salt.length + iv.length + ciphertextArray.length)
  combined.set(salt, 0)
  combined.set(iv, salt.length)
  combined.set(ciphertextArray, salt.length + iv.length)

  // Convert to Base64
  return btoa(String.fromCharCode(...combined))
}

/**
 * Decrypts AES-256-GCM encrypted Base64 payloads.
 * Returns original plaintext string or throws error if tampered.
 */
export async function decryptSensitiveData(encryptedBase64: string, secretKey = DEFAULT_PEPPER): Promise<string> {
  if (!encryptedBase64) return ''

  try {
    const combinedString = atob(encryptedBase64)
    const combined = new Uint8Array(combinedString.length)
    for (let i = 0; i < combinedString.length; i++) {
      combined[i] = combinedString.charCodeAt(i)
    }

    if (combined.length < 28) {
      throw new Error('Payload criptografado inválido ou corrompido.')
    }

    const salt = combined.subarray(0, 16)
    const iv = combined.subarray(16, 28)
    const ciphertextArray = combined.subarray(28)

    const key = await deriveEncryptionKey(secretKey, salt)
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      ciphertextArray
    )

    const dec = new TextDecoder()
    return dec.decode(decryptedBuffer)
  } catch (err) {
    throw new Error('Falha na descriptografia: Dados corrompidos ou chave incorreta.')
  }
}

/**
 * Computes a SHA-256 cryptographic hash of a sensitive string (e.g. for integrity checks).
 */
export async function hashSHA256(input: string): Promise<string> {
  const enc = new TextEncoder()
  const hashBuffer = await crypto.subtle.digest('SHA-256', enc.encode(input))
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}
