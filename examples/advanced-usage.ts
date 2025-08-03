import { 
  Decryptor, 
  BSIIDecoder, 
  SignatureType,
  DataTypeIdFormat 
} from '../src/index';
import * as fs from 'fs';

/**
 * Advanced usage example showing step-by-step processing
 */
async function advancedExample() {
  try {
    const filePath = './save_game.sii';
    
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }

    // Read the raw file
    const rawBytes = fs.readFileSync(filePath);
    console.log('Raw file size:', rawBytes.length, 'bytes');
    
    // Check file signature
    const signature = rawBytes.readUInt32LE(0);
    console.log('File signature:', signature);
    
    switch (signature) {
      case SignatureType.Encrypted:
        console.log('File type: Encrypted SII');
        break;
      case SignatureType.PlainText:
        console.log('File type: Plain text SII');
        break;
      case SignatureType.Binary:
        console.log('File type: Binary SII');
        break;
      default:
        console.log('File type: Unknown');
    }
    
    // Decrypt and decode with full processing
    const result = Decryptor.decrypt(filePath, true);
    
    // Analyze the content
    const content = result.toString('utf8');
    const lines = content.split('\n');
    
    console.log('\nDecoded content analysis:');
    console.log('Total lines:', lines.length);
    console.log('Content preview:');
    console.log(lines.slice(0, 10).join('\n'));
    
    // Extract some statistics
    const blockMatches = content.match(/^[a-zA-Z_][a-zA-Z0-9_]*\s*:/gm);
    if (blockMatches) {
      console.log('\nFound', blockMatches.length, 'data blocks');
      
      // Count unique block types
      const blockTypes = new Set();
      blockMatches.forEach(match => {
        const type = match.split(':')[0].trim();
        blockTypes.add(type);
      });
      
      console.log('Unique block types:', Array.from(blockTypes).slice(0, 10));
    }
    
  } catch (error) {
    console.error('Error in advanced processing:', error);
  }
}

// Utility function to convert buffer to hex string for debugging
function bufferToHex(buffer: Buffer, maxLength: number = 64): string {
  const length = Math.min(buffer.length, maxLength);
  let hex = '';
  for (let i = 0; i < length; i++) {
    hex += buffer[i].toString(16).padStart(2, '0') + ' ';
    if ((i + 1) % 16 === 0) hex += '\n';
  }
  return hex;
}

export { advancedExample, bufferToHex };