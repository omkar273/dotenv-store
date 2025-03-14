/**
 * Config options for the env-store
 */
export interface EnvStoreConfig {
    /**
     * Secret key for encryption/decryption (default: 'env-store-key')
     */
    key?: string;

    /**
     * File name for storing encrypted environment variables (default: '.env.store')
     */
    fileName?: string;

    /**
     * File path for storing environment files (default: project root)
     */
    filePath?: string;

    /**
     * Path to the key file for reading encryption key (default: '.env.store.key')
     */
    keyFilePath?: string;
}

/**
 * Environment variables object
 */
export type EnvVariables = Record<string, string>;

/**
 * Result of retrieving environment variables
 */
export interface EnvResult {
    /**
     * Whether the operation was successful
     */
    success: boolean;

    /**
     * Retrieved environment variables (if successful)
     */
    data?: EnvVariables;

    /**
     * Error message (if unsuccessful)
     */
    error?: string;
} 