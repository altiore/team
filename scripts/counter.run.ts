import { compile, NetworkProvider } from '@ton-community/blueprint';
import { toNano } from 'ton-core';

import { Counter } from '../wrappers/Counter';

export async function run(provider: NetworkProvider) {
    const counter = provider.open(Counter.createFromConfig({initialValue: 0n}, await compile('Counter')));

    await counter.sendDeployForTests(provider.sender(), toNano('0.05'));

    await provider.waitForDeploy(counter.address);

    // run methods on `Counter`
}
