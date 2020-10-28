import * as Crypto from 'crypto'

export class DHParams {
    publicKey: string;
    salt: string;
}

export class Encryption {
    // An entire openssl key is of this form with DER format, then base64 encoded
    // SEQUENCE(2 elem)
    //   SEQUENCE(2 elem)
    //      OBJECT IDENTIFIER1.2.840.10045.2.1 (ecPublicKey)
    //      OBJECT IDENTIFIER1.3.132.0.34 (P-384)
    // BIT STRING(776 bit) long key here
    // Nodejs Crypto key buffer only contains the value in the bitstring, excluding type and length
    // Therefore, we tack on the rest (this hex nonsense) so openssl knows what we're talking about
    readonly asn1HeaderHex: string = '3076301006072a8648ce3d020106052b81040022036200';
    readonly dhCurve: string = 'secp384r1';
    readonly keySize: number = 32;
    readonly blockSize: number = 16;
    readonly cipherAlg: string = 'aes-256-cfb8';
    readonly hashAlg: string = 'sha256';

    ecdh: Crypto.ECDH;
    salt: Buffer;
    cipherIV: Buffer;
    cipherKey: Buffer;
    cipher: Crypto.Cipher;
    decipher: Crypto.Decipher;

    beginDHExchange(): DHParams {
        this.ecdh = Crypto.createECDH(this.dhCurve);
        let result: DHParams = new DHParams();

        result.publicKey = this.ecdh.generateKeys('hex', 'uncompressed');
        // The returned value is the bitstring portion of the key, tack this header on and it, base64 encode it and it becomes a blob ready for openssl
        result.publicKey = new Buffer(this.asn1HeaderHex + result.publicKey, 'hex').toString('base64');

        let rawSalt: Buffer = Crypto.randomBytes(this.blockSize);
        result.salt = rawSalt.toString('base64');
        this.salt = rawSalt;

        return result;
    }

    completeDHExchange(publicKey: string): boolean {
        let publicBuffer: Buffer = new Buffer(publicKey, 'base64');
        // Cut off the header. Buffer is bytes, and header is in hex, where 2 characters are a byte
        publicBuffer = publicBuffer.slice(this.asn1HeaderHex.length/2);
        let shared: Buffer = this.ecdh.computeSecret(publicBuffer);

        let salted = Buffer.concat([this.salt, shared]);

        let hasher: Crypto.Hash = Crypto.createHash(this.hashAlg);
        hasher.update(salted);
        this.cipherKey = hasher.digest();
        this.cipherIV = this.cipherKey.slice(0, this.blockSize);

        this.cipher = Crypto.createCipheriv(this.cipherAlg, this.cipherKey, this.cipherIV);
        this.decipher = Crypto.createDecipheriv(this.cipherAlg, this.cipherKey, this.cipherIV);
        this.cipher.setAutoPadding(false);
        this.decipher.setAutoPadding(false);

        return true;
    }

    encrypt(plainText: string): Buffer {
        return this.cipher.update(plainText, 'utf8');
    }

    decrypt(cipherText: Buffer): string {
        let buff = this.decipher.update(cipherText);
        return buff.toString('utf8');
    }

    enabled(): boolean {
        return this.cipher != null;
    }

    disable() {
        this.cipher = null;
        this.decipher = null;
    }
}