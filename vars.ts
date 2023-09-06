import fs from 'fs'

export const mnemonic = fs.readFileSync('./mnemonic.txt').toString().trim();

export const testWallet = "kQDsmTBv_lHIJFoYdbPUaTuZW-NY6uvq9lZOyW4esCUZdcWI";
