import { Decryptor, SignatureType } from '../src/index';
import * as fs from 'fs';
import * as path from 'path';

describe('Decryptor', () => {
  const testDataDir = path.join(__dirname, 'data');
  
  beforeAll(() => {
    // Create test data directory if it doesn't exist
    if (!fs.existsSync(testDataDir)) {
      fs.mkdirSync(testDataDir, { recursive: true });
    }
  });

  test('should handle invalid file path', () => {
    expect(() => {
      Decryptor.decrypt('nonexistent-file.sii');
    }).toThrow();
  });

  test('should decrypt encrypted SII file', () => {
    // This test would need an actual encrypted SII file
    // For now, we'll just test the structure
    expect(Decryptor).toBeDefined();
    expect(typeof Decryptor.decrypt).toBe('function');
  });

  test('should recognize file signatures', () => {
    expect(SignatureType.Encrypted).toBe(1131635539);
    expect(SignatureType.PlainText).toBe(1315531091);
    expect(SignatureType.Binary).toBe(1229542210);
  });
});
