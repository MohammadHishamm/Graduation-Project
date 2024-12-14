import * as crypto from 'crypto';

export class FileCacheManager {
    private cache: Map<string, { hash: string; parsedComponents: any }>;

    constructor() {
        this.cache = new Map();
    }

    /**
     * Get cached components for a file if it exists and matches the hash.
     */
    public get(filePath: string, hash: string): any | null {
        const cachedEntry = this.cache.get(filePath);
        if (cachedEntry && cachedEntry.hash === hash) {
            return cachedEntry.parsedComponents;
        }
        return null;
    }

    /**
     * Update the cache with a new file hash and parsed components.
     */
    public set(filePath: string, hash: string, parsedComponents: any): void {
        this.cache.set(filePath, { hash, parsedComponents });
    }

    /**
     * Remove entries for files no longer present in the workspace.
     */
    public clean(currentFilePaths: Set<string>): void {
        for (const cachedFilePath of this.cache.keys()) {
            if (!currentFilePaths.has(cachedFilePath)) {
                this.cache.delete(cachedFilePath);
            }
        }
    }

    /**
     * Compute a hash for file content.
     */
    public static computeHash(content: string): string {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
