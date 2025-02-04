"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.FileCacheManager = void 0;
const crypto = __importStar(require("crypto"));
class FileCacheManager {
    cache;
    constructor() {
        this.cache = new Map();
    }
    /**
     * Get cached components for a file if it exists and matches the hash.
     */
    get(filePath, hash) {
        const cachedEntry = this.cache.get(filePath);
        if (cachedEntry && cachedEntry.hash === hash) {
            return cachedEntry.parsedComponents;
        }
        return null;
    }
    /**
     * Update the cache with a new file hash and parsed components.
     */
    set(filePath, hash, parsedComponents) {
        this.cache.set(filePath, { hash, parsedComponents });
    }
    found(filePath, hash) {
        const cachedEntry = this.cache.get(filePath);
        if (cachedEntry && cachedEntry.hash === hash) {
            return true;
        }
        return false;
    }
    /**
     * Remove entries for files no longer present in the workspace.
     */
    clean(currentFilePaths) {
        for (const cachedFilePath of this.cache.keys()) {
            if (!currentFilePaths.has(cachedFilePath)) {
                this.cache.delete(cachedFilePath);
            }
        }
    }
    /**
     * Compute a hash for file content.
     */
    static computeHash(content) {
        return crypto.createHash('sha256').update(content).digest('hex');
    }
}
exports.FileCacheManager = FileCacheManager;
//# sourceMappingURL=FileCacheManager.js.map