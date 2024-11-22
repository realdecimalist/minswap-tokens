import fs from 'fs';
import path from 'path';

export class McApi {
  public readFile(assetId: string) {
    const filePath = path.resolve(__dirname, "tokens", `${assetId}.yaml`);
    return fs.readFileSync(filePath, "utf-8");
  }
}
