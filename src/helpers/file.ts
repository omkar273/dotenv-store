import fs from 'fs-extra';
import path from 'path';

/**
 * Reads a file from the specified path
 * @param filePath - Path to the file
 * @returns File content as string or null if file doesn't exist
 */
export const readFile = async (filePath: string): Promise<string | null> => {
    try {
        // Check if file exists
        if (await fs.pathExists(filePath)) {
            return await fs.readFile(filePath, 'utf8');
        }
        return null;
    } catch (error) {
        throw new Error(`Failed to read file: ${(error as Error).message}`);
    }
};

/**
 * Writes content to a file at the specified path
 * @param filePath - Path to the file
 * @param content - Content to write
 */
export const writeFile = async (filePath: string, content: string): Promise<void> => {
    try {
        // Ensure directory exists
        await fs.ensureDir(path.dirname(filePath));
        await fs.writeFile(filePath, content, 'utf8');
    } catch (error) {
        throw new Error(`Failed to write file: ${(error as Error).message}`);
    }
};

/**
 * Gets the absolute path from a relative path or returns the provided path if it's already absolute
 * @param relativePath - Relative path from the process.cwd() or an absolute path
 * @returns Absolute path
 */
export const getAbsolutePath = (relativePath: string): string => {
    return path.isAbsolute(relativePath)
        ? relativePath
        : path.resolve(process.cwd(), relativePath);
}; 