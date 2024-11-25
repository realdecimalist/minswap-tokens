import Ajv from "ajv";
import path from "node:path";
import * as fs from "node:fs";
import { load } from "js-yaml";

import { DEFAULT_TOKEN_DIR } from "@/types";
import type { TokenMetadata } from "@/types";
import { tokenSchema } from "@/token-schema";

const ajv = new Ajv();
const __dirname = import.meta.dirname;
const TOKEN_DIR = path.join(__dirname, `../src/${DEFAULT_TOKEN_DIR}`);

const files = fs.readdirSync(TOKEN_DIR, "utf8");

async function validateTokenFiles(files: string[]) {
  for (const file of files) {
    const fileName = file.substring(0, file.length - 5);
    const filePath = path.join(TOKEN_DIR, `${fileName}.yaml`);
    const tokenFileData = fs.readFileSync(filePath, "utf-8");
    const tokenData: TokenMetadata = {
      tokenId: fileName,
      ...(load(tokenFileData) as Omit<TokenMetadata, "tokenId">),
    };
    const validate = ajv.validate(tokenSchema, tokenData);
    if (!validate) {
      throw new Error(`Error validating token, token ID: ${fileName}`);
    }
  }
}

validateTokenFiles(files);
