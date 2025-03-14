import path from 'path';
import { encrypt } from './helpers/encrypt';
import { decrypt } from './helpers/decrypt';
import { readFile, writeFile, getAbsolutePath } from './helpers/file';
import { EnvStoreConfig, EnvVariables, EnvResult } from './types';

export class EnvStore {
    private config: Required<EnvStoreConfig>;
    private defaultKey = 'env-store-key';
    private defaultFileName = '.env.store';
    private defaultKeyFileName = '.env.store.key';

    constructor(config: EnvStoreConfig = {}) {
        this.config = {
            key: config.key || this.defaultKey,
            fileName: config.fileName || this.defaultFileName,
            filePath: config.filePath || process.cwd(),
            keyFilePath: config.keyFilePath || path.join(process.cwd(), this.defaultKeyFileName),
        };
    }

    /**
     * Get the encryption key - checks for key file first, then uses provided key or default
     */
    private async getEncryptionKey(): Promise<string> {
        // Try to read the key from file
        const keyFilePath = getAbsolutePath(this.config.keyFilePath);
        const keyFromFile = await readFile(keyFilePath);

        if (keyFromFile) {
            return keyFromFile.trim();
        }

        // Return the configured key or default
        return this.config.key;
    }

    /**
     * Get the full path to the env store file
     */
    private getEnvFilePath(): string {
        return path.join(
            getAbsolutePath(this.config.filePath),
            this.config.fileName
        );
    }

    /**
     * Store environment variables in an encrypted file
     * @param envVars - Environment variables to store
     */
    public async store(envVars: EnvVariables): Promise<EnvResult> {
        try {
            const encryptionKey = await this.getEncryptionKey();
            const envString = JSON.stringify(envVars);
            const encryptedData = encrypt(envString, encryptionKey);

            await writeFile(this.getEnvFilePath(), encryptedData);

            return {
                success: true,
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to store environment variables: ${(error as Error).message}`,
            };
        }
    }

    /**
     * Retrieve and decrypt environment variables from the stored file
     */
    public async retrieve(): Promise<EnvResult> {
        try {
            const filePath = this.getEnvFilePath();
            const encryptedData = await readFile(filePath);

            if (!encryptedData) {
                return {
                    success: false,
                    error: `Environment file not found at: ${filePath}`,
                };
            }

            const encryptionKey = await this.getEncryptionKey();
            const decryptedData = decrypt(encryptedData, encryptionKey);
            const envVars = JSON.parse(decryptedData) as EnvVariables;

            return {
                success: true,
                data: envVars,
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to retrieve environment variables: ${(error as Error).message}`,
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
            };
        } catch (error) {
            return {
                success: false,
                error: `Failed to set encryption key: ${(error as Error).message}`,
            };
        }
    }
} 