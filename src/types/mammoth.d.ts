declare module "mammoth" {
  export interface MammothResult {
    value: string;
    messages: Array<{
      type: string;
      message: string;
    }>;
  }

  export function extractRawText(input: {
    buffer?: Buffer | ArrayBuffer | Uint8Array;
    arrayBuffer?: ArrayBuffer;
    path?: string;
  }): Promise<MammothResult>;
}
