import { createDecipheriv } from "crypto";
import { inflateSync } from "zlib";
import { readFileSync } from "fs";
import { StreamUtils } from "./stream-utils";
import { BSIIDecoder } from "./bsii-decoder";
import {
  BSIISupportedVersions,
  DecryptResult,
  SignatureType,
  SIIData,
  SIIHeader,
} from "./types";

export class Decryptor {
  private static readonly SII_KEY = Buffer.from([
    0x2a, 0x5f, 0xcb, 0x17, 0x91, 0xd2, 0x2f, 0xb6, 0x02, 0x45, 0xb3, 0xd8,
    0x36, 0x9e, 0xd0, 0xb2, 0xc2, 0x73, 0x71, 0x56, 0x3f, 0xbf, 0x1f, 0x3c,
    0x9e, 0xdf, 0x6b, 0x11, 0x82, 0x5a, 0x5d, 0x0a,
  ]);

  static decrypt(filePath: string, decode: boolean = true): DecryptResult {
    const result: DecryptResult = {
      data: Buffer.alloc(0),
      success: false,
      type: "plain",
    };

    const bytes = readFileSync(filePath);
    const streamPos = { value: 0 };

    const fileTypeResult = StreamUtils.tryReadUInt32(bytes, streamPos);
    if (!fileTypeResult.success) {
      throw new Error("Invalid file");
    }

    let processedBytes = bytes;

    if (fileTypeResult.result === SignatureType.Encrypted) {
      const data = this.decryptData(bytes, streamPos.value);
      const destination = Buffer.alloc(data.header.dataSize);
      const uncompressed = inflateSync(data.data);
      processedBytes = Buffer.from(uncompressed);

      result.encrypted = true;
    }

    if (decode) {
      streamPos.value = 0;
      const dataTypeResult = StreamUtils.tryReadUInt32(
        processedBytes,
        streamPos
      );

      if (!dataTypeResult.success) {
        throw new Error("Invalid data");
      }

      switch (dataTypeResult.result) {
        case SignatureType.PlainText:
          result.data = this.decodePlaintext(
            processedBytes,
            streamPos.value
          ).data;

          result.type = "plain";
          result.success = true;
          break;
        case SignatureType.Binary:
          const decodingResult = this.decodeBinary(
            processedBytes,
            streamPos.value
          );
          result.data = decodingResult.data;
          result.binaryFormatInfo = decodingResult.binaryFormatInfo;
          result.type = "binary";
          result.success = true;
          break;
        case SignatureType._3nK:
          throw new Error("_3nK decoding is not implemented yet.");
      }
    }

    return result;
  }

  private static decryptData(encrypted: Buffer, offset: number): SIIData {
    const header: SIIHeader = { signature: 0, dataSize: 0 };
    const iv = encrypted.subarray(36, 52);
    const ciphertext = encrypted.subarray(56);

    // Decrypt using AES
    const decipher = createDecipheriv("aes-256-cbc", this.SII_KEY, iv);
    decipher.setAutoPadding(true);

    const decrypted = Buffer.concat([
      decipher.update(ciphertext),
      decipher.final(),
    ]);

    return {
      data: decrypted,
      header,
    };
  }

  private static decodePlaintext(data: Buffer, offset: number): SIIData {
    return {
      header: {
        dataSize: data.length,
        signature: SignatureType.PlainText,
      },
      data: data,
    };
  }

  private static decodeBinary(data: Buffer, offset: number): SIIData {
    const decodeResult = BSIIDecoder.decode(data);

    return {
      header: {
        dataSize: data.length,
        signature: SignatureType.Binary,
      },
      data: decodeResult.data,
      binaryFormatInfo: {
        header: decodeResult.header,
        success: decodeResult.success,
      },
    };
  }
}
