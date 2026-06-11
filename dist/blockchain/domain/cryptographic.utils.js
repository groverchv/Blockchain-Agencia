"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CryptographicUtils = void 0;
const CryptoJS = __importStar(require("crypto-js"));
const elliptic_1 = require("elliptic");
const ec = new elliptic_1.ec('secp256k1');
class CryptographicUtils {
    static calculateHash(data) {
        return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
    }
    static verifySignature(publicKeyHex, dataHash, signatureHex) {
        if (!publicKeyHex || !dataHash || !signatureHex) {
            return false;
        }
        try {
            const key = ec.keyFromPublic(publicKeyHex, 'hex');
            return key.verify(dataHash, signatureHex);
        }
        catch (error) {
            return false;
        }
    }
    static generateKeyPair() {
        const key = ec.genKeyPair();
        return {
            privateKey: key.getPrivate('hex'),
            publicKey: key.getPublic('hex'),
        };
    }
}
exports.CryptographicUtils = CryptographicUtils;
//# sourceMappingURL=cryptographic.utils.js.map