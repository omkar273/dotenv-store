/**
 * Example demonstrating how dotdotenv-store tracks encryption algorithms
 */

import fs from 'fs-extra';
import { EnvStore } from '../src';

async function algorithmTrackingExample() {
    console.log('=== Algorithm Tracking Example ===');

    // Sample environment variables
    const envVars = {
        API_KEY: 'my-api-key-12345',
        DATABASE_URL: 'postgres://user:password@localhost:5432/mydb',
        SECRET_TOKEN: 'super-secret-token',
        DEBUG: 'true'
    };

    // Create a temporary directory for this example
    const tempDir = './temp-algorithm-tracking';
    await fs.ensureDir(tempDir);

    try {
        // Step 1: Encrypt with a non-default algorithm
        console.log('\n=== Step 1: Encrypting with AES-256-CBC ===');
        const encryptionAlgorithm = 'aes-256-cbc';

        const encryptStore = new EnvStore({
            key: 'test-encryption-key',
            fileName: 'env.enc',
            filePath: tempDir,
            algorithm: encryptionAlgorithm
        });

        const encryptResult = await encryptStore.store(envVars);

        if (encryptResult.success) {
            console.log(`Environment variables encrypted with ${encryptionAlgorithm}`);

            // Show the encrypted content (for demonstration purposes)
            const encryptedFilePath = `${tempDir}/env.enc`;
            const encryptedContent = await fs.readFile(encryptedFilePath, 'utf8');
            console.log('\nEncrypted content:');
            console.log(encryptedContent);
            console.log('\nNotice that the algorithm information is embedded in the encrypted content.');

            // Step 2: Decrypt without specifying the algorithm
            console.log('\n=== Step 2: Decrypting without specifying the algorithm ===');
            console.log('The algorithm will be automatically detected from the encrypted content.');

            // Create a new EnvStore instance with the default algorithm (AES)
            const decryptStore = new EnvStore({
                key: 'test-encryption-key',
                fileName: 'env.enc',
                filePath: tempDir,
                // Not specifying the algorithm here, so it will use the default 'aes'
            });

            const decryptResult = await decryptStore.retrieve();

            if (decryptResult.success && decryptResult.data && !('filePath' in decryptResult.data)) {
                console.log('\nDecrypted environment variables:');
                for (const [key, value] of Object.entries(decryptResult.data)) {
                    console.log(`${key}=${value}`);
                }
                console.log('\nSuccessfully decrypted with automatic algorithm detection!');
            } else {
                console.error('Failed to decrypt environment variables');
            }
        } else {
            console.error('Failed to encrypt environment variables');
        }

        console.log('\n=== CLI Usage with Algorithm Tracking ===');
        console.log('# Encrypt with a non-default algorithm:');
        console.log('npx dotdotenv-store encrypt --algorithm aes-256-cbc --key my-secret-key');

        console.log('\n# Decrypt without specifying the algorithm:');
        console.log('npx dotdotenv-store decrypt --key my-secret-key');
        console.log('# The algorithm will be automatically detected from the encrypted content');
    } finally {
        // Clean up
        await fs.remove(tempDir);
    }
}

// Run the example
algorithmTrackingExample().catch(console.error); 