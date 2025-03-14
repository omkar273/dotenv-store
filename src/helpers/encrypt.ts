import CryptoJS from 'crypto-js';

/**
 * Encrypts environment variable data using AES encryption
 * @param data - The data to encrypt (usually stringified JSON of env vars)
 * @param secretKey - The secret key to use for encryption
 * @returns The encrypted string
 */
export const encrypt = (data: string, secretKey: string): string => {
    try {
        return CryptoJS.AES.encrypt(data, secretKey).toString();
    } catch (error) {
        throw new Error(`Failed to encrypt data: ${(error as Error).message}`);
    }
};
