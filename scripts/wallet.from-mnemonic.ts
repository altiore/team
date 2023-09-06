import { WalletContractV4 } from "ton";
import { mnemonicToWalletKey } from "ton-crypto";

import {mnemonic} from '../vars';

/**
 * Определение хеша кошелька по секретным фразам
 */
async function main() {
	// Получение ключа из секретной фразы mnemonic - это 24 секретные слова разделенные пробелом
	const key = await mnemonicToWalletKey(mnemonic.split(" "));
	const wallet = WalletContractV4.create({ publicKey: key.publicKey, workchain: 0 });

	console.log(wallet.address.toString({ testOnly: true }));
	console.log("workchain:", wallet.address.workChain);
}

main();
