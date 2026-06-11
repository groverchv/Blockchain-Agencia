import * as CryptoJS from 'crypto-js';
import { ec as EC } from 'elliptic';

const ec = new EC('secp256k1');

export class CryptographicUtils {
  /**
   * Generates a SHA-256 hash for the given data.
   */
  static calculateHash(data: string): string {
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  }

  /**
   * Verifies an Elliptic Curve signature (secp256k1).
   * @param publicKeyHex Hex-encoded public key of the sender.
   * @param dataHash Hash of the message data.
   * @param signatureHex Hex-encoded signature.
   */
  static verifySignature(
    publicKeyHex: string,
    dataHash: string,
    signatureHex: string,
  ): boolean {
    if (!publicKeyHex || !dataHash || !signatureHex) {
      return false;
    }
    try {
      const key = ec.keyFromPublic(publicKeyHex, 'hex');
      return key.verify(dataHash, signatureHex);
    } catch (error) {
      return false;
    }
  }

  /**
   * Helper to instantiate a new key pair (useful for keygen scripts).
   */
  static generateKeyPair() {
    const key = ec.genKeyPair();
    return {
      privateKey: key.getPrivate('hex'),
      publicKey: key.getPublic('hex'),
    };
  }
}
