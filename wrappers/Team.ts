import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
} from 'ton-core';

interface TeamConfig {
    sender: Address;
}

export class Team implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Team(address);
    }

    static createFromConfig(config: TeamConfig, code: Cell, workchain = 0) {
        const data = beginCell()
          .storeAddress(config.sender)
          .endCell();
        const init = { code, data };
        return new Team(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender) {
        await provider.internal(via, {
            value: "0.01", // send 0.01 TON to contract for rent
            bounce: false
        });
    }

    async sendDeployForTests(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendRequestMembership(provider: ContractProvider, via: Sender) {
        const messageBody = beginCell()
          .storeUint(1, 32) // op (op #1 = request_membership)
          .storeUint(0, 64) // query id
          .endCell();
        await provider.internal(via, {
            value: "0.002", // send 0.002 TON for gas
            body: messageBody
        });
    }

    async getMembers(provider: ContractProvider): Promise<Cell> {
        const result = await provider.get('get_members', []);
        return result.stack.readCell();
    }

    async getOpCode(provider: ContractProvider): Promise<bigint> {
        const result = await provider.get('get_op_codes', []);
        return result.stack.readBigNumber();
    }
}
