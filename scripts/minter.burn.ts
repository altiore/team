import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, WalletContractV4 } from "ton";
import { Address } from "ton-core";
import { mnemonicToWalletKey } from "ton-crypto";

import {mnemonic} from '../vars';
import { Minter } from "../wrappers/Minter";

async function deploy() {
  // initialize ton rpc client on testnet
  const endpoint = await getHttpEndpoint({ network: "testnet" });
  const client = new TonClient({ endpoint });

  const minterAddress = Address.parse('EQAX6oM6TF-EV15APYTNDZJgK9qGbqScr_zIV0oFeASLvRdm');
  const minter = Minter.createFromAddress(minterAddress);

  const key = await mnemonicToWalletKey(mnemonic.split(" "));
  const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
  if (!await client.isContractDeployed(wallet.address)) {
    return console.log("wallet is not deployed");
  }

  console.log("wallet address:");
  console.log(wallet.address.toString({ testOnly: true }));

  // open wallet and read the current seqno of the wallet
  const walletContract = client.open(wallet);
  const walletSender = walletContract.sender(key.secretKey);
  const seqno = await walletContract.getSeqno();

  // send the transaction (deploy)
  const counterContract = client.open(minter);
  await counterContract.sendBurnTokens(walletSender, 783680);

  // wait until confirmed
  let currentSeqno = seqno;
  while (currentSeqno == seqno) {
    console.log("waiting for deploy transaction to confirm...");
    await sleep(1500);
    currentSeqno = await walletContract.getSeqno();
  }
  console.log("deploy transaction confirmed!");
}

deploy();

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
