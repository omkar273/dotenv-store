import path from 'path';
import { encrypt } from './helpers/encrypt';
import { decrypt } from './helpers/decrypt';
import { readFile, writeFile, getAbsolutePath } from './helpers/file';
import { EnvStoreConfig, EnvVariables, EnvResult } from './types';
import fs from 'fs';

// Default algorithm to use for encryption
const DEFAULT_ALGORITHM = 'aes';

export class EnvStore {
    private config: Required<EnvStoreConfig>;
    private defaultKey = 'dotenv-store-key';
    private defaultFileName = '.env.store';
    private defaultKeyFileName = '.env.store.key';
    private defaultAlgorithm: 'aes' | 'aes-256-cbc' | 'tripledes' | 'rabbit' | 'rc4' = DEFAULT_ALGORITHM;

    constructor(config: EnvStoreConfig = {}) {
        this.config = {
            key: config.key || this.defaultKey,
            fileName: config.fileName || this.defaultFileName,
            filePath: config.filePath || process.cwd(),
            keyFilePath: config.keyFilePath || path.join(process.cwd(), this.defaultKeyFileName),
            algorithm: config.algorithm || this.defaultAlgorithm,
        };
    }

    /**
     * Get the encryption key - checks for key file first, then uses provided key or default
     */
    private async getEncryptionKey(): Promise<string> {
        // Try to read the key from file
        const keyFilePath = getAbsolutePath(this.config.keyFilePath);

        try {
            const keyFromFile = await readFile(keyFilePath);
            if (keyFromFile) {
                return keyFromFile.trim();
            }
        } catch (error) {
            // If key file doesn't exist and no key was provided, throw an error
            if (!this.config.key || this.config.key === this.defaultKey) {
                throw new Error(`Encryption key file not found at ${keyFilePath} and no key was provided. Please provide a key or create a key file.`);
            }
        }

        // Return the configured key or default
        return this.config.key;
    }

    /**
     * Get the full path to the env store file
     * @param filePath - Optional override for the file path
     */
    private getEnvFilePath(filePath?: string): string {
        // If a specific file path is provided, use it directly
        if (filePath) {
            return getAbsolutePath(filePath);
        }

        // Otherwise use the configured path
        return path.join(
            getAbsolutePath(this.config.filePath),
            this.config.fileName
        );
    }

    /**
     * Store environment variables in an encrypted file
     * @param envVars - Environment variables to store
     * @param filePath - Optional override for the file path
     */
    public async store(envVars: EnvVariables, filePath?: string): Promise<EnvResult> {
        try {
            const encryptionKey = await this.getEncryptionKey();
            const envString = JSON.stringify(envVars);
            const encryptedData = encrypt(envString, encryptionKey, this.config.algorithm);

            const targetFilePath = this.getEnvFilePath(filePath);
            await writeFile(targetFilePath, encryptedData);

            return {
                success: true,
                data: {
                    filePath: targetFilePath,
                    algorithm: this.config.algorithm
                }
            };
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message
            };
        }
    }

    /**
     * Retrieve and decrypt environment variables from a file
     * @param filePath - Optional override for the file path
     */
    public async retrieve(filePath?: string): Promise<EnvResult> {
        try {
            const encryptionKey = await this.getEncryptionKey();
            const targetFilePath = this.getEnvFilePath(filePath);

            // Read the encrypted data
            const encryptedData = await readFile(targetFilePath);
            if (!encryptedData) {
                return {
                    success: false,
                    error: `No data found in file: ${targetFilePath}`
                };
            }

            // Decrypt the data
            const decryptedData = decrypt(encryptedData, encryptionKey);
            if (!decryptedData) {
                return {
                    success: false,
                    error: 'Failed to decrypt data. Check your encryption key.'
                };
            }

            // Parse the decrypted JSON
            try {
                const envVars = JSON.parse(decryptedData);
                return {
                    success: true,
                    data: envVars
                };
            } catch (error) {
                return {
                    success: false,
                    error: 'Failed to parse decrypted data. The file may be corrupted.'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: (error as Error).message
            };
        }
    }

    /**
     * Set the encryption key in the key file
     * @param key - The encryption key to store
     */
    public async setEncryptionKey(key: string): Promise<EnvResult> {
        try {
            const keyFilePath = getAbsolutePath(this.config.keyFilePath);
            await writeFile(keyFilePath, key);

            return {
                success: true,
                data: {
                    keyFilePath,
                    algorithm: this.config.algorithm
                }
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to set encryption key: ${(error as Error).message}`,
            };
        }
    }
} 