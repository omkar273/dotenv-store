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

# Test default arguments
echo -e "\n\n=== Testing default arguments ==="
# Copy test env file to root directory for default argument testing
cp examples/.env.test .env

# Test encrypt with default arguments
echo -e "\n\n=== Testing encrypt with default arguments ==="
node ./dist/cli.js encrypt --key test-secret-key

# Test list with default arguments
echo -e "\n\n=== Testing list with default arguments ==="
node ./dist/cli.js list --key test-secret-key

# Test decrypt with default arguments
echo -e "\n\n=== Testing decrypt with default arguments ==="
node ./dist/cli.js decrypt --key test-secret-key

# Test with configuration file
echo -e "\n\n=== Testing with configuration file ==="
# Copy config file to root directory
cp examples/env-store.config.json .

# Test encrypt with config file
echo -e "\n\n=== Testing encrypt with config file ==="
node ./dist/cli.js --config env-store.config.json encrypt --key test-secret-key

# Test list with config file
echo -e "\n\n=== Testing list with config file ==="
node ./dist/cli.js --config env-store.config.json list --key test-secret-key

# Test decrypt with config file
echo -e "\n\n=== Testing decrypt with config file ==="
node ./dist/cli.js --config env-store.config.json decrypt --key test-secret-key

# Test command shortcuts
echo -e "\n\n=== Testing command shortcuts ==="
node ./dist/cli.js e --key test-secret-key
node ./dist/cli.js l --key test-secret-key
node ./dist/cli.js d --key test-secret-key

# Test with different encryption algorithms
echo -e "\n\n=== Testing with different encryption algorithms ==="
# Test AES-256-CBC
echo -e "\n=== Testing AES-256-CBC algorithm ==="
node ./dist/cli.js encrypt --key test-secret-key --algorithm aes-256-cbc --file .env.aes256.enc
node ./dist/cli.js list --key test-secret-key --algorithm aes-256-cbc --file .env.aes256.enc
node ./dist/cli.js decrypt --key test-secret-key --algorithm aes-256-cbc --file .env.aes256.enc

# Test TripleDES
echo -e "\n=== Testing TripleDES algorithm ==="
node ./dist/cli.js encrypt --key test-secret-key --algorithm tripledes --file .env.tripledes.enc
node ./dist/cli.js list --key test-secret-key --algorithm tripledes --file .env.tripledes.enc
node ./dist/cli.js decrypt --key test-secret-key --algorithm tripledes --file .env.tripledes.enc

# Test init command in a temporary directory
echo -e "\n\n=== Testing init command ==="
# Create a temporary directory
TEMP_DIR=$(mktemp -d)
cd $TEMP_DIR

# Create a dummy package.json
echo '{
  "name": "test-env-store",
  "version": "1.0.0",
  "scripts": {}
}' > package.json

# Run init command
echo -e "\n=== Running init command ==="
node $OLDPWD/dist/cli.js init --algorithm aes-256-cbc

# Check if files were created
echo -e "\n=== Checking created files ==="
ls -la

# Check if package.json was updated
echo -e "\n=== Checking package.json ==="
cat package.json

# Check if .gitignore was updated
echo -e "\n=== Checking .gitignore ==="
cat .gitignore

# Go back to original directory
cd $OLDPWD

# Clean up test files
echo -e "\n\n=== Cleaning up test files ==="
rm -f .env .env.store .env.store.enc env-store.config.json .env.aes256.enc .env.tripledes.enc
rm -rf $TEMP_DIR

echo -e "\n\n=== CLI tests completed ==="