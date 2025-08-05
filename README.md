# SII Decrypt TypeScript

A modern TypeScript library for decrypting and decoding SCS Software game save files (SII format) from American Truck Simulator and Euro Truck Simulator 2.

## Features

- ✅ **Decrypt encrypted SII files** using AES-256-CBC encryption
- ✅ **Decompress zlib-compressed data** automatically  
- ✅ **Decode binary format SII files** (BSII) with structure parsing
- ✅ **Support for 39 different data types** (strings, vectors, arrays, etc.)
- ✅ **Multiple format versions** (Binary format versions 1, 2, and 3)
- ✅ **Full TypeScript support** with comprehensive type definitions
- ✅ **Zero external dependencies** - uses Node.js native crypto and zlib
- ✅ **Detailed metadata** in results including format type and encryption status

## Installation

```bash
npm install sii-decrypt-ts
```

## Quick Start

```typescript
import { SIIDecryptor } from "sii-decrypt-ts";

// Decrypt and decode an SII file
const result = SIIDecryptor.decrypt("./save_game.sii", true);

if (result.success) {
    console.log(`File type: ${result.type}`);
    console.log(`Was encrypted: ${result.encrypted || false}`);
    
    // Access the decoded text content
    console.log(result.string_content);
    
    // Or work with the buffer directly
    const textData = result.data.toString();
}
```

## Supported File Formats

The library automatically detects and handles multiple SII file formats:

| Format | Signature | Description |
|--------|-----------|-------------|
| **Plain Text** | `SiiS` (0x53696953) | Unencrypted, human-readable text format |
| **Encrypted** | `SrcC` (0x43727953) | AES-256-CBC encrypted + zlib compressed |
| **Binary** | `SIIB` (0x42494953) | Binary format with structured data blocks |
| **3nK** | `3nK` (0x014B6E33) | Reserved format (not yet implemented) |

## API Reference

### SIIDecryptor.decrypt(filePath: string, decode?: boolean): SIIDecryptResult

Main function to decrypt and decode SII files.

**Parameters:**
- `filePath` (string): Path to the SII file
- `decode` (boolean, optional): Whether to decode binary data to text format (default: true)

**Returns:** `SIIDecryptResult` object with the following properties:
- `success` (boolean): Whether the operation succeeded
- `data` (Buffer): The processed file data
- `string_content` (string, optional): Text content when decode=true and successful
- `type` ("plain" | "encrypted" | "binary" | "3nK"): Detected file format
- `encrypted` (boolean, optional): Whether the file was encrypted
- `binaryFormatInfo` (object, optional): Additional info for binary format files
- `error` (string, optional): Error message if operation failed

**Example:**
```typescript
import { SIIDecryptor } from "sii-decrypt-ts";

const result = SIIDecryptor.decrypt("game.sii", true);

if (result.success) {
    // Work with the result
    console.log(result.string_content);
} else {
    console.error("Failed to decrypt:", result.error);
}
```

### Advanced Usage

```typescript
import { 
    SIIDecryptor, 
    BSIIDecoder, 
    BSIITypeDecoder,
    SignatureType 
} from "sii-decrypt-ts";

// Direct binary format decoding
const binaryData = /* your Buffer data */;
if (binaryData.readUInt32LE(0) === SignatureType.Binary) {
    const decoded = BSIIDecoder.decode(binaryData);
    console.log("Binary format version:", decoded.header?.version);
}

// Low-level type decoding
const offset = { value: 0 };
const stringValue = BSIITypeDecoder.decodeUTF8String(binaryData, offset);
```

## Supported Data Types

The library supports all 39 SII data types used by the games:

### Basic Types
- **UTF-8 Strings** (0x01) - Text data, file paths, names
- **Encoded Strings** (0x03) - Base-38 encoded identifiers  
- **Floats** (0x05) - 32-bit IEEE 754 floating point
- **Booleans** (0x35) - True/false values
- **Integers** - 16-bit (0x29, 0x2B), 32-bit (0x25, 0x27), 64-bit (0x31, 0x33)

### Vector Types
- **Vector2** (0x07) - 2D coordinates, UV mapping
- **Vector3** (0x09) - 3D positions, rotations, colors
- **Vector4** (0x17) - Quaternions, RGBA colors
- **Vector8** (0x19) - Enhanced position data with bias compensation
- **Int32 Vector3** (0x11) - Discrete 3D coordinates

### Array Types
- Arrays of all basic types (0x02, 0x04, 0x06, etc.)
- Vector arrays (0x08, 0x0A, 0x12, 0x18, 0x1A)
- Specialized arrays for different data formats

### Complex Types
- **ID References** (0x39, 0x3B, 0x3D) - Object identifiers and references
- **Ordinal Strings** (0x37) - String table references for optimization

For complete details, see [DOCS.md](./DOCS.md).

## Binary Format Versions

The library supports multiple versions of the binary SII format:

- **Version 1**: Basic binary format with essential data types
- **Version 2**: Enhanced vector support and improved precision  
- **Version 3**: Additional data types and optimizations

Version differences are handled automatically, with backward compatibility maintained.

## Error Handling

The library provides comprehensive error handling:

```typescript
try {
    const result = SIIDecryptor.decrypt("game.sii", true);
    
    if (!result.success) {
        console.error("Decryption failed:", result.error);
        return;
    }
    
    // Process successful result
    console.log("Decrypted successfully!");
    
} catch (error) {
    // Handle file system errors, invalid formats, etc.
    console.error("Exception:", error.message);
}
```

## Documentation

For detailed technical documentation, including:
- Complete data type reference
- Binary format specifications  
- Encryption/decryption process details
- Advanced usage examples

See [DOCS.md](./DOCS.md)

## License

MIT License - See [LICENSE](./LICENSE) file for details.

## Contributing

Contributions are welcome! Please read the contributing guidelines before submitting pull requests.

## Credits

This TypeScript library is inspired by the excellent work done on [SII_Decrypt](https://github.com/TheLazyTomcat/SII_Decrypt) by TheLazyTomcat and [SII-DecryptSharp](https://gitlab.com/jammerxd/sii-decryptsharp) by jammerxd. These original projects provided invaluable insights into the SII file format structure and decryption methods used by SCS Software games.

Special thanks to both TheLazyTomcat and jammerxd for their thorough reverse engineering work that made this TypeScript port possible.
