export * from './EnvStore';
export * from './types';

// Export a default instance with default config for convenience
import { EnvStore } from './EnvStore';
export default new EnvStore();
