import { Seal } from 'node-seal/implementation/seal';

declare module 'node-seal' {
  export interface SEALLibrary {
    SchemeType: {
      bfv: number;
      ckks: number;
      bgv: number;
    };
    SecurityLevel: {
      tc128: number;
      tc256: number;
    };
    CoeffModulus: {
      BFVDefault: (polyModulusDegree: number) => any;
      Create: (polyModulusDegree: number, bitSizes: Int32Array) => any;
    };
    PlainModulus: {
      Batching: (polyModulusDegree: number, bitSize: number) => any;
    };
    EncryptionParameters: (schemeType: number) => any;
    Context: (params: any, expandModChain: boolean, secLevel: number) => any;
    KeyGenerator: (context: any) => {
      createPublicKey: () => any;
      secretKey: () => any;
      createRelinKeys: () => any;
      createGaloisKeys: () => any;
    };
    BatchEncoder: (context: any) => any;
    Encryptor: (context: any, publicKey: any) => any;
    Decryptor: (context: any, secretKey: any) => any;
    Evaluator: (context: any) => any;
    CipherText: () => any;
    PlainText: () => any;
  }

  function getInstance(): Promise<SEALLibrary>;
  export default getInstance;
}
