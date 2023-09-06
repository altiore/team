import { Cell, toNano } from 'ton-core';

import { compile } from '@ton-community/blueprint';
import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import '@ton-community/test-utils';

import { Counter } from '../wrappers/Counter';

describe('Counter', () => {
    let code: Cell;

    beforeAll(async () => {
        code = await compile('Counter');
    });

    let blockchain: Blockchain;
    let counter: SandboxContract<Counter>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        counter = blockchain.openContract(Counter.createFromConfig({initialValue: 0n}, code));

        const deployer = await blockchain.treasury('deployer');

        const deployResult = await counter.sendDeployForTests(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: counter.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    });

    it('check initial counter', async () => {
        const res = await counter.getCounter();
        expect(res).toEqual(0n);
    });

    it('test op code', async () => {
        expect(await counter.getOpCode()).toEqual(0);
    })

});
