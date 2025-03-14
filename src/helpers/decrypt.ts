import CryptoJS from 'crypto-js';

/**
 * Decrypts an encrypted string of environment variable data
 * @param encryptedData - The encrypted data string
 * @param secretKey - The secret key used for encryption
 * @returns The decrypted string
 */
export const decrypt = (encryptedData: string, secretKey: string): string => {
    try {
        const bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        throw new Error(`Failed to decrypt data: ${(error as Error).message}`);
    }
};
