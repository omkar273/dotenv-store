/**
 * Example demonstrating how to use env-store with a configuration file
 */

import fs from 'fs-extra';
import { EnvStore } from '../src';

async function configExample() {
    console.log('=== Configuration File Example ===');

    // Create a sample .env file
    const envContent = `
API_KEY=my-api-key-12345
DATABASE_URL=postgres://user:password@localhost:5432/mydb
SECRET_TOKEN=super-secret-token
DEBUG=true
    `.trim();

    await fs.writeFile('.env.example', envContent);
    console.log('Created .env.example file with sample variables');

    // Create a configuration file
    const configContent = {
        file: '.env.example.store',
        output: '.env.example.enc',
        envFile: '.env.example'
    };

    await fs.writeJson('env-store.config.example.json', configContent, { spaces: 2 });
    console.log('Created env-store.config.example.json configuration file');

    console.log('\n=== CLI Usage with Configuration File ===');
    console.log('# Encrypt using config file:');
    console.log('npx env-store --config env-store.config.example.json encrypt --key my-secret-key');

    console.log('\n# Decrypt using config file:');
    console.log('npx env-store --config env-store.config.example.json decrypt --key my-secret-key');

    console.log('\n# List using config file:');
    console.log('npx env-store --config env-store.config.example.json list --key my-secret-key');

    console.log('\n=== Programmatic Usage ===');

    // Create an EnvStore instance
    const envStore = new EnvStore({
        key: 'my-secret-key',
        fileName: configContent.file
    });

    // Parse the .env file
    const envVars = dotenvParse(await fs.readFile('.env.example', 'utf8'));

    // Store the variables
    const storeResult = await envStore.store(envVars, configContent.output);

    if (storeResult.success) {
        console.log('Environment variables encrypted and stored successfully');

        // Retrieve the variables
        const retrieveResult = await envStore.retrieve(configContent.output);

        if (retrieveResult.success && retrieveResult.data && !('filePath' in retrieveResult.data)) {
            console.log('\nRetrieved environment variables:');
            for (const [key, value] of Object.entries(retrieveResult.data)) {
                console.log(`${key}=${value}`);
            }
        } else {
            console.error('Failed to retrieve environment variables');
        }
    } else {
        console.error('Failed to store environment variables');
    }

    // Clean up
    console.log('\nCleaning up example files...');
    await fs.remove('.env.example');
    await fs.remove('.env.example.store');
    await fs.remove('.env.example.enc');
    await fs.remove('env-store.config.example.json');
    console.log('Example files removed');
}

// Simple dotenv parser
function dotenvParse(content: string): Record<string, string> {
    const result: Record<string, string> = {};
    const lines = content.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine && !trimmedLine.startsWith('#')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            if (key && valueParts.length > 0) {
                result[key.trim()] = valueParts.join('=').trim();
            }
        }
    }

    return result;
}

// Run the example
configExample().catch(console.error); 