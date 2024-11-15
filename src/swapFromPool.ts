import { ethers } from "ethers";
import { config } from "dotenv";

config();

// ANSI escape codes for colors
const RED_BOLD = "\x1b[1m\x1b[31m%s\x1b[0m";
const GREEN_BOLD = "\x1b[1m\x1b[32m%s\x1b[0m";
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const RESET = "\x1b[0m";

// ABI to fetch the events from the pool
const ABI = require("./abi.json");
const API_URL = process.env.ETH_MAINNET_ALCHEMY_API_URL as string;
const provider = new ethers.JsonRpcProvider(API_URL);
const poolAddress = "0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640";
const poolContract = new ethers.Contract(poolAddress, ABI, provider);

let totalUSDCReceived = ethers.toBigInt(0);
let totalUSDCSent = ethers.toBigInt(0);
let totalETHReceived = ethers.toBigInt(0);
let totalETHSent = ethers.toBigInt(0);

// Monitor each time there is a swap from the pool
async function main() {
    console.log("Monitoring swaps from the pool...\n");
    let count = 1;
    poolContract.on("Swap", (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, event) => {
        try {
            console.log(`Swap event: https://etherscan.io/tx/${event.log.transactionHash}`);
            console.log("Amout0: ", amount0);
            console.log("Amout1: ", amount1);
            const amount0Human = ethers.formatUnits(amount0 < 0 ? -amount0 : amount0, 6);
            const amount1Human = ethers.formatUnits(amount1 < 0 ? -amount1 : amount1, 18);
            if (amount0 < 0) {
                console.log(RED_BOLD, `Contract Sent (%USDC): ${amount0Human}`, RESET);
                console.log(GREEN, `Contract received ($ETH): ${amount1Human}`, RESET);
                totalUSDCSent += amount0;
                totalETHReceived += amount1;
            } else {
                console.log(GREEN_BOLD, `Contract Received ($USDC): ${amount0Human}`, RESET);
                console.log(RED, `Contract Sent ($ETH): ${amount1Human}`);
                totalUSDCReceived += amount0;
                totalETHSent += amount1;
            }
            console.log();
            if (count == 3) {

                const totalUSDCReceivedHuman = parseFloat(ethers.formatUnits(totalUSDCReceived, 6));
                const totalUSDCSentHuman = parseFloat(ethers.formatUnits(totalUSDCSent, 6));
                const totalETHReceivedHuman = parseFloat(ethers.formatUnits(totalETHReceived, 18));
                const totalETHSentHuman = parseFloat(ethers.formatUnits(totalETHSent, 18));

                if (totalUSDCReceivedHuman > totalUSDCSentHuman) {
                    const netUSDCReceived = totalUSDCReceivedHuman - totalUSDCSentHuman;
                    const netETHSent = totalETHSentHuman - totalETHReceivedHuman;
                    console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
                    console.log(GREEN_BOLD, `┃ Total USDC received: ${netUSDCReceived} ┃`, RESET);
                    console.log("┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫");
                    console.log(GREEN_BOLD, `┃ Total ETH sent: ${netETHSent} ┃`, RESET);
                    console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
                } else {
                    const netUSDCSent = totalUSDCSentHuman - totalUSDCReceivedHuman;
                    const netETHReceived = totalETHReceivedHuman - totalETHSentHuman;
                    console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
                    console.log(RED_BOLD, `┃ Total USDC sent: ${netUSDCSent} ┃`, RESET);
                    console.log("┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫");
                    console.log(RED_BOLD, `┃ Total ETH received: ${netETHReceived} ┃`, RESET);
                    console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
                }
                console.log();
                // Only show the difference between the total sent and received
                // If received more USDC only show the difference received - sent and vice versa
                // Same for ETH)
                // console.log(GREEN_BOLD, "Total USDC received:", totalUSDCReceivedHuman);
                // console.log(RED_BOLD, "Total USDC sent:", totalUSDCSentHuman);
                // console.log("Total ETH received:", totalETHReceivedHuman);
                // console.log("Total ETH sent:", totalETHSentHuman);

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