// This program monitors the swaps from a pool and displays infos in the terminal
// What can you change ? 
// 1-pool contract
// 2- the number of swaps to monitor

import { ethers } from "ethers";
import { config } from "dotenv";
import { argv } from "process";


config();

// ANSI escape codes for colors
const BOLD = "\x1b[1m";
const RED_BOLD = "\x1b[1m\x1b[31m%s\x1b[0m";
const GREEN_BOLD = "\x1b[1m\x1b[32m%s\x1b[0m";
const YELLOW_BOLD = "\x1b[1m\x1b[33m%s\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

// ABI to fetch the events from the pool 
const ABI = require("./abi-pool.json");
const ERC20_ABI = require("./abi-erc20.json");
const API_URL = process.env.ETH_MAINNET_ALCHEMY_API_URL as string;
const provider = new ethers.JsonRpcProvider(API_URL);
const poolAddress = process.env.UNISWAP_V3_POOL_ADDRESS_ETH_USDC as string;
const poolContract = new ethers.Contract(poolAddress, ABI, provider);

let totalUSDCReceived = ethers.toBigInt(0);
let totalUSDCSent = ethers.toBigInt(0);
let totalETHReceived = ethers.toBigInt(0);
let totalETHSent = ethers.toBigInt(0);

function absBigInt(value: bigint): bigint {
    return value < 0 ? -value : value;
}

async function getTokenSymbol(tokenAddress: string): Promise<string> {
    const tokenContract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return await tokenContract.symbol();
}

async function displayPoolInfo(numberOfSwaps: number) {
    const token0Address = await poolContract.token0();
    const token1Address = await poolContract.token1();
    const token0Symbol = await getTokenSymbol(token0Address);
    const token1Symbol = await getTokenSymbol(token1Address);

    const len = 60;
    const tok0len = token0Symbol.length;
    const tok1len = token1Symbol.length;
    const numSwaplen = numberOfSwaps.toString().length;
    const fixedLen = "┃ Monitoring [] swaps from / ┃".length;
    const numSpaces = len - tok0len - tok1len - fixedLen - numSwaplen;
    const spacesForMsg = " ".repeat(numSpaces);

    console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    console.log(`┃ Monitoring [${numberOfSwaps}] swaps from ${token0Symbol}/${token1Symbol}${spacesForMsg} ┃`);
    console.log(`┃ Pool Address: ${poolAddress} ┃`);
    console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛\n");
}

async function displaySummary(count: number) {
    const count_length = count.toString().length;
    const fixedPartsLength = "┃ Summary of the last  swaps ┃".length;
    const totalLength = 45;
    const spacesNeeded = totalLength - fixedPartsLength - count_length;
    const spaces = " ".repeat(spacesNeeded);
    console.log("\n ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
    console.log(BOLD, `┃ Summary of the last ${count} swaps${spaces} ┃`, RESET);
    console.log(" ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
    if (totalUSDCReceived > totalUSDCSent) {
        const totalUSDCReceivedHuman = ethers.formatUnits((totalUSDCReceived - totalUSDCSent), 6);
        const totalETHSentHuman = ethers.formatUnits((totalETHSent - totalETHReceived), 18);

        console.log(GREEN_BOLD, `Total USDC received: ${totalUSDCReceivedHuman}`, RESET);
        console.log(`Total ETH sent: ${totalETHSentHuman}`);
    } else {
        const totalUSDCSentHuman = ethers.formatUnits(totalUSDCSent - totalUSDCReceived, 6);
        const totalETHReceivedHuman = ethers.formatUnits(totalETHReceived - totalETHSent, 18);
        console.log(RED_BOLD, `Total USDC sent: ${totalUSDCSentHuman}`, RESET);
        console.log(RED, `Total ETH received: ${totalETHReceivedHuman}`, RESET);
    }
}
function contractSentUSDC(amount0Human: string, amount1Human: string, amount0: bigint, amount1: bigint, event: any) {
    console.log(RED_BOLD, `Contract Sent(% USDC): ${amount0Human}`, RESET);
    console.log(RED, `Contract received($ETH): ${amount1Human}`, RESET);
    totalUSDCSent += absBigInt(amount0);
    totalETHReceived += absBigInt(amount1);
    console.log(`Tx URL: https://etherscan.io/tx/${event.log.transactionHash}`);
    console.log();
}

function contractReceivedUSDC(amount0Human: string, amount1Human: string, amount0: bigint, amount1: bigint, event: any) {
    console.log(GREEN_BOLD, `Contract Received($USDC): ${amount0Human}`, RESET);
    console.log(GREEN, `Contract Sent($ETH): ${amount1Human}`, RESET);
    totalUSDCReceived += absBigInt(amount0);
    totalETHSent += absBigInt(amount1);
    console.log(`Tx URL: https://etherscan.io/tx/${event.log.transactionHash}`);
    console.log();
}

async function main() {
    let maxCount = parseInt(process.argv[2], 10) || 1;
    if (argv.length < 3) {
        console.log(BOLD, "\nYou did not provide the number of swaps to monitor. By default we will only catch the next swap from this pool.", RESET);
        console.log(GREEN, "Usage: npx ts-node swapFromPools.ts <number_of_swaps_to_monitor>\n\n", RESET);
    }
    await displayPoolInfo(maxCount);

    let count = 1;

    poolContract.on("Swap", (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, event) => {
        try {
            const amount0Human = ethers.formatUnits(amount0 < 0 ? -amount0 : amount0, 6);
            const amount1Human = ethers.formatUnits(amount1 < 0 ? -amount1 : amount1, 18);
            if (amount0 < 0) {
                contractSentUSDC(amount0Human, amount1Human, amount0, amount1, event);
            } else {
                contractReceivedUSDC(amount0Human, amount1Human, amount0, amount1, event);
            }

            if (maxCount != 1 && count == maxCount) {
                displaySummary(count);
                process.exit(0);
            }
            count++;
        }
        catch (error) {
            console.error("Error processing swap event:", error);
        }
    });
}

main().catch((error) => {
    console.error("Error in the main function:", error);
});