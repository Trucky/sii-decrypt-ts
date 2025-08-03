/**
 * # SII Decrypt TypeScript
 * 
 * A modern TypeScript library for decrypting and decoding SCS Software save game files (SII) from American Truck Simulator and Euro Truck Simulator 2.
 * 
 * ## Installation
 * 
 * ```bash
 * npm install sii-decrypt-ts
 * ```
 * 
 * ## Quick Start
 * 
 * ```typescript
 * import { Decryptor } from 'sii-decrypt-ts';
 * import * as fs from 'fs';
 * 
 * // Decrypt and decode an SII file
 * const decodedData = Decryptor.decrypt('./save_game.sii', true);
 * 
 * // Save the result
 * fs.writeFileSync('./decoded_save_game.sii', decodedData);
 * ```
 * 
 * ## Features
 * 
 * - ✅ Decrypt encrypted SII files using AES-256-CBC
 * - ✅ Decompress zlib-compressed data
 * - ✅ Decode binary format SII files
 * - ✅ Support for all SII data types (strings, vectors, arrays, etc.)
 * - ✅ Full TypeScript support with type definitions
 * - ✅ Node.js native crypto and zlib (no external dependencies)
 * 
 * ## Supported File Types
 * 
 * - **Encrypted SII files** - Game save files that are encrypted and compressed
 * - **Binary SII files** - Unencrypted but binary-encoded save files
 * - **Plain text SII files** - Human-readable save files
 * 
 * ## API Reference
 * 
 * ### Decryptor.decrypt(filePath: string, decode?: boolean): Buffer
 * 
 * Main function to decrypt and decode SII files.
 * 
 * **Parameters:**
 * - `filePath`: Path to the SII file
 * - `decode`: Whether to decode the binary data (default: true)
 * 
 * **Returns:** Buffer containing the decoded SII data as UTF-8 text
 * 
 * ## Data Types Supported
 * 
 * The library supports all SII data types including:
 * - UTF-8 strings and string arrays
 * - Encoded strings (base-38 encoding)
 * - Single precision floats and float arrays
 * - Integer types (16-bit, 32-bit, 64-bit)
 * - Boolean arrays
 * - Vector types (2D, 3D, 4D, 7D, 8D)
 * - Complex ID types
 * - Ordinal string lists
 * 
 * ## License
 * 
 * MIT License - See LICENSE file for details
 * 
 * ## Contributing
 * 
 * Contributions are welcome! Please read the contributing guidelines before submitting PRs.
 * 
 * ## Credits
 * 
 * This TypeScript port is based on the original C# SIIDecryptSharp library.
 */