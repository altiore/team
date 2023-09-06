import {
    Address,
    beginCell,
    Cell,
    Contract,
    ContractProvider,
    Sender,
    SendMode,
} from 'ton-core';

const OpCode = {
    burn_notification: 2078119902n,
}

export class Minter implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Minter(address);
    }

    async sendBurnTokens(provider: ContractProvider, via: Sender, amount: number) {
        await provider.internal(via, {
            value: "0.01", // send 0.01 TON to contract for rent
            bounce: false,
            body: beginCell()
              .storeCoins(amount)
              .storeUint(OpCode.burn_notification, 64)
              .endCell(),
        });
    }

    async getCounter(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('counter', []);
        return result.stack.readBigNumber();
    }
}
