import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, WalletContractV4 } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";

import {mnemonic} from '../vars';
import { Counter } from "../wrappers/Counter";
import { Address } from "ton-core";

async function increment() {
	// initialize ton rpc client on testnet
	const endpoint = await getHttpEndpoint({ network: "testnet" });
	const client = new TonClient({ endpoint });

	const key = await mnemonicToWalletKey(mnemonic.split(" "));
	const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

	// open wallet and read the current seqno of the wallet
	const walletContract = client.open(wallet);
	const walletSender = walletContract.sender(key.secretKey);
	const seqno = await walletContract.getSeqno();

	const counterAddress = Address.parse('EQDDyG0gkODKEK9mO9YId1V42qD2yzzj1q5XRwrmtxbA2nh6');
	const counter = Counter.createFromAddress(counterAddress);
	const counterContract = client.open(counter);
	await counterContract.sendIncrement(walletSender);

	// wait until confirmed
	let currentSeqno = seqno;
	while (currentSeqno == seqno) {
		console.log("waiting for deploy transaction to confirm...");
		await sleep(1500);
		currentSeqno = await walletContract.getSeqno();
	}
	console.log("deploy transaction confirmed!");
}

increment();

function sleep(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms));
}
