const EC = require('elliptic').ec;
const ec = new EC('secp256k1');
const CryptoJS = require('crypto-js');

// Node Addresses
const NODES = {
  node1: 'http://localhost:3001',
  node2: 'http://localhost:3002',
  node3: 'http://localhost:3003',
};

// Cryptographic helpers
function calculateTxHash(sender, recipient, data, timestamp) {
  const dataString = typeof data === 'string' ? data : JSON.stringify(data);
  return CryptoJS.SHA256(sender + recipient + dataString + timestamp).toString(CryptoJS.enc.Hex);
}

async function runTest() {
  console.log('Starting Decentralized Network Integration Test...');

  // 1. Generate Recruiter Keys (Sender) and Candidate Keys (Recipient)
  const recruiterKey = ec.genKeyPair();
  const recruiterPrivate = recruiterKey.getPrivate('hex');
  const recruiterPublic = recruiterKey.getPublic('hex');

  const candidateKey = ec.genKeyPair();
  const candidatePublic = candidateKey.getPublic('hex');

  console.log('✔ Cryptographic keys generated successfully.');
  console.log(`Recruiter Public Key: ${recruiterPublic.substring(0, 20)}...`);
  console.log(`Candidate Public Key: ${candidatePublic.substring(0, 20)}...`);

  // 2. Prepare Transaction Data
  const timestamp = Date.now();
  const txData = {
    jobId: 'CONTRACT-2026-X8',
    jobTitle: 'Lead Software Architect',
    salary: '120000 USD/Year',
    status: 'SIGNED_BY_RECRUITER',
  };

  // 3. Compute Hash and Sign Transaction
  const txHash = calculateTxHash(recruiterPublic, candidatePublic, txData, timestamp);
  const signature = recruiterKey.sign(txHash).toDER('hex');
  console.log('✔ Transaction successfully signed.');

  const txPayload = {
    sender: recruiterPublic,
    recipient: candidatePublic,
    data: txData,
    signature: signature,
  };

  // 4. Submit Transaction to Node 1
  console.log('\nSubmitting signed transaction to Node 1...');
  try {
    const txResponse = await fetch(`${NODES.node1}/api/blockchain/transaction`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(txPayload),
    });

    const txResult = await txResponse.json();
    if (!txResponse.ok) {
      throw new Error(`Failed to submit transaction: ${JSON.stringify(txResult)}`);
    }
    console.log('✔ Node 1 Response:', txResult.message);
  } catch (error) {
    console.error('✖ Error submitting transaction:', error.message);
    return;
  }

  // 5. Mine pending transactions on Node 1
  console.log('\nTriggering block mining on Node 1...');
  try {
    const mineResponse = await fetch(`${NODES.node1}/api/blockchain/mine`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ rewardAddress: recruiterPublic }),
    });

    const mineResult = await mineResponse.json();
    if (!mineResponse.ok) {
      throw new Error(`Failed to mine block: ${JSON.stringify(mineResult)}`);
    }
    console.log('✔ Node 1 Block Mined successfully!');
    console.log(`New Block Hash: ${mineResult.block.hash}`);
  } catch (error) {
    console.error('✖ Error mining block:', error.message);
    return;
  }

  // 6. Register peers
  console.log('\nConfiguring Peer-to-Peer network discovery...');
  try {
    // Register Node 2 on Node 1
    await fetch(`${NODES.node1}/api/blockchain/peers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://blockchain-node-2:3000' }), // Docker internal address
    });

    // Register Node 1 on Node 2
    await fetch(`${NODES.node2}/api/blockchain/peers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://blockchain-node-1:3000' }), // Docker internal address
    });

    // Register Node 1 on Node 3
    await fetch(`${NODES.node3}/api/blockchain/peers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://blockchain-node-1:3000' }), // Docker internal address
    });

    console.log('✔ Peers successfully cross-registered.');
  } catch (error) {
    console.error('✖ Error registering peers:', error.message);
    return;
  }

  // 7. Synchronize Node 2 and Node 3 (Longest chain consensus)
  console.log('\nTriggering ledger consensus synchronization on Node 2...');
  try {
    const syncResponse = await fetch(`${NODES.node2}/api/blockchain/peers/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const syncResult = await syncResponse.json();
    console.log('✔ Node 2 Sync Result:', syncResult.message);
  } catch (error) {
    console.error('✖ Error syncing Node 2:', error.message);
  }

  console.log('Triggering ledger consensus synchronization on Node 3...');
  try {
    const syncResponse = await fetch(`${NODES.node3}/api/blockchain/peers/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const syncResult = await syncResponse.json();
    console.log('✔ Node 3 Sync Result:', syncResult.message);
  } catch (error) {
    console.error('✖ Error syncing Node 3:', error.message);
  }

  // 8. Verify chains match
  console.log('\nVerifying ledger states across the network...');
  try {
    const chain1 = await (await fetch(`${NODES.node1}/api/blockchain`)).json();
    const chain2 = await (await fetch(`${NODES.node2}/api/blockchain`)).json();
    const chain3 = await (await fetch(`${NODES.node3}/api/blockchain`)).json();

    console.log(`Node 1 Chain Height: ${chain1.length}`);
    console.log(`Node 2 Chain Height: ${chain2.length}`);
    console.log(`Node 3 Chain Height: ${chain3.length}`);

    const hashesMatch = chain1[1]?.hash === chain2[1]?.hash && chain2[1]?.hash === chain3[1]?.hash;

    if (hashesMatch && chain1.length === 2) {
      console.log('\n⭐⭐⭐⭐⭐ INTEGRATION TEST SUCCESSFUL ⭐⭐⭐⭐⭐');
      console.log('All nodes successfully synchronized the ledger and validated the cryptographic hash chain.');
    } else {
      console.log('\n⚠ Warning: Chain mismatch or unexpected height detected.');
    }
  } catch (error) {
    console.error('✖ Error verifying chains:', error.message);
  }
}

// Run the script if executed directly
if (require.main === module) {
  runTest();
}
