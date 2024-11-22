import fs from 'node:fs';
import path from 'node:path';

export class McApi {
  public readFile(assetId: string) {
    const filePath = path.resolve(__dirname, "tokens", `${assetId}.yaml`);
    return fs.readFileSync(filePath, "utf-8");
  }
}
