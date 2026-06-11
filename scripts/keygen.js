const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

function generateKeys() {
  const key = ec.genKeyPair();
  const privateKey = key.getPrivate('hex');
  const publicKey = key.getPublic('hex');

  console.log('=====================================================');
  console.log('       NEW CRYPTOGRAPHIC KEY PAIR GENERATED         ');
  console.log('=====================================================');
  console.log('Private Key (KEEP THIS SECRET):');
  console.log(privateKey);
  console.log('\nPublic Key (Share this to verify your identity):');
  console.log(publicKey);
  console.log('=====================================================');
}

generateKeys();
