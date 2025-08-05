import {
  BSIIData,
  BSIIDataSegment,
  DataTypeIdFormat,
  IDComplexType,
  Int32Vector3,
  SingleVector2,
  SingleVector3,
  SingleVector4,
  SingleVector7,
  SingleVector8,
} from "./types";

export class BSIISerializer {
  private static readonly LIMITED_ALPHABET = [
    "0",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "a",
    "b",
    "c",
    "d",
    "e",
    "f",
    "g",
    "h",
    "i",
    "j",
    "k",
    "l",
    "m",
    "n",
    "o",
    "p",
    "q",
    "r",
    "s",
    "t",
    "u",
    "v",
    "w",
    "x",
    "y",
    "z",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
    "_",
  ];

  static serialize(data: BSIIData): Buffer {
    let result = "SiiNunit\n{\n";

    for (const block of data.decodedBlocks) {
      if (!block.name || !block.id?.value) continue;

      result += `${block.name} : ${block.id.value} {\n`;

      for (const segment of block.segments) {
        if (segment.type !== 0) {
          /*if (segment.name == 'license_plate')
          {
            console.log("Serializing segment:", segment.name, "Type:", segment.type);
          }*/

          const newText = this.serializeSegment(segment, data.header.version);

          if (newText.includes("20169.600")) console.warn(segment);

          result += newText;
        }
      }

      result += "}\n\n";
    }

    result += "}";
    return Buffer.from(result, "utf8");
  }

  private static serializeSegment(
    segment: BSIIDataSegment,
    version: number
  ): string {
    const indent = " ";

    switch (segment.type) {
      case DataTypeIdFormat.ArrayOfByteBool:
        return this.serializeByteBoolArray(segment, indent);
      case DataTypeIdFormat.ArrayOfEncodedString:
        return this.serializeEncodedStringArray(segment, indent);
      case DataTypeIdFormat.ArrayOfIdA:
      case DataTypeIdFormat.ArrayOfIdC:
      case DataTypeIdFormat.ArrayOfIdE:
        return this.serializeIDArray(segment, indent);
      case DataTypeIdFormat.ArrayOfInt32:
        return this.serializeInt32Array(segment, indent);
      case DataTypeIdFormat.ArrayOfSingle:
        return this.serializeSingleArray(segment, indent);
      case DataTypeIdFormat.ArrayOfUInt16:
        return this.serializeUInt16Array(segment, indent);
      case DataTypeIdFormat.ArrayOfUInt32:
        return this.serializeUInt32Array(segment, indent);
      case DataTypeIdFormat.ArrayOfUInt64:
        return this.serializeUInt64Array(segment, indent);
      case DataTypeIdFormat.ArrayOfUTF8String:
        return this.serializeUTF8StringArray(segment, indent);
      case DataTypeIdFormat.ArrayOfVectorOf3Int32:
        return this.serializeInt32Vector3Array(segment, indent);
      case DataTypeIdFormat.ArrayOfVectorOf3Single:
        return this.serializeSingleVector3Array(segment, indent);
      case DataTypeIdFormat.ArrayOfVectorOf4Single:
        return this.serializeSingleVector4Array(segment, indent);
      case DataTypeIdFormat.ArrayOfVectorOf8Single:
        if (version === 1) {
          return this.serializeSingleVector7Array(segment, indent);
        } else {
          return this.serializeSingleVector8Array(segment, indent);
        }
      case DataTypeIdFormat.ByteBool:
        return this.serializeBool(segment, indent);
      case DataTypeIdFormat.EncodedString:
        return this.serializeEncodedString(segment, indent);
      case DataTypeIdFormat.IdType3:
      case DataTypeIdFormat.IdType2:
      case DataTypeIdFormat.Id:
        return this.serializeId(segment, indent);
      case DataTypeIdFormat.Int32:
        return this.serializeInt32(segment, indent);
      case DataTypeIdFormat.Int64:
        return this.serializeInt64(segment, indent);
      case DataTypeIdFormat.UInt32Type2:
      case DataTypeIdFormat.UInt32:
        return this.serializeUInt32(segment, indent);
      case DataTypeIdFormat.UInt64:
        return this.serializeUInt64(segment, indent);
      case DataTypeIdFormat.UInt16:
        return this.serializeUInt16(segment, indent);
      case DataTypeIdFormat.OrdinalString:
        return this.serializeOrdinalString(segment, indent);
      case DataTypeIdFormat.Single:
        return this.serializeSingle(segment, indent);
      case DataTypeIdFormat.UTF8String:
        return this.serializeUTF8String(segment, indent);
      case DataTypeIdFormat.VectorOf2Single:
        return this.serializeSingleVector2(segment, indent);
      case DataTypeIdFormat.VectorOf3Int32:
        return this.serializeInt32Vector3(segment, indent);
      case DataTypeIdFormat.VectorOf3Single:
        return this.serializeSingleVector3(segment, indent);
      case DataTypeIdFormat.VectorOf4Single:
        return this.serializeSingleVector4(segment, indent);
      case DataTypeIdFormat.VectorOf8Single:
        if (version === 1) {
          return this.serializeSingleVector7(segment, indent);
        } else {
          return this.serializeSingleVector8(segment, indent);
        }
      case DataTypeIdFormat.ArrayOfInt64:
        return this.serializeInt64Array(segment, indent);
      case DataTypeIdFormat.ArrayOfInt16:
        return this.serializeInt16Array(segment, indent);
      case DataTypeIdFormat.Int16:
        return this.serializeInt16(segment, indent);
      case DataTypeIdFormat.ArrayOfVectorOf2Single:
        return this.serializeSingleVector2Array(segment, indent);
      case 0:
        return "";
      default:
        //console.warn("Unknown serialization type:", segment.type);
        throw new Error(
          `Unknown serialization type: ${segment.type} for segment ${segment.name}`
        );
    }
  }

  private static serializeUTF8String(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as string;
    let output = ` ${segment.name}: `;

    if (/^-?\d+$/.test(value)) {
      output += value;
    } else if (!value) {
      output += '""';
    } else if (value.includes(" ")) {
      output += `"${value}"`;
    } else if (this.isLimitedAlphabet(value)) {
      output += value;
    } else {
      output += `"${value}"`;
    }

    //output += `"${value}"`;

    return output + "\n";
  }

  private static serializeSingle(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number;
    return ` ${segment.name}: ${this.formatSingle(value)}\n`;
  }

  private static serializeInt32(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number;
    return ` ${segment.name}: ${value !== undefined ? value : "nil"}\n`;
  }

  private static serializeBool(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as boolean;
    return ` ${segment.name}: ${value.toString().toLowerCase()}\n`;
  }

  private static serializeSingleVector3(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const vector = segment.value as SingleVector3;
    return ` ${segment.name}: (${this.formatSingle(
      vector.a
    )}, ${this.formatSingle(vector.b)}, ${this.formatSingle(vector.c)})\n`;
  }

  private static formatSingle(value: number): string {
    if (value === undefined || value === null) return "nil";

    if (value - Math.trunc(value) !== 0 || value >= 1e7) {
      const buffer = Buffer.allocUnsafe(4);
      buffer.writeFloatLE(value, 0);
      let hex = "";
      for (let i = 3; i >= 0; i--) {
        hex += buffer[i].toString(16).padStart(2, "0");
      }
      return "&" + hex;
    } else {
      return Math.trunc(value).toString();
    }
  }

  private static isLimitedAlphabet(value: string): boolean {
    for (const char of value) {
      if (!this.LIMITED_ALPHABET.includes(char)) return false;
    }
    return true;
  }

  private static serializeByteBoolArray(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as boolean[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]
        .toString()
        .toLowerCase()}\n`;
    }
    return result;
  }

  private static serializeEncodedStringArray(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as string[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }

  private static serializeIDArray(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as IDComplexType[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i].value}\n`;
    }
    return result;
  }

  private static serializeInt32Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }

  private static serializeSingleArray(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${this.formatSingle(
        value[i]
      )}\n`;
    }
    return result;
  }

  private static serializeUInt16Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }

  private static serializeUInt32Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }

  private static serializeUInt64Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as bigint[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }

  private static serializeUTF8StringArray(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as string[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      if (/^\d+$/.test(value[i])) {
        result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
      } else if (!value[i]) {
        result += `${indent}${segment.name}[${i}]: ""\n`;
      } else if (this.isLimitedAlphabet(value[i])) {
        result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
      } else {
        result += `${indent}${segment.name}[${i}]: "${value[i]}"\n`;
      }
    }
    return result;
  }

  private static serializeInt32Vector3Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as Int32Vector3[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: (${value[i].a}, ${value[i].b}, ${value[i].c})\n`;
    }
    return result;
  }

  private static serializeSingleVector3Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as SingleVector3[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: (${this.formatSingle(
        value[i].a
      )}, ${this.formatSingle(value[i].b)}, ${this.formatSingle(
        value[i].c
      )})\n`;
    }
    return result;
  }

  private static serializeSingleVector2Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as SingleVector2[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: (${this.formatSingle(
        value[i].a
      )}, ${this.formatSingle(value[i].b)})\n`;
    }
    return result;
  }

  private static serializeSingleVector4Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as SingleVector4[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: (${this.formatSingle(
        value[i].a
      )}; ${this.formatSingle(value[i].b)}, ${this.formatSingle(
        value[i].c
      )}, ${this.formatSingle(value[i].d)})\n`;
    }
    return result;
  }

  private static serializeSingleVector8Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as SingleVector8[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: (${this.formatSingle(
        value[i].a
      )}, ${this.formatSingle(value[i].b)}, ${this.formatSingle(
        value[i].c
      )}) (${this.formatSingle(value[i].e)}; ${this.formatSingle(
        value[i].f
      )}, ${this.formatSingle(value[i].g)}, ${this.formatSingle(
        value[i].h
      )})\n`;
    }
    return result;
  }

  private static serializeSingleVector7Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as SingleVector7[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: (${this.formatSingle(
        value[i].a
      )}, ${this.formatSingle(value[i].b)}, ${this.formatSingle(
        value[i].c
      )}) (${this.formatSingle(value[i].d)}; ${this.formatSingle(
        value[i].e
      )}, ${this.formatSingle(value[i].f)}, ${this.formatSingle(
        value[i].g
      )})\n`;
    }
    return result;
  }

  private static serializeEncodedString(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    let value = segment.value as string;
    if (!value) {
      value = '""';
    }
    return `${indent}${segment.name}: ${value}\n`;
  }

  private static serializeId(segment: BSIIDataSegment, indent: string): string {
    const value = segment.value as IDComplexType;
    return `${indent}${segment.name}: ${value.value}\n`;
  }

  private static serializeInt64(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as bigint;
    const text = value !== undefined ? value.toString() : "nil";
    return `${indent}${segment.name}: ${text}\n`;
  }

  private static serializeUInt32(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number;
    const text =
      value !== undefined && value !== 4294967295 ? value.toString() : "nil";
    return `${indent}${segment.name}: ${text}\n`;
  }

  private static serializeUInt64(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as bigint;
    const text = value !== undefined ? value.toString() : "nil";
    return `${indent}${segment.name}: ${text}\n`;
  }

  private static serializeUInt16(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number;
    const text =
      value !== undefined && value !== 65535 ? value.toString() : "nil";
    return `${indent}${segment.name}: ${text}\n`;
  }

  private static serializeOrdinalString(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as string;
    return `${indent}${segment.name}: ${value}\n`;
  }

  private static serializeInt16Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }

  private static serializeInt16(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as number;
    const text =
      value !== undefined && value !== 32767 ? value.toString() : "nil";
    return `${indent}${segment.name}: ${text}\n`;
  }

  private static serializeSingleVector2(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const vector = segment.value as SingleVector2;
    return `${indent}${segment.name}: (${this.formatSingle(
      vector.a
    )}, ${this.formatSingle(vector.b)})\n`;
  }

  private static serializeInt32Vector3(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const vector = segment.value as Int32Vector3;
    return `${indent}${segment.name}: (${vector.a}, ${vector.b}, ${vector.c})\n`;
  }

  private static serializeSingleVector4(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const vector = segment.value as SingleVector4;
    return `${indent}${segment.name}: (${this.formatSingle(
      vector.a
    )}; ${this.formatSingle(vector.b)}, ${this.formatSingle(
      vector.c
    )}, ${this.formatSingle(vector.d)})\n`;
  }

  private static serializeSingleVector8(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const vector = segment.value as SingleVector8;
    return `${indent}${segment.name}: (${this.formatSingle(
      vector.a
    )}, ${this.formatSingle(vector.b)}, ${this.formatSingle(
      vector.c
    )}) (${this.formatSingle(vector.e)}; ${this.formatSingle(
      vector.f
    )}, ${this.formatSingle(vector.g)}, ${this.formatSingle(vector.h)})\n`;
  }

  private static serializeSingleVector7(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const vector = segment.value as SingleVector7;
    return `${indent}${segment.name}: (${this.formatSingle(
      vector.a
    )}, ${this.formatSingle(vector.b)}, ${this.formatSingle(
      vector.c
    )}) (${this.formatSingle(vector.d)}; ${this.formatSingle(
      vector.e
    )}, ${this.formatSingle(vector.f)}, ${this.formatSingle(vector.g)})\n`;
  }

  private static serializeInt64Array(
    segment: BSIIDataSegment,
    indent: string
  ): string {
    const value = segment.value as bigint[];
    let result = `${indent}${segment.name}: ${value.length}\n`;
    for (let i = 0; i < value.length; i++) {
      result += `${indent}${segment.name}[${i}]: ${value[i]}\n`;
    }
    return result;
  }
}
