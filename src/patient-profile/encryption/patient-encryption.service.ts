import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { ConfigService } from '@nestjs/config';

// Import SEAL đúng cách
const SEAL = require('node-seal');

@Injectable()
export class PatientEncryptionService implements OnModuleInit {
  private seal: any;
  private context: any;
  private encoder: any;
  private encryptor: any;
  private decryptor: any;
  private evaluator: any;
  private publicKey: any;
  private secretKey: any;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit() {
  const sealModule = await SEAL(); // ✅ Đúng cú pháp
  this.seal = sealModule;

  const schemeType = this.seal.SchemeType.bfv;
  const securityLevel = this.seal.SecurityLevel.tc128;
  const polyModulusDegree = 4096;

  const coeffModulus = this.seal.CoeffModulus.BFVDefault(polyModulusDegree);
  const plainModulus = this.seal.PlainModulus.Batching(polyModulusDegree, 20);

  const encParams = this.seal.EncryptionParameters(schemeType);
  encParams.setPolyModulusDegree(polyModulusDegree);
  encParams.setCoeffModulus(coeffModulus);
  encParams.setPlainModulus(plainModulus);

  this.context = this.seal.Context(encParams, true, securityLevel);

  if (!this.context.parametersSet()) {
    throw new Error('SEAL context not set correctly.');
  }

  const keyGenerator = this.seal.KeyGenerator(this.context);
  this.publicKey = keyGenerator.createPublicKey();
  this.secretKey = keyGenerator.secretKey();

  this.encoder = this.seal.BatchEncoder(this.context);
  this.encryptor = this.seal.Encryptor(this.context, this.publicKey);
  this.decryptor = this.seal.Decryptor(this.context, this.secretKey);
  this.evaluator = this.seal.Evaluator(this.context);
}


  async encryptString(value: string): Promise<string> {
    const codes = Array.from(value).map(char => char.charCodeAt(0));

    // Đảm bảo mảng đủ độ dài cho batch encoder
    while (codes.length < this.encoder.slotCount) {
      codes.push(0);
    }

    const plain = this.encoder.encode(Int32Array.from(codes));
    const cipher = this.seal.CipherText();
    this.encryptor.encrypt(plain, cipher);

    return cipher.save();
  }

  async decryptString(cipherText: string): Promise<string> {
    const cipher = this.seal.CipherText();
    cipher.load(this.context, cipherText);

    const plain = this.decryptor.decrypt(cipher);
    const decoded = this.encoder.decode(plain) as Int32Array;

    return Array.from(decoded)
      .filter(code => code !== 0)
      .map(code => String.fromCharCode(code))
      .join('');
  }
}
