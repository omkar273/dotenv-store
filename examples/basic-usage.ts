import envStore, { EnvStore } from '../dist';

// Example 1: Using the default instance
async function exampleWithDefaultInstance() {
    console.log('=== Example with default instance ===');

    // Store environment variables
    const storeResult = await envStore.store({
        API_KEY: 'your-secret-api-key',
        DATABASE_URL: 'mongodb://localhost:27017/mydb',
        JWT_SECRET: 'super-secret-jwt-token'
    });

    console.log('Store result:', storeResult);

    // Retrieve environment variables
    const retrieveResult = await envStore.retrieve();

    if (retrieveResult.success && retrieveResult.data) {
        console.log('Retrieved environment variables:', retrieveResult.data);
    } else {
        console.error('Failed to retrieve:', retrieveResult.error);
    }
}

// Example 2: Using a custom instance with custom options
async function exampleWithCustomInstance() {
    console.log('\n=== Example with custom instance ===');

    // Create custom instance
    const customEnvStore = new EnvStore({
        key: 'my-custom-secret-key',
        fileName: 'custom.env.store',
        filePath: './examples'
    });

    // Store environment variables
    await customEnvStore.store({
        CUSTOM_API_KEY: 'custom-api-key',
        CUSTOM_SECRET: 'custom-secret-value'
    });

    // Retrieve environment variables
    const result = await customEnvStore.retrieve();

    if (result.success && result.data) {
        console.log('Retrieved custom environment variables:', result.data);
    } else {
        console.error('Failed to retrieve custom env vars:', result.error);
    }
}

// Example 3: Using a key file
async function exampleWithKeyFile() {
    console.log('\n=== Example with key file ===');

    // Store a custom key in the key file
    const keyResult = await envStore.setEncryptionKey('secure-encryption-key-from-file');
    console.log('Key file creation result:', keyResult);

    // Store environment variables (will use the key from the file)
    await envStore.store({
        SECRET_FROM_FILE: 'this-was-encrypted-with-key-from-file'
    });

    // Retrieve environment variables (will use the key from the file)
    const result = await envStore.retrieve();

    if (result.success && result.data) {
        console.log('Retrieved environment variables using key file:', result.data);
    } else {
        console.error('Failed to retrieve using key file:', result.error);
    }
}

// Example 5: Using default arguments with CLI
console.log('\n\nExample 5: Using default arguments with CLI');
console.log('----------------------------------------');
console.log('# Encrypt environment variables with default arguments:');
console.log('npx env-store encrypt');
console.log('\n# Decrypt environment variables with default arguments:');
console.log('npx env-store decrypt');
console.log('\n# List environment variables with default arguments:');
console.log('npx env-store list');

// Example 6: Using configuration file with CLI
console.log('\n\nExample 6: Using configuration file with CLI');
console.log('----------------------------------------');
console.log('# Create a configuration file (env-store.config.json):');
console.log(JSON.stringify({
    file: '.env.store',
    output: '.env.store.enc',
    envFile: '.env'
}, null, 2));

console.log('\n# Use the configuration file:');
console.log('npx env-store --config env-store.config.json encrypt --key my-secret-key');
console.log('npx env-store --config env-store.config.json decrypt --key my-secret-key');
console.log('npx env-store --config env-store.config.json list --key my-secret-key');

// Run examples
async function runExamples() {
    try {
        await exampleWithDefaultInstance();
        await exampleWithCustomInstance();
        await exampleWithKeyFile();

        console.log('\nAll examples completed successfully!');
    } catch (error) {
        console.error('Error running examples:', error);
    }
}

runExamples();