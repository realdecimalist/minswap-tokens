import Ajv from "ajv";
import path from "node:path";
import * as fs from "node:fs";
import { load } from "js-yaml";

import { DEFAULT_TOKEN_DIR } from "@/const";
import type { TokenMetadata } from "@/types";
import { tokenSchema } from "@/tokenSchema";

const ajv = new Ajv();
const __dirname = import.meta.dirname;
const TOKEN_DIR = path.join(__dirname, `../src/${DEFAULT_TOKEN_DIR}`);

async function validateTokenFiles() {
  fs.readdir(TOKEN_DIR, (error, files) => {
    if (error) {
      console.error(error);
      throw error;
    }
    for (const file of files) {
      const filePath = path.join(TOKEN_DIR, `${file}`);
      const tokenFileData = fs.readFileSync(filePath, "utf-8");
      const tokenData: TokenMetadata = {
        tokenId: file.split('.')[0],
        ...(load(tokenFileData) as Omit<TokenMetadata, "tokenId">),
      };
      const validate = ajv.validate(tokenSchema, tokenData);
      if (!validate) {
        throw new Error(`Error validating token, token file: ${file}`);
      }
    }
  });
}

validateTokenFiles();
