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

    /**
     * Encryption algorithm to use (default: 'aes')
     */
    algorithm?: 'aes' | 'aes-256-cbc' | 'tripledes' | 'rabbit' | 'rc4';
}

/**
 * Configuration file structure
 */
export interface EnvStoreConfigFile {
    /**
     * Input/output file path (default: '.env.store')
     */
    file?: string;

    /**
     * Output file path for encrypted variables
     */
    output?: string;

    /**
     * Path to the .env file to read variables from (default: '.env')
     */
    envFile?: string;

    /**
     * Encryption key (not recommended to store in config file)
     */
    key?: string;

    /**
     * Encryption algorithm to use (default: 'aes')
     */
    algorithm?: 'aes' | 'aes-256-cbc' | 'tripledes' | 'rabbit' | 'rc4';
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
     * Retrieved environment variables (if successful) or other data
     */
    data?: EnvVariables | {
        /**
         * File path where the environment variables were stored or retrieved from
         */
        filePath?: string;

        /**
         * File path where the encryption key was stored
         */
        keyFilePath?: string;

        /**
         * Encryption algorithm used
         */
        algorithm?: 'aes' | 'aes-256-cbc' | 'tripledes' | 'rabbit' | 'rc4';
    };

    /**
     * Error message (if unsuccessful)
     */
    error?: string;
} 