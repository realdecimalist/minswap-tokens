import Ajv from "ajv";
import path from "node:path";
import * as fs from "node:fs";
import { load } from "js-yaml";
import { execSync } from "node:child_process";

import { DEFAULT_TOKEN_DIR } from "@/types";
import type { TokenMetadata } from "@/types";
import { tokenSchema } from "@/token-schema";

const ajv = new Ajv();
const __dirname = import.meta.dirname;
const TOKEN_DIR = path.join(__dirname, `../src/${DEFAULT_TOKEN_DIR}`);
const FILE_REGEX = /^.*[\\/]/;

async function validateTokenFiles(files: string[]) {
  for (const file of files) {
    if (!file.includes('src/tokens')) {
      continue;
    }
    const fileName = file.replace(FILE_REGEX, "");
    const filePath = path.join(TOKEN_DIR, `${fileName}`);
    const tokenFileData = fs.readFileSync(filePath, "utf-8");
    const tokenData: TokenMetadata = {
      tokenId: fileName,
      ...(load(tokenFileData) as Omit<TokenMetadata, "tokenId">),
    };
    const validate = ajv.validate(tokenSchema, tokenData);
    if (!validate) {
      throw new Error(`Error validating token, token file: ${fileName}`);
    }
  }
}

function getChangedFiles(extension = "") {
  const extensionFilter = extension ? `-- '***.${extension}'` : "";
  const command = `git diff HEAD^ HEAD --name-only ${extensionFilter}`;
  const diff = execSync(command.toString());

  return diff.toString().split("\n").filter(Boolean);
}

validateTokenFiles(getChangedFiles('yaml'));
