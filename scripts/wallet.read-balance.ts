import { getHttpEndpoint } from "@orbs-network/ton-access";
import { WalletContractV4, TonClient, fromNano } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";

import {mnemonic} from '../vars';

async function main() {
	const key = await mnemonicToWalletKey(mnemonic.split(" "));
	const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

	// Создает клиент в тестовой рабочей области
	const endpoint = await getHttpEndpoint({ network: "testnet" });
	const client = new TonClient({ endpoint });

	// Запрос баланса из цепи
	const balance = await client.getBalance(wallet.address);
	console.log("balance:", fromNano(balance));

	// Запрос seqno из цепи
	const walletContract = client.open(wallet);
	const seqno = await walletContract.getSeqno();
	console.log("seqno:", seqno);
}

main();
