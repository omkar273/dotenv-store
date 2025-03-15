/**
 * Example demonstrating how to use dotdotenv-store with different encryption algorithms
 */

import { EnvStore } from '../src';

async function algorithmExample() {
    console.log('=== Encryption Algorithm Example ===');

    // Sample environment variables
    const envVars = {
        API_KEY: 'my-api-key-12345',
        DATABASE_URL: 'postgres://user:password@localhost:5432/mydb',
        SECRET_TOKEN: 'super-secret-token',
        DEBUG: 'true'
    };

    // Test different encryption algorithms
    const algorithms = ['aes', 'aes-256-cbc', 'tripledes', 'rabbit', 'rc4'] as const;

    for (const algorithm of algorithms) {
        console.log(`\n=== Using ${algorithm} encryption ===`);

        // Create an EnvStore instance with the specific algorithm
        const envStore = new EnvStore({
            key: 'test-encryption-key',
            fileName: `.env.${algorithm}.store`,
            algorithm
        });

        // Store the variables
        const storeResult = await envStore.store(envVars);

        if (storeResult.success) {
            console.log(`Environment variables encrypted with ${algorithm} successfully`);

            // Retrieve the variables
            const retrieveResult = await envStore.retrieve();

            if (retrieveResult.success && retrieveResult.data && !('filePath' in retrieveResult.data)) {
                console.log('Retrieved environment variables:');
                for (const [key, value] of Object.entries(retrieveResult.data)) {
                    console.log(`${key}=${value}`);
                }
            } else {
                console.error(`Failed to retrieve environment variables with ${algorithm}`);
            }
        } else {
            console.error(`Failed to store environment variables with ${algorithm}`);
        }
    }

    console.log('\n=== CLI Usage with Different Algorithms ===');
    console.log('# Encrypt with AES-256-CBC:');
    console.log('npx dotdotenv-store encrypt --algorithm aes-256-cbc --key my-secret-key');

    console.log('\n# Decrypt with AES-256-CBC:');
    console.log('npx dotdotenv-store decrypt --algorithm aes-256-cbc --key my-secret-key');

    console.log('\n# Initialize with TripleDES:');
    console.log('npx dotdotenv-store init --algorithm tripledes');

    console.log('\n# Using algorithm in config file:');
    console.log(JSON.stringify({
        file: '.env.store',
        output: '.env.store.enc',
        envFile: '.env',
        algorithm: 'aes-256-cbc'
    }, null, 2));
}

// Run the example
algorithmExample().catch(console.error); 