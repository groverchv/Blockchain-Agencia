export declare class CryptographicUtils {
    static calculateHash(data: string): string;
    static verifySignature(publicKeyHex: string, dataHash: string, signatureHex: string): boolean;
    static generateKeyPair(): {
        privateKey: any;
        publicKey: any;
    };
}
