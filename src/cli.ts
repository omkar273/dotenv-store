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
const defaultConfigPath = 'env-store.config.json';

try {
    if (fs.existsSync(defaultConfigPath)) {
        configFile = JSON.parse(fs.readFileSync(defaultConfigPath, 'utf8'));
    }
} catch (error) {
    // Silently fail if config file doesn't exist or is invalid
}

program
    .name('env-store')
    .description('A utility to securely encrypt and manage environment variables')
    .version(packageJson.version)
    .option('--config <file>', 'path to configuration file');

// Default algorithm to use for encryption
const DEFAULT_ALGORITHM = 'aes';

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
        packageJson.scripts['env:encrypt'] = `env-store encrypt${configOption}`;
        packageJson.scripts['env:decrypt'] = `env-store decrypt${configOption}`;

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
            content += '\n# env-store encryption key\n.env.store.key\n';
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
    .description('Initialize env-store in the current project')
    .option('--config <file>', 'path to configuration file', defaultConfigPath)
    .option('--algorithm <algorithm>', 'encryption algorithm to use', DEFAULT_ALGORITHM)
    .action(async (options) => {
        try {
            console.log('Initializing env-store...');

            // Warn if a non-default algorithm is used
            if (options.algorithm !== DEFAULT_ALGORITHM) {
                console.warn(`
WARNING: You are using a non-default encryption algorithm (${options.algorithm}).
Make sure to use the same algorithm for decryption or the data will be corrupted.
The algorithm information is stored securely in the encrypted file.
DO NOT EDIT the encrypted file manually.
`);
            }

            // Create config file
            const configPath = options.config;
            const config: EnvStoreConfigFile = {
                file: '.env.store',
                output: '.env.store.enc',
                envFile: '.env',
                algorithm: options.algorithm
            };

            await fs.writeJson(configPath, config, { spaces: 2 });
            console.log(`Created configuration file: ${configPath}`);

            // Generate and store encryption key
            const key = generateEncryptionKey();
            const envStore = createEnvStore({ key, algorithm: options.algorithm });
            const keyResult = await envStore.setEncryptionKey(key);

            if (keyResult.success) {
                console.log(`Generated encryption key and saved to .env.store.key`);

                // Update .gitignore
                if (await updateGitignore()) {
                    console.log('Added .env.store.key to .gitignore');
                }

                // Update package.json
                if (await updatePackageJson(configPath)) {
                    console.log('Added env:encrypt and env:decrypt scripts to package.json');
                }

                console.log('\nInitialization complete! You can now use:');
                console.log('- npm run env:encrypt - to encrypt your environment variables');
                console.log('- npm run env:decrypt - to decrypt your environment variables');
                console.log('- npx env-store e - shortcut for encrypt');
                console.log('- npx env-store d - shortcut for decrypt');
            } else {
                console.error(`Failed to generate encryption key: ${keyResult.error}`);
                process.exit(1);
            }
        } catch (error) {
            console.error(`Error during initialization: ${(error as Error).message}`);
            process.exit(1);
        }
    });

// Encrypt command
program
    .command('encrypt')
    .alias('e')
    .description('Encrypt environment variables and save to a file')
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --file <file>', 'output file path')
    .option('-e, --env <keyValue...>', 'environment variables in KEY=VALUE format')
    .option('--env-file <file>', 'read variables from a .env file')
    .option('--key-file <file>', 'file containing the encryption key')
    .option('--output <file>', 'output file for encrypted variables')
    .option('--algorithm <algorithm>', 'encryption algorithm to use', DEFAULT_ALGORITHM)
    .action(async (cmdOptions) => {
        try {
            // Check for config file option
            let config = configFile;
            if (program.opts().config) {
                config = loadConfigFile(program.opts().config);
            }

            // Merge options with config file, prioritizing command line options
            const options = {
                key: cmdOptions.key,
                keyFile: cmdOptions.keyFile,
                file: cmdOptions.file || config.file || '.env.store',
                envFile: cmdOptions.envFile || config.envFile || '.env',
                env: cmdOptions.env,
                output: cmdOptions.output || config.output,
                algorithm: cmdOptions.algorithm || config.algorithm || DEFAULT_ALGORITHM
            };

            // Warn if a non-default algorithm is used
            if (options.algorithm !== DEFAULT_ALGORITHM) {
                console.warn(`
WARNING: You are using a non-default encryption algorithm (${options.algorithm}).
Make sure to use the same algorithm for decryption or the data will be corrupted.
The algorithm information is stored securely in the encrypted file.
DO NOT EDIT the encrypted file manually.
`);
            }

            const envStore = createEnvStore({
                key: options.key,
                keyFile: options.keyFile,
                algorithm: options.algorithm
            });

            // Default to reading from .env if no env vars provided
            const envVars = await readEnvVariables({
                dotenvFile: options.envFile,
                env: options.env
            });

            if (Object.keys(envVars).length === 0) {
                console.error('No environment variables found. Make sure .env file exists or use --env KEY=VALUE option.');
                process.exit(1);
            }

            const outputFile = options.output || options.file;

            // Override the default file path
            const result = await envStore.store(envVars, outputFile);

            if (result.success) {
                const filePath = result.data && 'filePath' in result.data ? result.data.filePath : outputFile;
                const algorithm = result.data && 'algorithm' in result.data ? result.data.algorithm : 'aes';
                console.log(`Environment variables encrypted with ${algorithm} and saved to ${filePath}`);
            } else {
                console.error(`Failed to encrypt: ${result.error}`);
                process.exit(1);
            }
        } catch (error) {
            console.error(`Error during encryption: ${(error as Error).message}`);
            process.exit(1);
        }
    });

// Decrypt command
program
    .command('decrypt')
    .alias('d')
    .description('Decrypt environment variables from a file')
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --file <file>', 'input file path')
    .option('-o, --output <file>', 'output file path for decrypted variables')
    .option('--key-file <file>', 'file containing the encryption key')
    .option('--algorithm <algorithm>', 'encryption algorithm to use', DEFAULT_ALGORITHM)
    .action(async (cmdOptions) => {
        try {
            // Check for config file option
            let config = configFile;
            if (program.opts().config) {
                config = loadConfigFile(program.opts().config);
            }

            // Merge options with config file, prioritizing command line options
            const options = {
                key: cmdOptions.key,
                keyFile: cmdOptions.keyFile,
                file: cmdOptions.file || config.file || '.env.store',
                output: cmdOptions.output || config.output,
                algorithm: cmdOptions.algorithm || config.algorithm || DEFAULT_ALGORITHM
            };

            const envStore = createEnvStore({
                key: options.key,
                keyFile: options.keyFile,
                algorithm: options.algorithm
            });

            const inputFile = options.file;

            // Override the default file path for retrieval
            const result = await envStore.retrieve(inputFile);

            if (!result.success || !result.data) {
                console.error(`Failed to decrypt: ${result.error}`);
                process.exit(1);
            }

            // If output file is specified, write variables to the file
            if (options.output) {
                const outputContent = Object.entries(result.data)
                    .map(([key, value]) => `${key}=${value}`)
                    .join('\n');

                await fs.writeFile(options.output, outputContent, 'utf8');
                console.log(`Decrypted variables saved to ${options.output}`);
            } else {
                // Otherwise, display variables in the console
                console.log('Decrypted environment variables:');
                for (const [key, value] of Object.entries(result.data)) {
                    console.log(`${key}=${value}`);
                }
            }
        } catch (error) {
            console.error(`Error during decryption: ${(error as Error).message}`);
            process.exit(1);
        }
    });

// List command
program
    .command('list')
    .alias('l')
    .description('List environment variables from an encrypted file')
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --file <file>', 'input file path')
    .option('--key-file <file>', 'file containing the encryption key')
    .option('--algorithm <algorithm>', 'encryption algorithm to use', DEFAULT_ALGORITHM)
    .action(async (cmdOptions) => {
        try {
            // Check for config file option
            let config = configFile;
            if (program.opts().config) {
                config = loadConfigFile(program.opts().config);
            }

            // Merge options with config file, prioritizing command line options
            const options = {
                key: cmdOptions.key,
                keyFile: cmdOptions.keyFile,
                file: cmdOptions.file || config.file || '.env.store',
                algorithm: cmdOptions.algorithm || config.algorithm || DEFAULT_ALGORITHM
            };

            const envStore = createEnvStore({
                key: options.key,
                keyFile: options.keyFile,
                algorithm: options.algorithm
            });

            const inputFile = options.file;

            // Override the default file path for retrieval
            const result = await envStore.retrieve(inputFile);

            if (!result.success || !result.data) {
                console.error(`Failed to retrieve variables: ${result.error}`);
                process.exit(1);
            }

            console.log('Environment variables:');
            for (const [key, value] of Object.entries(result.data)) {
                console.log(`${key}=${value}`);
            }
        } catch (error) {
            console.error(`Error listing variables: ${(error as Error).message}`);
            process.exit(1);
        }
    });

// Set key command
program
    .command('set-key')
    .alias('k')
    .description('Set the encryption key in a key file')
    .option('-k, --key <key>', 'encryption key to store', 'env-store-key')
    .option('-f, --file <file>', 'key file path', '.env.store.key')
    .action(async (options) => {
        try {
            const envStore = new EnvStore({
                keyFilePath: options.file
            });

            const result = await envStore.setEncryptionKey(options.key);

            if (result.success) {
                console.log(`Encryption key saved to ${options.file}`);
            } else {
                console.error(`Failed to save key: ${result.error}`);
                process.exit(1);
            }
        } catch (error) {
            console.error(`Error setting key: ${(error as Error).message}`);
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