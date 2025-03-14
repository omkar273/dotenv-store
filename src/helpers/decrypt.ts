import CryptoJS from 'crypto-js';
import { Algorithm } from './encrypt';

// Special key for algorithm tracking
const ALGORITHM_TRACKING_KEY = 'caygnus';

/**
 * Decrypts an encrypted string of environment variable data
 * @param encryptedData - The encrypted data string
 * @param secretKey - The secret key used for encryption
 * @param algorithm - The encryption algorithm used (default: 'aes', will be overridden if algorithm info is found)
 * @returns The decrypted string
 */
export const decrypt = (encryptedData: string, secretKey: string, algorithm: Algorithm = 'aes'): string => {
    try {
        // Check if the encrypted data contains algorithm information
        const parts = encryptedData.split('.');

        // If we have two parts, the first part is the encrypted algorithm info
        if (parts.length === 2) {
            try {
                // Try to decrypt the algorithm info
                const encryptedAlgorithmInfo = parts[0];
                const algorithmInfoBytes = CryptoJS.AES.decrypt(encryptedAlgorithmInfo, ALGORITHM_TRACKING_KEY);
                const algorithmInfoString = algorithmInfoBytes.toString(CryptoJS.enc.Utf8);
                const algorithmInfo = JSON.parse(algorithmInfoString);

                // Use the algorithm from the encrypted data
                if (algorithmInfo && algorithmInfo.alg) {
                    algorithm = algorithmInfo.alg as Algorithm;
                }

                // Use only the actual encrypted data part
                encryptedData = parts[1];
            } catch (error) {
                // If we can't decrypt the algorithm info, just use the provided algorithm
                // and assume the format is not using algorithm tracking
                console.warn('Could not extract algorithm information, using provided algorithm');
            }
        }

        let bytes;

        switch (algorithm) {
            case 'aes':
                bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
                break;
            case 'aes-256-cbc':
                bytes = CryptoJS.AES.decrypt(encryptedData, secretKey, {
                    mode: CryptoJS.mode.CBC,
                    padding: CryptoJS.pad.Pkcs7
                });
                break;
            case 'tripledes':
                bytes = CryptoJS.TripleDES.decrypt(encryptedData, secretKey);
                break;
            case 'rabbit':
                bytes = CryptoJS.Rabbit.decrypt(encryptedData, secretKey);
                break;
            case 'rc4':
                bytes = CryptoJS.RC4.decrypt(encryptedData, secretKey);
                break;
            default:
                bytes = CryptoJS.AES.decrypt(encryptedData, secretKey);
        }

        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        throw new Error(`Failed to decrypt data with ${algorithm}: ${(error as Error).message}`);
    }
};
