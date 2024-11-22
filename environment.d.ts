declare global {
  namespace NodeJS {
    interface ProcessEnv {
      BLOCKFROST_PROJECT_ID: string;
    }
  }
}

export {};
