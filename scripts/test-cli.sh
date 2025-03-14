#!/bin/bash

# Build the package
echo "Building env-store..."
npm run build

# Test directly via node
echo -e "\n\n=== Testing help command ==="
node ./dist/cli.js --help

# Test encrypt command with .env file
echo -e "\n\n=== Testing encrypt command with .env file ==="
node ./dist/cli.js encrypt --env-file examples/.env.test --file examples/.env.test.enc --key test-secret-key

# Test list command
echo -e "\n\n=== Testing list command ==="
node ./dist/cli.js list --file examples/.env.test.enc --key test-secret-key

# Test decrypt command with output file
echo -e "\n\n=== Testing decrypt command with output file ==="
node ./dist/cli.js decrypt --file examples/.env.test.enc --output examples/.env.test.dec --key test-secret-key

# Compare original and decrypted files
echo -e "\n\n=== Original .env file ==="
cat examples/.env.test

echo -e "\n\n=== Decrypted .env file ==="
cat examples/.env.test.dec

# Test set-key command
echo -e "\n\n=== Testing set-key command ==="
node ./dist/cli.js set-key --key new-test-key --file examples/.env.test.key

echo -e "\n\n=== CLI tests completed ==="