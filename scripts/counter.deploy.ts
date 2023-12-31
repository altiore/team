import * as fs from "fs";

import { getHttpEndpoint } from "@orbs-network/ton-access";
import { TonClient, Cell, WalletContractV4 } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";

import {mnemonic} from '../vars';
import {Counter} from "../wrappers/Counter";

async function deploy() {
	// initialize ton rpc client on testnet
	const endpoint = await getHttpEndpoint({ network: "testnet" });
	const client = new TonClient({ endpoint });

	// prepare Counter's initial code and data cells for deployment
	const counterCode = Cell.fromBoc(fs.readFileSync("./cells/counter.cell"))[0];

	const initialCounterValue = Date.now(); // to avoid collisions use current number of milliseconds since epoch as initial value
	const counter = Counter.createFromConfig({initialValue: BigInt(initialCounterValue)}, counterCode);

	// exit if contract is already deployed
	console.log("contract address:", counter.address.toString());
	if (await client.isContractDeployed(counter.address)) {
		return console.log("Counter already deployed");
	}

	const key = await mnemonicToWalletKey(mnemonic.split(" "));
	const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });
	if (!await client.isContractDeployed(wallet.address)) {
		return console.log("wallet is not deployed");
	}

	// open wallet and read the current seqno of the wallet
	const walletContract = client.open(wallet);
	const walletSender = walletContract.sender(key.secretKey);
	const seqno = await walletContract.getSeqno();

	// send the transaction (deploy)
	const counterContract = client.open(counter);
	await counterContract.sendDeploy(walletSender);

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
