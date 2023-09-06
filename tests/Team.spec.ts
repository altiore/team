import { Cell, toNano } from "ton-core";

import '@ton-community/test-utils';
import { compile } from '@ton-community/blueprint';
import { Blockchain, SandboxContract } from '@ton-community/sandbox';
import { TreasuryContract } from "@ton-community/sandbox/dist/treasury/Treasury";

import { Team } from '../wrappers/Team';

describe('Team', () => {
    let code: Cell;
    let deployer: SandboxContract<TreasuryContract>;
    let sender: SandboxContract<TreasuryContract>;

    beforeAll(async () => {
        code = await compile('Team');
    });

    let blockchain: Blockchain;
    let team: SandboxContract<Team>;

    beforeEach(async () => {
        blockchain = await Blockchain.create();

        deployer = await blockchain.treasury('deployer');

        team = blockchain.openContract(Team.createFromConfig({sender: deployer.address}, code));

        const deployResult = await team.sendDeployForTests(deployer.getSender(), toNano('0.05'));

        expect(deployResult.transactions).toHaveTransaction({
            from: deployer.address,
            to: team.address,
            deploy: true,
            success: true,
        });
    });

    it('should deploy', async () => {
        // the check is done inside beforeEach
        // blockchain and task1 are ready to use
    });

    it('getMember', async () => {
        expect(await team.getMembers()).toEqualAddress(deployer.address);
    });

    it('add second member', async () => {
        sender = await blockchain.treasury('requesterMembership');

        await team.sendRequestMembership(sender.getSender());

        expect(await team.getMembers()).toEqualCell(sender.address as any);
    });

});
