export class StreamUtils {
    static tryReadUInt32(bytes: Buffer, offset: { value: number }): { success: boolean; result: number } {
        try {
            if (offset.value + 4 <= bytes.length) {
                const result = bytes.readUInt32LE(offset.value);
                offset.value += 4;
                return { success: true, result };
            }
        } catch (error) {
            // Handle error
        }
        return { success: false, result: 0 };
    }
}