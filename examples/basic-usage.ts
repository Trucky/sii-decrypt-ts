import { Decryptor } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Basic usage example for the SII Decrypt TypeScript library
 */
async function example() {
  try {
    // Path to your encrypted SII file
    const filePath = './save_game.sii';
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('File not found:', filePath);
      return;
    }

    console.log('Decrypting and decoding SII file...');
    
    // Decrypt and decode the file
    const decodedData = Decryptor.decrypt(filePath, true);
    
    // Save the decoded data to a new file
    const outputPath = './decoded_save_game.sii';
    fs.writeFileSync(outputPath, decodedData);
    
    console.log('Successfully decoded file saved to:', outputPath);
    console.log('Decoded data size:', decodedData.length, 'bytes');
    
    // Display first 500 characters of decoded content
    const preview = decodedData.toString('utf8').substring(0, 500);
    console.log('\nPreview of decoded content:');
    console.log(preview);
    
  } catch (error) {
    console.error('Error processing SII file:', error);
  }
}

// Run the example
if (require.main === module) {
  example();
}

export { example };