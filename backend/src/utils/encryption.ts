import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your-secret-encryption-key-min-32-chars-change-in-prod';
const ALGORITHM = 'aes-256-gcm';

// Ensure the key is exactly 32 bytes for aes-256
const getEncryptionKey = () => {
    let key = ENCRYPTION_KEY;
    if (key.length < 32) {
        key = key.padEnd(32, '0');
    }
    return Buffer.from(key.slice(0, 32));
};

export const encryptApiKey = (apiKey: string): string => {
    try {
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
        
        let encrypted = cipher.update(apiKey, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        
        const authTag = cipher.getAuthTag();
        
        // Combine iv + authTag + encrypted data
        const result = iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
        return result;
    } catch (error) {
        console.error('Encryption error:', error);
        throw new Error('Failed to encrypt API key');
    }
};

export const decryptApiKey = (encryptedApiKey: string): string => {
    try {
        const parts = encryptedApiKey.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid encrypted format');
        }

        const iv = Buffer.from(parts[0], 'hex');
        const authTag = Buffer.from(parts[1], 'hex');
        const encrypted = parts[2];

        const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        console.error('Decryption error:', error);
        throw new Error('Failed to decrypt API key');
    }
};
