#!/usr/bin/env node

import { Command } from 'commander';
import fs from 'fs-extra';
import path from 'path';
import dotenv from 'dotenv';
import { EnvStore } from './EnvStore';
import { EnvVariables, EnvStoreConfigFile } from './types';

const program = new Command();

// Get package version from package.json
const packageJsonPath = path.join(__dirname, '../package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// Configuration file support
// Try to load config file
let configFile: EnvStoreConfigFile = {};
const defaultConfigPath = 'dotenv-store.config.json';

try {
    if (fs.existsSync(defaultConfigPath)) {
        configFile = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    }
} catch (error) {
    // Silently fail if config file doesn't exist or is invalid
}

program
    .name('dotenv-store')
    .description('A utility to securely encrypt and manage environment variables')
    .version(packageJson.version)
    .option('--config <file>', 'path to configuration file');

// Default algorithm to use for encryption
const DEFAULT_ALGORITHM = 'aes';
const DEFAULT_KEY_FILE = '.env.store.key';
const DEFAULT_ENV_FILE = '.env';
const DEFAULT_STORE_FILE = '.env.store';
const DEFAULT_DECRYPTED_FILE = '.env.store.decrypted';

// Helper function to create EnvStore with command options
function createEnvStore(options: { key?: string, keyFile?: string, algorithm?: string }): EnvStore {
    const config: any = {};

    if (options.key) {
        config.key = options.key;
    }

    if (options.keyFile) {
        config.keyFilePath = options.keyFile;
    }

    if (options.algorithm) {
        config.algorithm = options.algorithm;
    }

    return new EnvStore(config);
}

// Helper function to read env variables from different sources
async function readEnvVariables(options: {
    file?: string,
    env?: string[],
    dotenvFile?: string
}): Promise<EnvVariables> {
    const envVars: EnvVariables = {};

    // Read from .env file if specified
    if (options.dotenvFile) {
        try {
            const envFileContent = await fs.readFile(options.dotenvFile, 'utf8');
            const parsed = dotenv.parse(envFileContent);
            Object.assign(envVars, parsed);
        } catch (error) {
            console.error(`Error reading .env file: ${(error as Error).message}`);
        }
    }

    // Parse individual env variables provided with --env option
    if (options.env && options.env.length > 0) {
        options.env.forEach(envVar => {
            const [key, value] = envVar.split('=');
            if (key && value) {
                envVars[key.trim()] = value.trim();
            }
        });
    }

    return envVars;
}

// Helper function to load config file
function loadConfigFile(configPath: string): EnvStoreConfigFile {
    try {
        if (fs.existsSync(configPath)) {
            return JSON.parse(fs.readFileSync(configPath, 'utf8'));
        }
    } catch (error) {
        console.error(`Error reading config file: ${(error as Error).message}`);
    }
    return {};
}

// Helper function to update package.json with scripts
async function updatePackageJson(configPath: string): Promise<boolean> {
    try {
        const packageJsonPath = path.join(process.cwd(), 'package.json');
        if (!fs.existsSync(packageJsonPath)) {
            console.error('package.json not found in the current directory');
            return false;
        }

        const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));

        // Add scripts if they don't exist
        if (!packageJson.scripts) {
            packageJson.scripts = {};
        }

        // Add encrypt and decrypt scripts
        const configOption = configPath !== defaultConfigPath ? ` --config ${configPath}` : '';
        packageJson.scripts['env:encrypt'] = `dotenv-store encrypt${configOption}`;
        packageJson.scripts['env:decrypt'] = `dotenv-store decrypt${configOption}`;

        // Write updated package.json
        await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2));
        return true;
    } catch (error) {
        console.error(`Error updating package.json: ${(error as Error).message}`);
        return false;
    }
}

// Helper function to update .gitignore
async function updateGitignore(): Promise<boolean> {
    try {
        const gitignorePath = path.join(process.cwd(), '.gitignore');
        let content = '';

        // Read existing .gitignore if it exists
        if (fs.existsSync(gitignorePath)) {
            content = await fs.readFile(gitignorePath, 'utf8');
        }

        // Check if .env.store.key is already in .gitignore
        if (!content.includes('.env.store.key')) {
            // Add .env.store.key to .gitignore
            content += '\n# dotenv-store encryption key\n.env.store.key\n';
            await fs.writeFile(gitignorePath, content);
        }

        return true;
    } catch (error) {
        console.error(`Error updating .gitignore: ${(error as Error).message}`);
        return false;
    }
}

// Generate a random encryption key
function generateEncryptionKey(length = 32): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Init command
program
    .command('init')
    .alias('i')
    .description('Initialize dotenv-store in the current project')
    .option('--config <file>', 'path to configuration file', defaultConfigPath)
    .option('--algorithm <algorithm>', 'encryption algorithm to use', DEFAULT_ALGORITHM)
    .option('--key-file <file>', 'path to key file', DEFAULT_KEY_FILE)
    .option('--env-file <file>', 'path to .env file', DEFAULT_ENV_FILE)
    .option('--store-file <file>', 'path to store encrypted variables', DEFAULT_STORE_FILE)
    .option('--decrypted-file <file>', 'path to store decrypted variables', DEFAULT_DECRYPTED_FILE)
    .action(async (options) => {
        try {
            console.log('Initializing dotenv-store...');

            // Generate a random encryption key
            const encryptionKey = generateEncryptionKey();

            // Save the key to the key file
            const keyFilePath = options.keyFile || DEFAULT_KEY_FILE;
            await fs.writeFile(keyFilePath, encryptionKey);
            console.log(`Created encryption key file: ${keyFilePath}`);

            // Create config file
            const configPath = options.config;
            const config: EnvStoreConfigFile = {
                'env-filepath': options.envFile || DEFAULT_ENV_FILE,
                'store-file-path': options.storeFile || DEFAULT_STORE_FILE,
                'decrypted-file-path': options.decryptedFile || DEFAULT_DECRYPTED_FILE,
                'key-file-path': keyFilePath,
                'algorithm': options.algorithm || DEFAULT_ALGORITHM
            };

            await fs.writeJson(configPath, config, { spaces: 2 });
            console.log(`Created configuration file: ${configPath}`);

            // Update .gitignore to exclude the key file
            await updateGitignore();
            console.log(`Updated .gitignore to exclude the key file`);

            // Update package.json with scripts
            const updatedPackageJson = await updatePackageJson(configPath);
            if (updatedPackageJson) {
                console.log(`Updated package.json with env:encrypt and env:decrypt scripts`);
            }

            console.log(`
Initialization complete! You can now use dotenv-store to encrypt and decrypt your environment variables.

Quick start:
1. Add your environment variables to ${options.envFile || DEFAULT_ENV_FILE}
2. Run 'npx dotenv-store encrypt' to encrypt your variables
3. Run 'npx dotenv-store decrypt' to decrypt your variables

For more information, see the documentation at https://github.com/yourusername/dotenv-store
`);
        } catch (error) {
            console.error(`Error initializing dotenv-store: ${(error as Error).message}`);
        }
    });

// Encrypt command
program
    .command('encrypt')
    .alias('e')
    .description('Encrypt environment variables')
    .option('--config <file>', 'path to configuration file', defaultConfigPath)
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --key-file <file>', 'path to key file')
    .option('-a, --algorithm <algorithm>', 'encryption algorithm')
    .option('-e, --env-file <file>', 'path to .env file')
    .option('-s, --store-file <file>', 'path to store encrypted variables')
    .action(async (options) => {
        try {
            // Load config file if specified
            const configPath = options.config;
            const config = loadConfigFile(configPath);

            // Get key file path from options or config
            const keyFilePath = options.keyFile || config['key-file-path'] || DEFAULT_KEY_FILE;

            // Get env file path from options or config
            const envFilePath = options.envFile || config['env-filepath'] || DEFAULT_ENV_FILE;

            // Get store file path from options or config
            const storeFilePath = options.storeFile || config['store-file-path'] || DEFAULT_STORE_FILE;

            // Get algorithm from options or config
            const algorithm = options.algorithm || config['algorithm'] || DEFAULT_ALGORITHM;

            // Create EnvStore instance
            const envStore = createEnvStore({
                key: options.key,
                keyFile: keyFilePath,
                algorithm
            });

            // Check if .env file exists
            if (!fs.existsSync(envFilePath)) {
                console.error(`Error: .env file not found at ${envFilePath}`);
                console.log(`
Please create a .env file with your environment variables first.
You can specify a custom .env file path with the --env-file option.
`);
                process.exit(1);
            }

            // Read environment variables from .env file
            const envVars = await readEnvVariables({ dotenvFile: envFilePath });

            // Encrypt and store variables
            const result = await envStore.store(envVars, storeFilePath);

            if (result.success) {
                console.log(`Environment variables encrypted and stored in ${storeFilePath}`);
            } else {
                console.error(`Error encrypting environment variables: ${result.error}`);
                process.exit(1);
            }
        } catch (error) {
            if ((error as Error).message.includes('Encryption key file not found')) {
                console.error(`Error: Encryption key file not found.`);
                console.log(`
Please either:
1. Provide a key directly with the --key option:
   npx dotenv-store encrypt --key YOUR_SECRET_KEY

2. Generate a key file first:
   npx dotenv-store set-key --key YOUR_SECRET_KEY
    
3. Specify a custom key file location:
   npx dotenv-store encrypt --key-file /path/to/your/key/file
`);
                process.exit(1);
            } else {
                console.error(`Error: ${(error as Error).message}`);
                process.exit(1);
            }
        }
    });

// Decrypt command
program
    .command('decrypt')
    .alias('d')
    .description('Decrypt environment variables')
    .option('--config <file>', 'path to configuration file', defaultConfigPath)
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --key-file <file>', 'path to key file')
    .option('-s, --store-file <file>', 'path to encrypted store file')
    .option('-d, --decrypted-file <file>', 'path to output decrypted variables')
    .action(async (options) => {
        try {
            // Load config file if specified
            const configPath = options.config;
            const config = loadConfigFile(configPath);

            // Get key file path from options or config
            const keyFilePath = options.keyFile || config['key-file-path'] || DEFAULT_KEY_FILE;

            // Get store file path from options or config
            const storeFilePath = options.storeFile || config['store-file-path'] || DEFAULT_STORE_FILE;

            // Get decrypted file path from options or config
            const decryptedFilePath = options.decryptedFile || config['decrypted-file-path'] || DEFAULT_DECRYPTED_FILE;

            // Create EnvStore instance
            const envStore = createEnvStore({
                key: options.key,
                keyFile: keyFilePath
            });

            // Check if store file exists
            if (!fs.existsSync(storeFilePath)) {
                console.error(`Error: Encrypted store file not found at ${storeFilePath}`);
                console.log(`
Please encrypt your environment variables first with:
npx dotenv-store encrypt
`);
                process.exit(1);
            }

            // Retrieve and decrypt variables
            const result = await envStore.retrieve(storeFilePath);

            if (result.success && result.data && typeof result.data !== 'string') {
                // Convert environment variables to string format
                let envContent = '';
                for (const [key, value] of Object.entries(result.data)) {
                    envContent += `${key}=${value}\n`;
                }

                // Write to decrypted file
                await fs.writeFile(decryptedFilePath, envContent);
                console.log(`Environment variables decrypted and saved to ${decryptedFilePath}`);
            } else {
                console.error(`Error decrypting environment variables: ${result.error}`);
                process.exit(1);
            }
        } catch (error) {
            if ((error as Error).message.includes('Encryption key file not found')) {
                console.error(`Error: Encryption key file not found.`);
                console.log(`
Please either:
1. Provide a key directly with the --key option:
   npx dotenv-store decrypt --key YOUR_SECRET_KEY

2. Generate a key file first:
   npx dotenv-store set-key --key YOUR_SECRET_KEY
    
3. Specify a custom key file location:
   npx dotenv-store decrypt --key-file /path/to/your/key/file
`);
                process.exit(1);
            } else {
                console.error(`Error: ${(error as Error).message}`);
                process.exit(1);
            }
        }
    });

// List command
program
    .command('list')
    .alias('l')
    .description('List encrypted environment variables')
    .option('--config <file>', 'path to configuration file', defaultConfigPath)
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --key-file <file>', 'path to key file')
    .option('-s, --store-file <file>', 'path to encrypted store file')
    .action(async (options) => {
        try {
            // Load config file if specified
            const configPath = options.config;
            const config = loadConfigFile(configPath);

            // Get key file path from options or config
            const keyFilePath = options.keyFile || config['key-file-path'] || DEFAULT_KEY_FILE;

            // Get store file path from options or config
            const storeFilePath = options.storeFile || config['store-file-path'] || DEFAULT_STORE_FILE;

            // Create EnvStore instance
            const envStore = createEnvStore({
                key: options.key,
                keyFile: keyFilePath
            });

            // Check if store file exists
            if (!fs.existsSync(storeFilePath)) {
                console.error(`Error: Encrypted store file not found at ${storeFilePath}`);
                console.log(`
Please encrypt your environment variables first with:
npx dotenv-store encrypt
`);
                process.exit(1);
            }

            // Retrieve and decrypt variables
            const result = await envStore.retrieve(storeFilePath);

            if (result.success && result.data && typeof result.data !== 'string') {
                console.log('Encrypted environment variables:');
                console.log('------------------------------');
                for (const [key, value] of Object.entries(result.data)) {
                    console.log(`${key}=${value}`);
                }
                console.log('------------------------------');
            } else {
                console.error(`Error decrypting environment variables: ${result.error}`);
                process.exit(1);
            }
        } catch (error) {
            if ((error as Error).message.includes('Encryption key file not found')) {
                console.error(`Error: Encryption key file not found.`);
                console.log(`
Please either:
1. Provide a key directly with the --key option:
   npx dotenv-store list --key YOUR_SECRET_KEY

2. Generate a key file first:
   npx dotenv-store set-key --key YOUR_SECRET_KEY
    
3. Specify a custom key file location:
   npx dotenv-store list --key-file /path/to/your/key/file
`);
                process.exit(1);
            } else {
                console.error(`Error: ${(error as Error).message}`);
                process.exit(1);
            }
        }
    });

// Set key command
program
    .command('set-key')
    .alias('k')
    .description('Set the encryption key in a key file')
    .option('--config <file>', 'path to configuration file', defaultConfigPath)
    .option('-k, --key <key>', 'encryption key to store (random if not provided)')
    .option('-f, --file <file>', 'key file path')
    .action(async (options) => {
        try {
            // Load config file if specified
            const configPath = options.config;
            const config = loadConfigFile(configPath);

            // Get key file path from options or config
            const keyFilePath = options.file || config['key-file-path'] || DEFAULT_KEY_FILE;

            // Generate a random key if not provided
            const key = options.key || generateEncryptionKey();

            // Write key to file
            await fs.writeFile(keyFilePath, key);
            console.log(`Encryption key ${options.key ? 'saved' : 'generated and saved'} to ${keyFilePath}`);

            // Update config file with key file path if it exists
            if (fs.existsSync(configPath)) {
                const updatedConfig = { ...config, 'key-file-path': keyFilePath };
                await fs.writeJson(configPath, updatedConfig, { spaces: 2 });
                console.log(`Updated configuration file with key file path`);
            }

            // Update .gitignore to exclude the key file
            await updateGitignore();

            console.log(`
IMPORTANT: Keep your encryption key secure!
The key file should NEVER be committed to version control.
We've added it to .gitignore for you.
`);
        } catch (error) {
            console.error(`Error setting encryption key: ${(error as Error).message}`);
            process.exit(1);
        }
    });

// Parse command line arguments
program.parse(process.argv);

// If config option is provided but no command, show error
if (program.opts().config && process.argv.length <= 3) {
    console.error('Please specify a command (encrypt, decrypt, list, set-key) when using --config option');
    process.exit(1);
}

// Display help if no command is provided
if (!process.argv.slice(2).length) {
    program.outputHelp();
} 