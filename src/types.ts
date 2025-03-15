/**
 * Config options for the dotenv-store
 */
export interface EnvStoreConfig {
    /**
     * Secret key for encryption/decryption (default: 'dotenv-store-key')
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
     * Path to the file where encrypted environment variables are stored
     * Default: '.env.store'
     */
    'store-filepath'?: string;

    /**
     * Path to the output file for encrypted variables
     * Default: '.env.store.enc'
     */
    'output-filepath'?: string;

    /**
     * Path to the .env file to read variables from
     * Default: '.env'
     */
    'env-filepath'?: string;

    /**
     * Encryption algorithm to use
     * Default: 'aes'
     * Options: 'aes', 'aes-256-cbc', 'tripledes', 'rabbit', 'rc4'
     */
    'algorithm'?: 'aes' | 'aes-256-cbc' | 'tripledes' | 'rabbit' | 'rc4';

    // Legacy field names for backward compatibility
    file?: string;
    output?: string;
    envFile?: string;

    // Index signature to allow dynamic property access
    [key: string]: string | 'aes' | 'aes-256-cbc' | 'tripledes' | 'rabbit' | 'rc4' | undefined;
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