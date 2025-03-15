# dotenv-store

A secure environment variables manager that encrypts and stores environment variables in a file, keeping your sensitive data safe.

## Why dotenv-store?

Environment variables are commonly used to store sensitive information like API keys, database credentials, and other secrets. However, storing these variables in plain text `.env` files can be risky, especially in shared development environments or when accidentally committed to version control.

**dotenv-store** solves this problem by:

1. **Encrypting** your environment variables with strong encryption algorithms
2. **Storing** the encrypted data in a file that can be safely committed to version control
3. **Decrypting** the variables only when needed, using a secure key that stays on your local machine

This approach allows you to:

- **Share** configuration across your team without exposing secrets
- **Safely commit** encrypted environment files to version control
- **Protect** sensitive data from accidental exposure
- **Manage** different environment configurations securely

## Keeping Your Secrets Safe

In modern development, we often need to share configuration across team members while keeping sensitive data secure. Here's why dotenv-store is essential for your project:

### 🔒 Security First

Traditional `.env` files are plain text and can be accidentally committed to version control or exposed in various ways. dotenv-store encrypts your sensitive data with industry-standard algorithms, ensuring that even if the encrypted file is exposed, your secrets remain secure.

### 👥 Team Collaboration

With dotenv-store, you can safely commit the encrypted environment file to your repository, allowing team members to share the same configuration. Only those with the encryption key (which is never committed) can decrypt the variables.

### 🚀 DevOps Friendly

Simplify your CI/CD pipelines by securely managing environment variables across different environments. Use different keys for different environments to maintain separation of concerns.

### 🛡️ Compliance Ready

For projects that need to comply with security regulations (like GDPR, HIPAA, etc.), dotenv-store helps you implement proper security controls around sensitive configuration data.

## Installation

```bash
# Install globally
npm install -g dotenv-store

# Or run with npx
npx dotenv-store [command] [options]

# Or install as a dev dependency in your project
npm install --save-dev dotenv-store
```

## Quick Start

### 1. Initialize dotenv-store in your project

```bash
npx dotenv-store init
```

This will:

- Create a random encryption key and store it in `.env.store.key`
- Add the key file to `.gitignore` to prevent it from being committed
- Create a configuration file with default settings
- Add npm scripts to your package.json for easy usage

### 2. Add your environment variables to `.env`

```
# .env
API_KEY=your_secret_api_key
DATABASE_URL=your_database_connection_string
JWT_SECRET=your_jwt_secret
```

### 3. Encrypt your environment variables

```bash
npx dotenv-store encrypt
```

This will encrypt your `.env` file and store the encrypted data in `.env.store`.

### 4. Commit the encrypted file to version control

```bash
git add .env.store
git commit -m "Add encrypted environment variables"
```

### 5. Decrypt when needed

```bash
npx dotenv-store decrypt
```

This will decrypt the variables and save them to `.env.store.decrypted`.

## Configuration

dotenv-store uses a simple configuration file (`dotenv-store.config.json`) to store your preferences. The default configuration looks like this:

```json
{
  "env-filepath": ".env",
  "store-file-path": ".env.store",
  "decrypted-file-path": ".env.store.decrypted",
  "key-file-path": ".env.store.key",
  "algorithm": "aes"
}
```

You can customize these settings by editing the configuration file or by using command-line options.

## Command Line Usage

### Initialize

```bash
# Basic initialization with default settings
npx dotenv-store init

# Customize the initialization
npx dotenv-store init --algorithm aes-256-cbc --key-file custom-key.key
```

### Encrypt

```bash
# Encrypt using default settings
npx dotenv-store encrypt

# Customize encryption
npx dotenv-store encrypt --env-file custom.env --store-file custom.enc
```

### Decrypt

```bash
# Decrypt using default settings
npx dotenv-store decrypt

# Customize decryption
npx dotenv-store decrypt --store-file custom.enc --decrypted-file custom.dec
```

### List Variables

```bash
# List encrypted variables
npx dotenv-store list
```

### Set Key

```bash
# Generate and set a random encryption key
npx dotenv-store set-key

# Set a specific encryption key
npx dotenv-store set-key --key your-secret-key
```

## Using with npm Scripts

After initialization, you can use the npm scripts added to your package.json:

```bash
# Encrypt
npm run env:encrypt

# Decrypt
npm run env:decrypt
```

## Security Best Practices

1. **Never commit** your `.env.store.key` file to version control
2. **Keep your key secure** and share it through secure channels with your team
3. **Rotate keys periodically** for enhanced security
4. **Use a strong algorithm** like aes-256-cbc for highly sensitive data

## Detailed CLI Options

### Initialize Options

| Option                    | Description                       | Default                    |
| ------------------------- | --------------------------------- | -------------------------- |
| `--config <file>`         | Path to configuration file        | `dotenv-store.config.json` |
| `--algorithm <algorithm>` | Encryption algorithm to use       | `aes`                      |
| `--key-file <file>`       | Path to key file                  | `.env.store.key`           |
| `--env-file <file>`       | Path to .env file                 | `.env`                     |
| `--store-file <file>`     | Path to store encrypted variables | `.env.store`               |
| `--decrypted-file <file>` | Path to store decrypted variables | `.env.store.decrypted`     |

### Encrypt Options

| Option                        | Description                       | Default                    |
| ----------------------------- | --------------------------------- | -------------------------- |
| `--config <file>`             | Path to configuration file        | `dotenv-store.config.json` |
| `-k, --key <key>`             | Encryption key                    | -                          |
| `-f, --key-file <file>`       | Path to key file                  | `.env.store.key`           |
| `-a, --algorithm <algorithm>` | Encryption algorithm              | `aes`                      |
| `-e, --env-file <file>`       | Path to .env file                 | `.env`                     |
| `-s, --store-file <file>`     | Path to store encrypted variables | `.env.store`               |

### Decrypt Options

| Option                        | Description                        | Default                    |
| ----------------------------- | ---------------------------------- | -------------------------- |
| `--config <file>`             | Path to configuration file         | `dotenv-store.config.json` |
| `-k, --key <key>`             | Encryption key                     | -                          |
| `-f, --key-file <file>`       | Path to key file                   | `.env.store.key`           |
| `-s, --store-file <file>`     | Path to encrypted store file       | `.env.store`               |
| `-d, --decrypted-file <file>` | Path to output decrypted variables | `.env.store.decrypted`     |

### List Options

| Option                    | Description                  | Default                    |
| ------------------------- | ---------------------------- | -------------------------- |
| `--config <file>`         | Path to configuration file   | `dotenv-store.config.json` |
| `-k, --key <key>`         | Encryption key               | -                          |
| `-f, --key-file <file>`   | Path to key file             | `.env.store.key`           |
| `-s, --store-file <file>` | Path to encrypted store file | `.env.store`               |

### Set Key Options

| Option              | Description                | Default                    |
| ------------------- | -------------------------- | -------------------------- |
| `--config <file>`   | Path to configuration file | `dotenv-store.config.json` |
| `-k, --key <key>`   | Encryption key to store    | Random generated key       |
| `-f, --file <file>` | Key file path              | `.env.store.key`           |

### Command Shortcuts

| Command   | Shortcut | Description                                    |
| --------- | -------- | ---------------------------------------------- |
| `init`    | `i`      | Initialize dotenv-store in the current project |
| `encrypt` | `e`      | Encrypt environment variables                  |
| `decrypt` | `d`      | Decrypt environment variables                  |
| `list`    | `l`      | List environment variables                     |
| `set-key` | `k`      | Set the encryption key in a key file           |

## Encryption Details

dotenv-store supports multiple encryption algorithms to secure your environment variables:

- `aes` (default) - AES encryption with 256-bit key
- `aes-256-cbc` - AES in CBC mode with 256-bit key
- `tripledes` - Triple DES encryption
- `rabbit` - Rabbit stream cipher
- `rc4` - RC4 stream cipher

The encryption process:

1. Converts your environment variables to a JSON string
2. Encrypts the string using the selected algorithm and your secret key
3. Stores the encrypted data in a file that can be safely committed to version control

When you encrypt environment variables, dotenv-store automatically includes information about which algorithm was used in the encrypted file itself. This means you don't need to remember or specify which algorithm was used when decrypting - dotenv-store will automatically use the correct algorithm.

## Key Management

dotenv-store requires an encryption key to encrypt and decrypt your environment variables. You have two options:

1. **Store the key in a file** (recommended):

   - Generate a key with `npx dotenv-store set-key`
   - The key is stored in `.env.store.key` by default
   - Add this file to your `.gitignore` to keep it secure
   - Share this key securely with your team members

2. **Provide the key directly**:
   - Pass the key with the `--key` option
   - This is less secure but useful for CI/CD environments

> **Important:** If no key file is found and no key is provided, dotenv-store will show an error with instructions on how to create a key.

## License

MIT
