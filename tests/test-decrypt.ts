import { writeFileSync } from "fs";
import { SIIDecryptor } from "../src/decryptor";
import { SIIDecryptResult } from "../src/types";

const files = [
  "./data/game_save_format_0.sii",
  "./data/game_save_format_1.sii",
  "./data/game_save_format_2.sii",
  "./data/game_save_format_3.sii",
  "./data/game_debug_save_format_3.sii",
  "./data/game_invalid_floating_point_1.sii",
  "./data/game_invalid_floating_point_2.sii",
];

files.forEach((file) => {
  console.log(`Decrypting file: ${file}`);

  const result: SIIDecryptResult = SIIDecryptor.decrypt(file, true);

  //console.log(result.string_content);
  console.log("Decryption Result:", {
    success: result.success,
    error: result.error,
    dataLength: result.data.length,
    stringContent: result.string_content ? result.string_content.length : 0,
  });

  // get the base name of the file
  const baseName = file.split("/").pop()?.replace(".sii", "") || "decrypted";
  writeFileSync(`./data/${baseName}_decrypted.sii`, result.data);
});
