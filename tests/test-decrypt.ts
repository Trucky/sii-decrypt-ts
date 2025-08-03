import { writeFileSync } from "fs";
import { Decryptor } from "../src";

const result = Decryptor.decrypt("./data/game.sii", true);

console.log("Decryption Result:", result);

writeFileSync("./data/decrypted.sii", result.data);