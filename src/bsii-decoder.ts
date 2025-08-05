import { BSIISerializer } from "./bsii-serializer";
import { BSIITypeDecoder } from "./decoder-utils";
import {
  BSIIData,
  BSIIDataSegment,
  BSIIStructureBlock,
  BSIISupportedVersions,
  DataTypeIdFormat,
  SIIDecodeResult,
} from "./types";

export class BSIIDecoder {
  static decode(bytes: Buffer): SIIDecodeResult {
    const result: SIIDecodeResult = {
      data: Buffer.alloc(0),
      success: false,
    };

    const streamPos = { value: 0 };
    const fileData: BSIIData = {
      header: { signature: 0, version: 0 },
      blocks: [],
      decodedBlocks: [],
    };

    fileData.header.signature = BSIITypeDecoder.decodeUInt32(bytes, streamPos);
    fileData.header.version = BSIITypeDecoder.decodeUInt32(bytes, streamPos);

    if (
      fileData.header.version !== BSIISupportedVersions.Version1 &&
      fileData.header.version !== BSIISupportedVersions.Version2 &&
      fileData.header.version !== BSIISupportedVersions.Version3
    ) {
      throw new Error("BSII version not supported");
    }

    result.header = fileData.header;

    let currentBlock: BSIIStructureBlock;
    let blockType = 0;
    const ordinalLists = new Map<number, Map<number, string>>();

    do {
      blockType = BSIITypeDecoder.decodeUInt32(bytes, streamPos);

      if (blockType === 0) {
        currentBlock = {
          type: blockType,
          structureId: 0,
          validity: false,
          name: "",
          segments: [],
        };

        currentBlock.validity = BSIITypeDecoder.decodeBool(bytes, streamPos);
        if (!currentBlock.validity) {
          fileData.blocks.push(currentBlock);
          continue;
        }

        currentBlock.structureId = BSIITypeDecoder.decodeUInt32(
          bytes,
          streamPos
        );
        currentBlock.name = BSIITypeDecoder.decodeUTF8String(bytes, streamPos);

        let segment: BSIIDataSegment = { name: "", type: 999, value: null };

        while (segment.type !== 0) {
          segment = this.readDataBlock(bytes, streamPos);
          if (
            segment.type === DataTypeIdFormat.OrdinalString &&
            !ordinalLists.has(currentBlock.structureId)
          ) {
            ordinalLists.set(currentBlock.structureId, segment.value);
          }
          currentBlock.segments.push(segment);
        }

        if (
          !fileData.blocks.some(
            (x) => x.structureId === currentBlock.structureId
          )
        ) {
          fileData.blocks.push(currentBlock);
        }
      } else {
        const blockDataItem = fileData.blocks.find(
          (x) => x.structureId === blockType
        );
        if (!blockDataItem) continue;

        const blockData: BSIIStructureBlock = {
          structureId: blockDataItem.structureId,
          name: blockDataItem.name,
          type: blockDataItem.type,
          validity: blockDataItem.validity,
          segments: blockDataItem.segments.map((segment) => ({
            name: segment.name,
            type: segment.type,
            value: segment.value,
          })),
        };

        if (blockDataItem.id) {
          blockData.id = {
            address: blockDataItem.id.address,
            partCount: blockDataItem.id.partCount,
            value: blockDataItem.id.value,
          };
        }

        const list =
          ordinalLists.get(blockData.structureId) || new Map<number, string>();
        this.loadDataBlockLocal(
          bytes,
          streamPos,
          blockData,
          fileData.header.version,
          list
        );
        fileData.decodedBlocks.push(blockData);
      }
    } while (streamPos.value < bytes.length);

    result.data = BSIISerializer.serialize(fileData);
    result.success = true;

    return result;
  }

  private static loadDataBlockLocal(
    bytes: Buffer,
    streamPos: { value: number },
    segment: BSIIStructureBlock,
    formatVersion: number,
    values: Map<number, string>
  ): boolean {
    segment.id = BSIITypeDecoder.decodeID(bytes, streamPos);

    for (let i = 0; i < segment.segments.length; i++) {
      const dataType = segment.segments[i].type;

      switch (dataType) {
        case DataTypeIdFormat.ArrayOfByteBool:
          segment.segments[i].value = BSIITypeDecoder.decodeBoolArray(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfEncodedString:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt64StringArray(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfIdA:
        case DataTypeIdFormat.ArrayOfIdC:
        case DataTypeIdFormat.ArrayOfIdE:
          segment.segments[i].value = BSIITypeDecoder.decodeIDArray(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfInt32:
          segment.segments[i].value = BSIITypeDecoder.decodeInt32Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfSingle:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleArray(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfUInt16:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt16Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfUInt32:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt32Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfUInt64:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt64Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfUTF8String:
          segment.segments[i].value = BSIITypeDecoder.decodeUTF8StringArray(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfVectorOf3Int32:
          segment.segments[i].value = BSIITypeDecoder.decodeInt32Vector3Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfVectorOf3Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleVector3Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfVectorOf4Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleVector4Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfVectorOf8Single:
          if (formatVersion === 1) {
            segment.segments[i].value =
              BSIITypeDecoder.decodeSingleVector7Array(bytes, streamPos);
          } else {
            segment.segments[i].value =
              BSIITypeDecoder.decodeSingleVector8Array(bytes, streamPos);
          }
          break;
        case DataTypeIdFormat.ByteBool:
          segment.segments[i].value = BSIITypeDecoder.decodeBool(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.EncodedString:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt64String(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.IdType3:
        case DataTypeIdFormat.IdType2:
        case DataTypeIdFormat.Id:
          segment.segments[i].value = BSIITypeDecoder.decodeID(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.Int32:
          segment.segments[i].value = BSIITypeDecoder.decodeInt32(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.Int64:
          segment.segments[i].value = BSIITypeDecoder.decodeInt64(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.UInt32Type2:
        case DataTypeIdFormat.UInt32:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt32(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.UInt64:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt64(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.UInt16:
          segment.segments[i].value = BSIITypeDecoder.decodeUInt16(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.OrdinalString:
          segment.segments[i].value =
            BSIITypeDecoder.getOrdinalStringFromValues(
              values,
              bytes,
              streamPos
            );
          break;
        case DataTypeIdFormat.Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingle(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.UTF8String:
          segment.segments[i].value = BSIITypeDecoder.decodeUTF8String(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.VectorOf2Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleVector2(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.VectorOf3Int32:
          segment.segments[i].value = BSIITypeDecoder.decodeInt32Vector3(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.VectorOf3Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleVector3(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.VectorOf4Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleVector4(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.VectorOf8Single:
          if (formatVersion === 1) {
            segment.segments[i].value = BSIITypeDecoder.decodeSingleVector7(
              bytes,
              streamPos
            );
          } else {
            segment.segments[i].value = BSIITypeDecoder.decodeSingleVector8(
              bytes,
              streamPos
            );
          }
          break;
        case DataTypeIdFormat.ArrayOfInt64:
          segment.segments[i].value = BSIITypeDecoder.decodeInt64Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfInt16:
          segment.segments[i].value = BSIITypeDecoder.decodeInt16Array(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.Int16:
          segment.segments[i].value = BSIITypeDecoder.decodeInt16(
            bytes,
            streamPos
          );
          break;
        case DataTypeIdFormat.ArrayOfVectorOf2Single:
          segment.segments[i].value = BSIITypeDecoder.decodeSingleVector2Array(
            bytes,
            streamPos
          );
          break;
        case 0:
          continue;
        default:
          console.warn("UNKNOWN TYPE:", dataType);
          break;
      }
    }

    return true;
  }

  private static readDataBlock(
    bytes: Buffer,
    streamPos: { value: number }
  ): BSIIDataSegment {
    const result: BSIIDataSegment = { name: "", type: 0, value: null };
    result.type = BSIITypeDecoder.decodeUInt32(bytes, streamPos);

    if (result.type !== 0) {
      result.name = BSIITypeDecoder.decodeUTF8String(bytes, streamPos);
    }

    if (result.type === DataTypeIdFormat.OrdinalString) {
      result.value = BSIITypeDecoder.decodeOrdinalStringList(bytes, streamPos);
    }

    return result;
  }
}
