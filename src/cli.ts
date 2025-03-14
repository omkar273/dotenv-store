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

// Helper function to create EnvStore with command options
function createEnvStore(options: { key?: string, keyFile?: string }): EnvStore {
    const config: any = {};

    if (options.key) {
        config.key = options.key;
    }

    if (options.keyFile) {
        config.keyFilePath = options.keyFile;
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

// Encrypt command
program
    .command('encrypt')
    .description('Encrypt environment variables and save to a file')
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --file <file>', 'output file path')
    .option('-e, --env <keyValue...>', 'environment variables in KEY=VALUE format')
    .option('--env-file <file>', 'read variables from a .env file')
    .option('--key-file <file>', 'file containing the encryption key')
    .option('--output <file>', 'output file for encrypted variables')
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
                output: cmdOptions.output || config.output
            };

            const envStore = createEnvStore({ key: options.key, keyFile: options.keyFile });

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
                console.log(`Environment variables encrypted and saved to ${filePath}`);
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
    .description('Decrypt environment variables from a file')
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --file <file>', 'input file path')
    .option('-o, --output <file>', 'output file path for decrypted variables')
    .option('--key-file <file>', 'file containing the encryption key')
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
                output: cmdOptions.output || config.output
            };

            const envStore = createEnvStore({ key: options.key, keyFile: options.keyFile });
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
    .description('List environment variables from an encrypted file')
    .option('-k, --key <key>', 'encryption key')
    .option('-f, --file <file>', 'input file path')
    .option('--key-file <file>', 'file containing the encryption key')
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
                file: cmdOptions.file || config.file || '.env.store'
            };

            const envStore = createEnvStore({ key: options.key, keyFile: options.keyFile });
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