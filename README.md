# env-store

A secure environment variables manager that encrypts and stores environment variables in a file.

## Features

- Encrypt environment variables
- Store encrypted variables in a file
- Decrypt and retrieve variables when needed
- Customizable encryption key
- Customizable file path and name
- Support for storing encryption key in a separate file

## Installation

```bash
npm install env-store
```

## Usage

### Basic Usage

```typescript
import envStore from "env-store";

// Store environment variables
const storeResult = await envStore.store({
  API_KEY: "your-api-key",
  DATABASE_URL: "your-db-url",
  SECRET: "your-secret",
});

if (storeResult.success) {
  console.log("Environment variables stored successfully");
} else {
  console.error("Failed to store environment variables:", storeResult.error);
}

// Retrieve environment variables
const retrieveResult = await envStore.retrieve();

if (retrieveResult.success && retrieveResult.data) {
  console.log("Environment variables:", retrieveResult.data);
  // Use the variables in your application
  const apiKey = retrieveResult.data.API_KEY;
} else {
  console.error(
    "Failed to retrieve environment variables:",
    retrieveResult.error
  );
}
```

### Custom Configuration

```typescript
import { EnvStore } from "env-store";

// Create a custom instance with your own configuration
const customEnvStore = new EnvStore({
  key: "my-custom-encryption-key",
  fileName: "custom.env.store",
  filePath: "./config",
  keyFilePath: "./config/encryption.key",
});

// Store your environment variables
await customEnvStore.store({
  API_KEY: "your-api-key",
  DATABASE_URL: "your-db-url",
});

// Retrieve your environment variables
const result = await customEnvStore.retrieve();
```

### Store Encryption Key in a File

```typescript
import envStore from "env-store";

// Set a custom encryption key in a file
await envStore.setEncryptionKey("my-secure-encryption-key");

// The key will be read from the file automatically when storing/retrieving
await envStore.store({ API_KEY: "your-api-key" });
const result = await envStore.retrieve();
```

## API

### EnvStore

The main class for managing environment variables.

#### Constructor

```typescript
new EnvStore(config?: EnvStoreConfig)
```

`EnvStoreConfig` options:

- `key`: Secret key for encryption/decryption (default: 'env-store-key')
- `fileName`: File name for storing encrypted environment variables (default: '.env.store')
- `filePath`: File path for storing environment files (default: project root)
- `keyFilePath`: Path to the key file for reading encryption key (default: '.env.store.key')

#### Methods

- `store(envVars: Record<string, string>): Promise<EnvResult>` - Encrypts and stores environment variables
- `retrieve(): Promise<EnvResult>` - Retrieves and decrypts environment variables
- `setEncryptionKey(key: string): Promise<EnvResult>` - Stores the encryption key in a file

## License

MIT
