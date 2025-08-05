# SII Decrypt TypeScript - Technical Documentation

## Overview

The SII Decrypt TypeScript library is designed to decrypt and decode game save files from SCS Software games (Euro Truck Simulator 2, American Truck Simulator). These files use a proprietary format called SII (SCS Internal format) which can be encrypted, compressed, and stored in various binary formats.

## Architecture

The library consists of several main components:

1. **SIIDecryptor** - Main entry point for decryption
2. **BSIIDecoder** - Binary SII format decoder
3. **BSIITypeDecoder** - Low-level data type decoder
4. **BSIISerializer** - Converts binary data to human-readable text format
5. **StreamUtils** - Utility functions for binary stream processing

## File Format Types

The library supports four different SII file formats:

### 1. Plain Text (0x53696953 - "SiiS")
- Unencrypted, human-readable text format
- Contains data structures directly in text format
- No additional processing required

### 2. Encrypted (0x43727953 - "SrcC") 
- AES-256-CBC encrypted format
- Uses a hardcoded 32-byte key and 16-byte IV extracted from file
- IV is located at bytes 36-52 of the encrypted file
- Ciphertext starts at byte 56
- Data is compressed with zlib after decryption
- Requires decryption before further processing

### 3. Binary (0x42494953 - "SIIB")
- Binary format with structured data blocks
- Contains type information and serialized data
- Supports multiple format versions (1, 2, 3)
- Requires decoding through BSIIDecoder

### 4. 3nK Format (0x014B6E33)
- Not currently implemented
- Reserved for future use

## SIIDecryptor Workflow

```
Input File → Signature Detection → Decryption (if encrypted) → 
Decompression (if encrypted) → Format Detection → 
Decoding (if binary) → Text Output (if decode=true)
```

### Process Steps:
1. **File Reading**: Load file and validate existence
2. **Signature Check**: Read first 4 bytes to identify format
3. **Decryption**: If encrypted (SrcC), apply AES-256-CBC decryption
4. **Decompression**: If encrypted, decompress with zlib
5. **Format Analysis**: Determine final format (Plain/Binary/3nK)
6. **Decoding**: If binary format and decode=true, convert to text
7. **Result**: Return structured result with data and metadata

### 1. File Type Detection
The decryptor reads the file signature (first 4 bytes) to determine the format:
- **0x53696953** ("SiiS"): Plain text format
- **0x43727953** ("SrcC"): Encrypted format  
- **0x42494953** ("SIIB"): Binary format
- **0x014B6E33**: 3nK format (not implemented)

For encrypted files, performs AES-256-CBC decryption using:
- **Key**: 32-byte hardcoded key (`0x2a5fcb1791d22fb60245b3d8369ed0b2c27371563fbf1f3c9edf6b11825a5d0a`)
- **IV**: 16 bytes extracted from file offset 36-52
- **Data**: Ciphertext starting at offset 56
- **Post-processing**: zlib inflation of decrypted data

### 2. Format Processing
Based on the detected format:
- **Plain Text**: Returns data as-is
- **Binary**: Processes through BSIIDecoder for structure parsing
- **3nK**: Throws error (not implemented)

## Binary SII (BSII) Format Structure

### File Header
- **Signature** (4 bytes): Binary format identifier
- **Version** (4 bytes): Format version (1, 2, or 3)

### Block Structure
The BSII format consists of structure definition blocks and data instance blocks:

#### Structure Definition Block (Type 0)
- **Block Type** (4 bytes): Always 0 for structure definitions
- **Validity** (1 byte): Boolean indicating if block is valid
- **Structure ID** (4 bytes): Unique identifier for this structure type
- **Name** (variable): UTF-8 string with structure name
- **Segments** (variable): Array of data field definitions

#### Data Instance Block (Type > 0)
- **Block Type** (4 bytes): References a Structure ID
- **Instance ID** (variable): Unique identifier for this data instance
- **Data Values** (variable): Actual values for each field defined in the structure

## Data Types and Binary Encoding

The BSII format supports 39 different data types, each with a specific binary encoding and text serialization format:

### Basic Types

#### UTF-8 String (0x01)
- **Binary**: Length (4 bytes) + UTF-8 bytes
- **Text**: `field_name: "string_value"`
- Used for text data, file paths, names

#### Encoded String (0x03) 
- **Binary**: 64-bit value encoded using base-38 character table
- **Text**: `field_name: encoded_value`
- Uses character set: `0-9a-z_`
- Efficient storage for identifiers and tokens

#### Single Precision Float (0x05)
- **Binary**: 4-byte IEEE 754 float (little-endian)
- **Text**: `field_name: value` or `field_name: &hexvalue` for exact representation
- Special formatting for large numbers or precise values

#### Boolean / Byte Bool (0x35)
- **Binary**: 1 byte (0 = false, non-zero = true)
- **Text**: `field_name: true` or `field_name: false`

### Integer Types

#### Int16 (0x29)
- **Binary**: 2-byte signed integer (little-endian)
- **Text**: `field_name: value` or `field_name: nil` for max values (32767)

#### UInt16 (0x2B)
- **Binary**: 2-byte unsigned integer (little-endian)
- **Text**: `field_name: value` or `field_name: nil` for max values (65535)

#### Int32 (0x25)
- **Binary**: 4-byte signed integer (little-endian)
- **Text**: `field_name: value` or `field_name: nil` for special values

#### UInt32 (0x27, 0x2F)
- **Binary**: 4-byte unsigned integer (little-endian)  
- **Text**: `field_name: value` or `field_name: nil` for max values (4294967295)
- Note: Type 0x2F (UInt32Type2) is an alternative encoding with same format

#### Int64 (0x31)
- **Binary**: 8-byte signed integer (little-endian)
- **Text**: `field_name: value` as string representation

#### UInt64 (0x33)
- **Binary**: 8-byte unsigned integer (little-endian)
- **Text**: `field_name: value` as string representation

### Vector Types

#### Vector2 (0x07)
- **Binary**: Two 4-byte floats (a, b)
- **Text**: `field_name: (a, b)`
- Used for 2D coordinates, UV mapping

#### Vector3 (0x09)
- **Binary**: Three 4-byte floats (a, b, c)
- **Text**: `field_name: (a, b, c)`  
- Used for 3D positions, rotations, colors

#### Vector4 (0x17)
- **Binary**: Four 4-byte floats (a, b, c, d)
- **Text**: `field_name: (a; b, c, d)`
- Used for quaternions, RGBA colors

#### Vector7 (0x19 - Format Version 1)
- **Binary**: Six 4-byte floats (a, b, c, d, e, f)
- **Text**: `field_name: (a, b, c) (d; e, f, g)`
- Used for position + rotation combinations

#### Vector8 (0x19 - Format Version 2+)
- **Binary**: Eight 4-byte floats with bias compensation
- **Text**: `field_name: (a, b, c) (e; f, g, h)`
- Enhanced precision for position data
- Applies bias correction: `a += ((d & 0xFFF) - 2048) << 9`

#### Int32 Vector3 (0x11)
- **Binary**: Three 4-byte signed integers (a, b, c)
- **Text**: `field_name: (a, b, c)`
- Used for discrete 3D coordinates

### Array Types

All array types follow the same pattern:
- **Binary**: Count (4 bytes) + Elements
- **Text**: Multi-line format with indexed entries

#### Supported Array Types:
- **UTF-8 String Array (0x02)**: Array of UTF-8 strings
- **Encoded String Array (0x04)**: Array of base-38 encoded strings  
- **Single Float Array (0x06)**: Array of 32-bit floats
- **Vector2 Array (0x08)**: Array of 2D float vectors
- **Vector3 Array (0x0A)**: Array of 3D float vectors
- **Vector4 Array (0x18)**: Array of 4D float vectors
- **Vector8 Array (0x1A)**: Array of 8D float vectors (7D in version 1)
- **Int32 Vector3 Array (0x12)**: Array of 3D integer vectors
- **Vector2 Single Array (0x08)**: Array of 2D float vectors
- **Int16 Array (0x2A)**: Array of 16-bit signed integers
- **UInt16 Array (0x2C)**: Array of 16-bit unsigned integers
- **Int32 Array (0x26)**: Array of 32-bit signed integers
- **UInt32 Array (0x28)**: Array of 32-bit unsigned integers
- **Int64 Array (0x32)**: Array of 64-bit signed integers
- **UInt64 Array (0x34)**: Array of 64-bit unsigned integers
- **Boolean Array (0x36)**: Array of boolean values
- **ID Array Types (0x3A, 0x3C, 0x3E)**: Arrays of ID references

#### Examples:

**String Array (0x02)**:
```
field_name: 3
field_name[0]: "first"
field_name[1]: "second"  
field_name[2]: "third"
```

**Float Array (0x06)**:
```
field_name: 2
field_name[0]: 1.5
field_name[1]: &3f800000
```

**Vector3 Array (0x0A)**:
```
field_name: 1
field_name[0]: (1.0, 2.0, 3.0)
```

### Complex Types

#### ID Complex Type (0x39, 0x3B, 0x3D)
Represents object references and identifiers with three type variants:
- **0x39 (Id)**: Basic ID reference
- **0x3B (IdType2)**: Alternative ID encoding  
- **0x3D (IdType3)**: Extended ID format

**Format 1 - Named IDs**:
- **Binary**: Part count + encoded string parts
- **Text**: `field_name: part1.part2.part3`

**Format 2 - Nameless IDs**:
- **Binary**: 0xFF + 64-bit address
- **Text**: `field_name: _nameless.hex1.hex2.hex3.hex4`
- Used for dynamically generated object references

#### Ordinal String (0x37)
Reference to string lookup table:
- **Binary**: String table (count + ordinal/string pairs) stored in structure definition
- **Runtime**: Index (4 bytes) referencing table entry
- **Text**: `field_name: resolved_string_value`

## Complete Data Type Reference

Here's the complete list of all 39 supported data types:

| Hex ID | Type Name | Description |
|--------|-----------|-------------|
| 0x01 | UTF8String | UTF-8 encoded string |
| 0x02 | ArrayOfUTF8String | Array of UTF-8 strings |
| 0x03 | EncodedString | Base-38 encoded string |
| 0x04 | ArrayOfEncodedString | Array of encoded strings |
| 0x05 | Single | 32-bit float |
| 0x06 | ArrayOfSingle | Array of 32-bit floats |
| 0x07 | VectorOf2Single | 2D float vector |
| 0x08 | ArrayOfVectorOf2Single | Array of 2D float vectors |
| 0x09 | VectorOf3Single | 3D float vector |
| 0x0A | ArrayOfVectorOf3Single | Array of 3D float vectors |
| 0x11 | VectorOf3Int32 | 3D integer vector |
| 0x12 | ArrayOfVectorOf3Int32 | Array of 3D integer vectors |
| 0x17 | VectorOf4Single | 4D float vector |
| 0x18 | ArrayOfVectorOf4Single | Array of 4D float vectors |
| 0x19 | VectorOf8Single | 8D float vector (7D in v1) |
| 0x1A | ArrayOfVectorOf8Single | Array of 8D float vectors |
| 0x25 | Int32 | 32-bit signed integer |
| 0x26 | ArrayOfInt32 | Array of 32-bit signed integers |
| 0x27 | UInt32 | 32-bit unsigned integer |
| 0x28 | ArrayOfUInt32 | Array of 32-bit unsigned integers |
| 0x29 | Int16 | 16-bit signed integer |
| 0x2A | ArrayOfInt16 | Array of 16-bit signed integers |
| 0x2B | UInt16 | 16-bit unsigned integer |
| 0x2C | ArrayOfUInt16 | Array of 16-bit unsigned integers |
| 0x2F | UInt32Type2 | Alternative 32-bit unsigned integer |
| 0x31 | Int64 | 64-bit signed integer |
| 0x32 | ArrayOfInt64 | Array of 64-bit signed integers |
| 0x33 | UInt64 | 64-bit unsigned integer |
| 0x34 | ArrayOfUInt64 | Array of 64-bit unsigned integers |
| 0x35 | ByteBool | Boolean (byte) |
| 0x36 | ArrayOfByteBool | Array of booleans |
| 0x37 | OrdinalString | String table reference |
| 0x39 | Id | ID reference |
| 0x3A | ArrayOfIdA | Array of ID references (type A) |
| 0x3B | IdType2 | ID reference (type 2) |
| 0x3C | ArrayOfIdC | Array of ID references (type C) |
| 0x3D | IdType3 | ID reference (type 3) |
| 0x3E | ArrayOfIdE | Array of ID references (type E) |

## Serialization Process

### Binary to Text Conversion

1. **Structure Analysis**: Parse structure definitions to understand data layout
2. **Instance Processing**: Read data instances using structure templates  
3. **Type-Specific Decoding**: Apply appropriate decoder for each data type
4. **Text Formatting**: Convert binary values to human-readable format
5. **Output Generation**: Generate SiiNunit format text file

### Special Formatting Rules

#### Float Precision
- Small integers: Display as integers (`1` instead of `1.0`)
- Large numbers: Use hexadecimal representation (`&3f800000`)
- Preserves exact binary representation when needed

#### String Quoting
- Simple identifiers: Unquoted (`simple_name`)
- Complex strings: Quoted (`"complex string with spaces"`)
- Empty strings: `""`
- Limited alphabet optimization for game identifiers

#### Nil Values
Special values indicating unset/default data:
- UInt32: 4294967295 → `nil`
- UInt16: 65535 → `nil`  
- Int16: 32767 → `nil`
- Floats: undefined/null → `nil`

## Version Differences

### Version 1
- Vector8 treated as Vector7 (6 components)
- Simpler bias calculations
- Limited data type support

### Version 2 & 3  
- Full Vector8 support (8 components)
- Enhanced bias compensation for position data
- Extended data type catalog
- Improved precision handling

## Error Handling

The library includes comprehensive error handling:

- **File Access**: Validates file existence and readability
- **Format Validation**: Checks signatures and version compatibility  
- **Decryption Errors**: Handles AES decryption failures
- **Parsing Errors**: Manages malformed binary data
- **Type Mismatches**: Reports unknown or unsupported data types

## Usage Examples

### Library Exports

The library exports the following classes and types:

```typescript
import { 
  SIIDecryptor,           // Main decryption class
  BSIIDecoder,            // Binary format decoder
  BSIISerializer,         // Binary to text serializer
  BSIITypeDecoder,        // Low-level type decoder
  StreamUtils,            // Binary stream utilities
  
  // Type definitions
  SignatureType,
  DataTypeIdFormat,
  BSIISupportedVersions,
  
  // Interfaces
  SIIDecryptResult,
  SIIDecodeResult,
  BSIIHeader,
  BSIIData,
  BSIIDataSegment,
  BSIIStructureBlock,
  IDComplexType,
  SingleVector2,
  SingleVector3,
  SingleVector4,
  // ... and more vector types
} from 'sii-decrypt-ts';
```

### Basic Decryption
```typescript
import { SIIDecryptor } from 'sii-decrypt-ts';

// Decrypt and decode a game save file
const result = SIIDecryptor.decrypt('game.sii', true);

if (result.success) {
    // result.data contains the decoded text format as Buffer
    console.log(result.data.toString());
    
    // result.string_content contains the same data as string
    console.log(result.string_content);
    
    // result.type indicates format: "plain", "encrypted", "binary", or "3nK"
    console.log(`File type: ${result.type}`);
    
    // result.encrypted indicates if file was encrypted
    if (result.encrypted) {
        console.log('File was encrypted and has been decrypted');
    }
    
    // For binary format files, additional info is available
    if (result.binaryFormatInfo) {
        console.log(`Binary format version: ${result.binaryFormatInfo.header?.version}`);
    }
}
```

### Raw Decryption Only
```typescript
// Decrypt but don't decode to text
const result = SIIDecryptor.decrypt('game.sii', false);

if (result.success) {
    // result.data contains the raw binary data after decryption
    // Can be processed further or saved
    // No text conversion is performed when decode=false
    
    console.log(`File type: ${result.type}`);
    console.log(`Data size: ${result.data.length} bytes`);
}
```

### Error Handling
```typescript
try {
    const result = SIIDecryptor.decrypt('nonexistent.sii', true);
} catch (error) {
    // Handle file not found, invalid format, etc.
    console.error('Decryption failed:', error.message);
}
```

### Advanced Usage - Direct Binary Decoding
```typescript
import { BSIIDecoder, SignatureType } from 'sii-decrypt-ts';
import { readFileSync } from 'fs';

// For when you already have binary SII data
const binaryData = readFileSync('game.sii');

// Check if it's binary format
const signature = binaryData.readUInt32LE(0);
if (signature === SignatureType.Binary) {
    const result = BSIIDecoder.decode(binaryData);
    
    if (result.success) {
        console.log(`Format version: ${result.header?.version}`);
        console.log('Decoded text:', result.data.toString());
    }
}
```

### Working with Individual Components
```typescript
import { BSIITypeDecoder, StreamUtils } from 'sii-decrypt-ts';

// Low-level binary data parsing
const bytes = Buffer.from([...]);
const offset = { value: 0 };

// Read various data types
const stringValue = BSIITypeDecoder.decodeUTF8String(bytes, offset);
const floatValue = BSIITypeDecoder.decodeSingle(bytes, offset);
const vector3 = BSIITypeDecoder.decodeSingleVector3(bytes, offset);

// Utility functions
const uint32Result = StreamUtils.tryReadUInt32(bytes, offset);
if (uint32Result.success) {
    console.log('Value:', uint32Result.result);
}
```

## Performance Considerations

- **Memory Usage**: Large files are processed in memory - consider file size limits
- **Decryption Speed**: AES operations are CPU-intensive for large files
- **Type Processing**: Complex vector types require more processing time
- **String Handling**: UTF-8 encoding/decoding adds overhead

## File Format Evolution

The SII format has evolved through multiple versions:
- **Version 1**: Basic binary format with essential data types
- **Version 2**: Enhanced vector support and improved precision
- **Version 3**: Additional data types and optimizations

The library maintains backward compatibility while supporting the latest format features.

## Return Types

### SIIDecryptResult
```typescript
type SIIDecryptResult = {
  data: Buffer;                    // Processed data (text or binary)
  string_content?: string;         // Text representation (when available)
  success: boolean;               // Operation success flag
  type: "plain" | "encrypted" | "binary" | "3nK";  // Detected format
  error?: string;                 // Error message (if any)
  encrypted?: boolean;            // True if file was encrypted
  binaryFormatInfo?: {            // Additional binary format details
    header?: BSIIHeader;          // Binary format header
    success?: boolean;            // Binary decoding success
  }
};
```

### BSIIHeader
```typescript
interface BSIIHeader {
  signature: number;              // Format signature (0x42494953)
  version: number;                // Format version (1, 2, or 3)
}
```
