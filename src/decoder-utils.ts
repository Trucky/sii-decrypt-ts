import { IDComplexType, Int32Vector3, SingleVector2, SingleVector3, SingleVector4, SingleVector7, SingleVector8 } from "./types";

export class BSIITypeDecoder {
    private static readonly CHAR_TABLE = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j',
        'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't',
        'u', 'v', 'w', 'x', 'y', 'z', '_'
    ];

    // 0x01
    static decodeUTF8String(bytes: Buffer, offset: { value: number }): string {
        const length = this.decodeUInt32(bytes, offset);
        const result = bytes.subarray(offset.value, offset.value + length).toString('utf8');
        offset.value += length;
        return result;
    }

    // 0x02
    static decodeUTF8StringArray(bytes: Buffer, offset: { value: number }): string[] {
        const numberOfStrings = this.decodeUInt32(bytes, offset);
        const result: string[] = [];
        for (let i = 0; i < numberOfStrings; i++) {
            result.push(this.decodeUTF8String(bytes, offset));
        }
        return result;
    }

    // 0x03
    static decodeUInt64String(bytes: Buffer, offset: { value: number }): string {
        let result = "";
        let value = this.decodeUInt64(bytes, offset);
        
        while (value !== 0n) {
            let charIdx = Number(value % 38n);
            if (charIdx < 0) charIdx = charIdx * -1;
            charIdx -= 1;
            value = value / 38n;
            if (charIdx > -1 && charIdx < 38) {
                result += this.CHAR_TABLE[charIdx];
            }
        }
        return result;
    }

    // 0x04
    static decodeUInt64StringArray(bytes: Buffer, offset: { value: number }): string[] {
        const numberOfStrings = this.decodeUInt32(bytes, offset);
        const result: string[] = [];
        for (let i = 0; i < numberOfStrings; i++) {
            result.push(this.decodeUInt64String(bytes, offset));
        }
        return result;
    }

    // 0x05
    static decodeSingle(bytes: Buffer, offset: { value: number }): number {
        const result = bytes.readFloatLE(offset.value);
        offset.value += 4;
        return result;
    }

    // 0x06
    static decodeSingleArray(bytes: Buffer, offset: { value: number }): number[] {
        const numberOfSingles = this.decodeUInt32(bytes, offset);
        const result: number[] = [];
        for (let i = 0; i < numberOfSingles; i++) {
            result.push(this.decodeSingle(bytes, offset));
        }
        return result;
    }

    // 0x07
    static decodeSingleVector2(bytes: Buffer, offset: { value: number }): SingleVector2 {
        return {
            a: this.decodeSingle(bytes, offset),
            b: this.decodeSingle(bytes, offset)
        };
    }

    // 0x08
    static decodeSingleVector2Array(bytes: Buffer, offset: { value: number }): SingleVector2[] {
        const numberOfVector2s = this.decodeUInt32(bytes, offset);
        const result: SingleVector2[] = [];
        for (let i = 0; i < numberOfVector2s; i++) {
            result.push(this.decodeSingleVector2(bytes, offset));
        }
        return result;
    }

    // 0x09
    static decodeSingleVector3(bytes: Buffer, offset: { value: number }): SingleVector3 {
        return {
            a: this.decodeSingle(bytes, offset),
            b: this.decodeSingle(bytes, offset),
            c: this.decodeSingle(bytes, offset)
        };
    }

    // 0x0A
    static decodeSingleVector3Array(bytes: Buffer, offset: { value: number }): SingleVector3[] {
        const numberOfVector3s = this.decodeUInt32(bytes, offset);
        const result: SingleVector3[] = [];
        for (let i = 0; i < numberOfVector3s; i++) {
            result.push(this.decodeSingleVector3(bytes, offset));
        }
        return result;
    }

    // 0x11
    static decodeInt32Vector3(bytes: Buffer, offset: { value: number }): Int32Vector3 {
        return {
            a: this.decodeInt32(bytes, offset),
            b: this.decodeInt32(bytes, offset),
            c: this.decodeInt32(bytes, offset)
        };
    }

    // 0x12
    static decodeInt32Vector3Array(bytes: Buffer, offset: { value: number }): Int32Vector3[] {
        const numberOfVector3s = this.decodeUInt32(bytes, offset);
        const result: Int32Vector3[] = [];
        for (let i = 0; i < numberOfVector3s; i++) {
            result.push(this.decodeInt32Vector3(bytes, offset));
        }
        return result;
    }

    // 0x17
    static decodeSingleVector4(bytes: Buffer, offset: { value: number }): SingleVector4 {
        return {
            a: this.decodeSingle(bytes, offset),
            b: this.decodeSingle(bytes, offset),
            c: this.decodeSingle(bytes, offset),
            d: this.decodeSingle(bytes, offset)
        };
    }

    // 0x18
    static decodeSingleVector4Array(bytes: Buffer, offset: { value: number }): SingleVector4[] {
        const number = this.decodeUInt32(bytes, offset);
        const result: SingleVector4[] = [];
        for (let i = 0; i < number; i++) {
            result.push(this.decodeSingleVector4(bytes, offset));
        }
        return result;
    }

    // 0x19
    static decodeSingleVector7(bytes: Buffer, offset: { value: number }): SingleVector7 {
        return {
            a: this.decodeSingle(bytes, offset),
            b: this.decodeSingle(bytes, offset),
            c: this.decodeSingle(bytes, offset),
            d: this.decodeSingle(bytes, offset),
            e: this.decodeSingle(bytes, offset),
            f: this.decodeSingle(bytes, offset),
            g: 0 // Initialize with 0, will be set by caller if needed
        };
    }

    static decodeSingleVector8(bytes: Buffer, offset: { value: number }): SingleVector8 {
        const result: SingleVector8 = {
            a: this.decodeSingle(bytes, offset),
            b: this.decodeSingle(bytes, offset),
            c: this.decodeSingle(bytes, offset),
            d: this.decodeSingle(bytes, offset),
            e: this.decodeSingle(bytes, offset),
            f: this.decodeSingle(bytes, offset),
            g: this.decodeSingle(bytes, offset),
            h: this.decodeSingle(bytes, offset)
        };

        const bias = BigInt(Math.floor(result.d));

        let bits = bias & 0xFFFn;
        bits -= 2048n;
        bits = bits << 9n;
        result.a += Number(bits);

        let bits2 = bias >> 12n;
        bits2 &= 0xFFFn;
        bits2 -= 2048n;
        bits2 = bits2 << 9n;
        result.c += Number(bits2);

        return result;
    }

    // 0x1A
    static decodeSingleVector7Array(bytes: Buffer, offset: { value: number }): SingleVector7[] {
        const numberOfVector7s = this.decodeUInt32(bytes, offset);
        const result: SingleVector7[] = [];
        for (let i = 0; i < numberOfVector7s; i++) {
            result.push(this.decodeSingleVector7(bytes, offset));
        }
        return result;
    }

    static decodeSingleVector8Array(bytes: Buffer, offset: { value: number }): SingleVector8[] {
        const numberOfVector8s = this.decodeUInt32(bytes, offset);
        const result: SingleVector8[] = [];
        for (let i = 0; i < numberOfVector8s; i++) {
            result.push(this.decodeSingleVector8(bytes, offset));
        }
        return result;
    }

    // 0x25
    static decodeInt32(bytes: Buffer, offset: { value: number }): number {
        const result = bytes.readInt32LE(offset.value);
        offset.value += 4;
        return result;
    }

    // 0x26
    static decodeInt32Array(bytes: Buffer, offset: { value: number }): number[] {
        const numberOfInts = this.decodeUInt32(bytes, offset);
        const result: number[] = [];
        for (let i = 0; i < numberOfInts; i++) {
            result.push(this.decodeInt32(bytes, offset));
        }
        return result;
    }

    // 0x27 and 0x2F
    static decodeUInt32(bytes: Buffer, offset: { value: number }): number {
        const result = bytes.readUInt32LE(offset.value);
        offset.value += 4;
        return result;
    }

    // 0x28
    static decodeUInt32Array(bytes: Buffer, offset: { value: number }): number[] {
        const numberOfInts = this.decodeUInt32(bytes, offset);
        const result: number[] = [];
        for (let i = 0; i < numberOfInts; i++) {
            result.push(this.decodeUInt32(bytes, offset));
        }
        return result;
    }

    // 0x29
    static decodeInt16(bytes: Buffer, offset: { value: number }): number {
        const result = bytes.readInt16LE(offset.value);
        offset.value += 2;
        return result;
    }

    // 0x2A
    static decodeInt16Array(bytes: Buffer, offset: { value: number }): number[] {
        const numberOfInts = this.decodeUInt32(bytes, offset);
        const result: number[] = [];
        for (let i = 0; i < numberOfInts; i++) {
            result.push(this.decodeInt16(bytes, offset));
        }
        return result;
    }

    // 0x2B
    static decodeUInt16(bytes: Buffer, offset: { value: number }): number {
        const result = bytes.readUInt16LE(offset.value);
        offset.value += 2;
        return result;
    }

    // 0x2C
    static decodeUInt16Array(bytes: Buffer, offset: { value: number }): number[] {
        const numberOfInts = this.decodeUInt32(bytes, offset);
        const result: number[] = [];
        for (let i = 0; i < numberOfInts; i++) {
            result.push(this.decodeUInt16(bytes, offset));
        }
        return result;
    }

    // 0x31
    static decodeInt64(bytes: Buffer, offset: { value: number }): bigint {
        const result = bytes.readBigInt64LE(offset.value);
        offset.value += 8;
        return result;
    }

    // 0x32
    static decodeInt64Array(bytes: Buffer, offset: { value: number }): bigint[] {
        const numberOfInts = this.decodeUInt32(bytes, offset);
        const result: bigint[] = [];
        for (let i = 0; i < numberOfInts; i++) {
            result.push(this.decodeInt64(bytes, offset));
        }
        return result;
    }

    // 0x33
    static decodeUInt64(bytes: Buffer, offset: { value: number }): bigint {
        const result = bytes.readBigUInt64LE(offset.value);
        offset.value += 8;
        return result;
    }

    // 0x34
    static decodeUInt64Array(bytes: Buffer, offset: { value: number }): bigint[] {
        const numberOfInts = this.decodeUInt32(bytes, offset);
        const result: bigint[] = [];
        for (let i = 0; i < numberOfInts; i++) {
            result.push(this.decodeUInt64(bytes, offset));
        }
        return result;
    }

    // 0x35
    static decodeBool(bytes: Buffer, offset: { value: number }): boolean {
        const result = bytes.readUInt8(offset.value) !== 0;
        offset.value += 1;
        return result;
    }

    // 0x36
    static decodeBoolArray(bytes: Buffer, offset: { value: number }): boolean[] {
        const numberOfBools = this.decodeUInt32(bytes, offset);
        const result: boolean[] = [];
        for (let i = 0; i < numberOfBools; i++) {
            result.push(this.decodeBool(bytes, offset));
        }
        return result;
    }

    // 0x37
    static decodeOrdinalStringList(bytes: Buffer, offset: { value: number }): Map<number, string> {
        const length = this.decodeUInt32(bytes, offset);
        const values = new Map<number, string>();
        for (let i = 0; i < length; i++) {
            const ordinal = this.decodeUInt32(bytes, offset);
            values.set(ordinal, this.decodeUTF8String(bytes, offset));
        }
        return values;
    }

    static getOrdinalStringFromValues(values: Map<number, string>, bytes: Buffer, offset: { value: number }): string {
        const index = this.decodeUInt32(bytes, offset);
        return values.get(index) || "";
    }

    // 0x39, 0x3B, 0x3D
    static decodeID(bytes: Buffer, offset: { value: number }): IDComplexType {
        const result: IDComplexType = {
            partCount: 0,
            address: 0n,
            value: ""
        };

        result.partCount = bytes.readUInt8(offset.value);
        offset.value += 1;

        if (result.partCount === 0xFF) {
            result.address = this.decodeUInt64(bytes, offset);
            const data = Buffer.alloc(8);
            data.writeBigUInt64LE(result.address, 0);
            
            const parts: string[] = new Array(data.length / 2);
            let currentPart = "";
            
            for (let i = 0; i < data.length; i++) {
                if (i % 2 === 0 && i > 0) {
                    if (i >= data.length - 2) {
                        while (currentPart.startsWith("0")) {
                            currentPart = currentPart.substring(1);
                        }
                    }

                    if (currentPart) {
                        result.value = currentPart + "." + result.value;
                    }
                    
                    parts[Math.floor(data.length / 2) - Math.floor(i / 2)] = currentPart;
                    currentPart = "";
                }
                currentPart = data[i].toString(16).padStart(2, '0') + currentPart;
                
                if (i === data.length - 1) {
                    while (currentPart.startsWith("0")) {
                        currentPart = currentPart.substring(1);
                    }
                    if (currentPart) {
                        result.value = currentPart + "." + result.value;
                    }
                    parts[0] = currentPart;
                }
            }
            result.value = "_nameless." + result.value.substring(0, result.value.length - 1);
        } else {
            for (let i = 0; i < result.partCount; i++) {
                const s = this.decodeUInt64String(bytes, offset);
                
                if (i > 0) {
                    result.value += ".";
                }
                result.value += s;
            }
            if (result.partCount === 0) {
                result.value = "null";
            }
        }
        return result;
    }

    // 0x3A, 0x3C, 0x3E
    static decodeIDArray(bytes: Buffer, offset: { value: number }): IDComplexType[] {
        const numberOfIds = this.decodeUInt32(bytes, offset);
        const result: IDComplexType[] = [];
        for (let i = 0; i < numberOfIds; i++) {
            result.push(this.decodeID(bytes, offset));
        }
        return result;
    }
}