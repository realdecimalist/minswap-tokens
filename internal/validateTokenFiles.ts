import Ajv from "ajv";
import path from "node:path";
import * as fs from "node:fs";
import { load } from "js-yaml";
import { execSync } from "node:child_process";

import { DEFAULT_TOKEN_DIR } from "@/const";
import type { TokenMetadata } from "@/types";
import { tokenSchema } from "@/token-schema";

const ajv = new Ajv();
const __dirname = import.meta.dirname;
const TOKEN_DIR = path.join(__dirname, `../src/${DEFAULT_TOKEN_DIR}`);

async function validateTokenFiles(files: string[]) {
  for (const file of files) {
    if (!file.includes("src/tokens")) {
      continue;
    }
    const fileComponents = file.split("/");
    const fileName = fileComponents[fileComponents.length - 1];
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
  const command = `git diff --name-only @{u}...HEAD ${extensionFilter}`;
  const diff = execSync(command.toString());
  return diff.toString().split("\n").filter(Boolean);
}

validateTokenFiles(getChangedFiles("yaml"));
