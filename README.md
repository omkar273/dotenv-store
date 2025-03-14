# env-store

A secure environment variables manager that encrypts and stores environment variables in a file.

## Features

- Encrypt environment variables
- Store encrypted variables in a file
- Decrypt and retrieve variables when needed
- Customizable encryption key
- Multiple encryption algorithms (AES, AES-256-CBC, TripleDES, Rabbit, RC4)
- Automatic algorithm tracking in encrypted files
- Customizable file path and name
- Support for storing encryption key in a separate file
- Command-line interface (CLI) with shortcuts
- Configuration file support
- Project initialization with auto-configuration

## Installation

```bash
# Install globally
npm install -g env-store

# Or run with npx
npx env-store [command] [options]
```

## CLI Usage

### Initialize Your Project

The easiest way to get started is to initialize env-store in your project:

```bash
# Initialize with default settings (AES encryption)
npx env-store init

# Initialize with custom configuration file
npx env-store init --config custom-config.json

# Initialize with a specific encryption algorithm
npx env-store init --algorithm aes-256-cbc
```

This will:

- Create a configuration file
- Generate a secure encryption key and store it in `.env.store.key`
- Add `.env.store.key` to your `.gitignore` file
- Add `env:encrypt` and `env:decrypt` scripts to your `package.json`

### Basic Commands

The CLI supports simple commands with default arguments and shortcuts:

```bash
# Encrypt environment variables (reads from .env by default)
npx env-store encrypt
# Or use the shortcut
npx env-store e

# Decrypt environment variables (reads from .env.store by default)
npx env-store decrypt
# Or use the shortcut
npx env-store d

# List environment variables (reads from .env.store by default)
npx env-store list
# Or use the shortcut
npx env-store l
```

### Encrypt Environment Variables

```bash
# Basic usage with defaults (AES encryption)
npx env-store encrypt

# Encrypt individual variables
npx env-store encrypt --env API_KEY=your-api-key --env DB_URL=your-db-url

# Encrypt from a .env file
npx env-store encrypt --env-file .env

# Specify a custom output file
npx env-store encrypt --env-file .env --file .env.store --output .env.store.enc

# Use a custom encryption key
npx env-store encrypt --key my-secret-key --file .env.store --output .env.store.enc

# Use a key stored in a file
npx env-store encrypt --key-file .env.key

# Use a specific encryption algorithm
npx env-store encrypt --algorithm aes-256-cbc
```

### Decrypt Environment Variables

```bash
# Basic usage with defaults
npx env-store decrypt

# Decrypt with custom options
npx env-store decrypt --key my-secret-key --file .env.store.enc --output .env.store.dec

# Use a key stored in a file
npx env-store decrypt --key-file .env.key --file .env.store.enc

# Use a specific encryption algorithm (not needed if algorithm tracking is enabled)
npx env-store decrypt --algorithm aes-256-cbc
```

> **Note:** When using non-default encryption algorithms, the algorithm information is securely stored within the encrypted file itself. This means you don't need to specify the algorithm when decrypting - env-store will automatically detect and use the correct algorithm.

### List Environment Variables

```bash
# Basic usage with defaults
npx env-store list

# List with custom options
npx env-store list --key my-secret-key --file .env.store
```

### Using Configuration File

You can use a configuration file to specify options:

```bash
# Use a configuration file
npx env-store --config env-store.config.json encrypt
```

The configuration file should be named `env-store.config.json` and placed in the root of your project:

```json
{
  "file": ".env.store",
  "output": ".env.store.enc",
  "envFile": ".env",
  "algorithm": "aes-256-cbc"
}
```

When using a configuration file, you can only pass the `key` parameter as an argument:

```bash
# Use config file with a custom key
npx env-store --config env-store.config.json encrypt --key my-secret-key
```

### Set Encryption Key

```bash
# Set a custom encryption key in a file
npx env-store set-key --key your-secret-key

# Specify a custom key file path
npx env-store set-key --key your-secret-key --file custom-key-file
```

### Help

```bash
# Get help for all commands
npx env-store --help

# Get help for a specific command
npx env-store encrypt --help
```

## Programmatic Usage

For advanced use cases, you can also use the package programmatically in your Node.js applications:

```typescript
import { EnvStore } from "env-store";

// Create a custom instance with your own configuration
const customEnvStore = new EnvStore({
  key: "my-custom-encryption-key",
  fileName: "custom.env.store",
  filePath: "./config",
  keyFilePath: "./config/encryption.key",
  algorithm: "aes-256-cbc",
});

// Store your environment variables
await customEnvStore.store({
  API_KEY: "your-api-key",
  DATABASE_URL: "your-db-url",
});

// Retrieve your environment variables
const result = await customEnvStore.retrieve();
```

## Supported Encryption Algorithms

env-store supports the following encryption algorithms:

- `aes` (default) - AES encryption
- `aes-256-cbc` - AES-256-CBC encryption
- `tripledes` - Triple DES encryption
- `rabbit` - Rabbit stream cipher
- `rc4` - RC4 stream cipher

## Algorithm Tracking

When you encrypt environment variables, env-store automatically includes information about which algorithm was used in the encrypted file itself. This information is:

- Encrypted with a separate key for additional security
- Embedded directly in the encrypted file
- Automatically detected during decryption
- Includes a warning not to edit the file manually

This means you don't need to remember or specify which algorithm was used when decrypting - env-store will automatically use the correct algorithm.

> **Warning:** When using non-default encryption algorithms, do not edit the encrypted files manually. Doing so could corrupt the algorithm tracking information and make decryption impossible.

## API Reference

### CLI Options

| Command    | Option                    | Description                               | Default                 |
| ---------- | ------------------------- | ----------------------------------------- | ----------------------- |
| `init`     | `--config <file>`         | Path to configuration file                | `env-store.config.json` |
|            | `--algorithm <algorithm>` | Encryption algorithm to use               | `aes`                   |
| `encrypt`  | `-k, --key <key>`         | Encryption key                            | `env-store-key`         |
|            | `-f, --file <file>`       | Output file path                          | `.env.store`            |
|            | `-e, --env <keyValue...>` | Environment variables in KEY=VALUE format |                         |
|            | `--env-file <file>`       | Read variables from a .env file           | `.env` (default)        |
|            | `--key-file <file>`       | File containing the encryption key        |                         |
|            | `--output <file>`         | Output file for encrypted variables       | Same as `file`          |
|            | `--algorithm <algorithm>` | Encryption algorithm to use               | `aes`                   |
| `decrypt`  | `-k, --key <key>`         | Encryption key                            | `env-store-key`         |
|            | `-f, --file <file>`       | Input file path                           | `.env.store`            |
|            | `-o, --output <file>`     | Output file path for decrypted variables  |                         |
|            | `--key-file <file>`       | File containing the encryption key        |                         |
|            | `--algorithm <algorithm>` | Encryption algorithm to use               | `aes`                   |
| `list`     | `-k, --key <key>`         | Encryption key                            | `env-store-key`         |
|            | `-f, --file <file>`       | Input file path                           | `.env.store`            |
|            | `--key-file <file>`       | File containing the encryption key        |                         |
|            | `--algorithm <algorithm>` | Encryption algorithm to use               | `aes`                   |
| `set-key`  | `-k, --key <key>`         | Encryption key to store                   | `env-store-key`         |
|            | `-f, --file <file>`       | Key file path                             | `.env.store.key`        |
| `--config` | `<file>`                  | Path to configuration file                | `env-store.config.json` |

### Command Shortcuts

| Command   | Shortcut | Description                                 |
| --------- | -------- | ------------------------------------------- |
| `init`    | `i`      | Initialize env-store in the current project |
| `encrypt` | `e`      | Encrypt environment variables               |
| `decrypt` | `d`      | Decrypt environment variables               |
| `list`    | `l`      | List environment variables                  |
| `set-key` | `k`      | Set the encryption key in a key file        |

### Configuration File

The configuration file (`env-store.config.json`) supports the following options:

```json
{
  "file": ".env.store",
  "output": ".env.store.enc",
  "envFile": ".env",
  "algorithm": "aes-256-cbc"
}
```

When using a configuration file, only the `key` parameter can be passed as a command-line argument.

### EnvStore Class

The main class for managing environment variables programmatically.

#### Constructor

```typescript
new EnvStore(config?: EnvStoreConfig)
```

`EnvStoreConfig` options:

- `key`: Secret key for encryption/decryption (default: 'env-store-key')
- `fileName`: File name for storing encrypted environment variables (default: '.env.store')
- `filePath`: File path for storing environment files (default: project root)
- `keyFilePath`: Path to the key file for reading encryption key (default: '.env.store.key')
- `algorithm`: Encryption algorithm to use (default: 'aes')

#### Methods

- `store(envVars: Record<string, string>, filePath?: string): Promise<EnvResult>` - Encrypts and stores environment variables
- `retrieve(filePath?: string): Promise<EnvResult>` - Retrieves and decrypts environment variables
- `setEncryptionKey(key: string): Promise<EnvResult>` - Stores the encryption key in a file

## License

MIT
