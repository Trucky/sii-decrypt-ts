export enum SignatureType {
  Unknown = 999,
  PlainText = 1315531091,
  Encrypted = 1131635539,
  Binary = 1229542210,
  _3nK = 21720627,
}

export enum DataTypeIdFormat {
  UTF8String = 0x01,
  ArrayOfUTF8String = 0x02,
  EncodedString = 0x03,
  ArrayOfEncodedString = 0x04,
  Single = 0x05,
  ArrayOfSingle = 0x06,
  VectorOf2Single = 0x07,
  ArrayOfVectorOf2Single = 0x08,
  VectorOf3Single = 0x09,
  ArrayOfVectorOf3Single = 0x0a,
  VectorOf3Int32 = 0x11,
  ArrayOfVectorOf3Int32 = 0x12,
  VectorOf4Single = 0x17,
  ArrayOfVectorOf4Single = 0x18,
  VectorOf8Single = 0x19,
  ArrayOfVectorOf8Single = 0x1a,
  Int32 = 0x25,
  ArrayOfInt32 = 0x26,
  UInt32 = 0x27,
  ArrayOfUInt32 = 0x28,
  Int16 = 0x29,
  ArrayOfInt16 = 0x2a,
  UInt16 = 0x2b,
  ArrayOfUInt16 = 0x2c,
  UInt32Type2 = 0x2f,
  Int64 = 0x31,
  ArrayOfInt64 = 0x32,
  UInt64 = 0x33,
  ArrayOfUInt64 = 0x34,
  ByteBool = 0x35,
  ArrayOfByteBool = 0x36,
  OrdinalString = 0x37,
  Id = 0x39,
  ArrayOfIdA = 0x3a,
  ArrayOfIdC = 0x3c,
  IdType2 = 0x3b,
  IdType3 = 0x3d,
  ArrayOfIdE = 0x3e,
}

export interface IDataFragment {
  serializeToString(): string;
}

export interface SingleVector2 {
  a: number;
  b: number;
}

export interface SingleVector3 extends SingleVector2 {
  c: number;
}

export interface SingleVector4 extends SingleVector3 {
  d: number;
}

export interface SingleVector7 extends SingleVector4 {
  e: number;
  f: number;
  g: number;
}

export interface SingleVector8 extends SingleVector7 {
  h: number;
}

export interface Int32Vector2 {
  a: number;
  b: number;
}

export interface Int32Vector3 extends Int32Vector2 {
  c: number;
}

export interface Int32Vector4 extends Int32Vector3 {
  d: number;
}

export interface Int32Vector7 extends Int32Vector4 {
  e: number;
  f: number;
  g: number;
}

export interface Int32Vector8 extends Int32Vector7 {
  h: number;
}

export interface IDComplexType {
  partCount: number;
  address: bigint;
  value: string;
}

export interface SIIHeader {
  signature: number;
  dataSize: number;
}

export interface SIIData {
  header: SIIHeader;
  data: Buffer;
  binaryFormatInfo?: {
    header?: BSIIHeader;
    success?: boolean;
  }
}

export interface BSIIHeader {
  signature: number;
  version: number;
}

export interface BSIIDataSegment {
  name: string;
  type: number;
  value: any;
}

export interface BSIIStructureBlock {
  type: number;
  structureId: number;
  validity: boolean;
  name: string;
  segments: BSIIDataSegment[];
  id?: IDComplexType;
}

export interface BSIIData {
  header: BSIIHeader;
  blocks: BSIIStructureBlock[];
  decodedBlocks: BSIIStructureBlock[];
}

export enum BSIISupportedVersions {
  Version1 = 1,
  Version2 = 2,
  Version3 = 3,
}

export type SIIDecryptResult = {
  data: Buffer;
  string_content?: string;
  success: boolean;
  type: "plain" | "encrypted" | "binary" | "3nK";
  error?: string;
  encrypted?: boolean;
  binaryFormatInfo?: {
    header?: BSIIHeader;
    success?: boolean;  
  }
};

export type SIIDecodeResult = {
  data: Buffer;
  header?: BSIIHeader;
  success: boolean;
  error?: string;
};
