# InfoBots
Bots that operate on the Blockchain



The issue arises because the totalUSDCSent and totalETHSent variables are being incremented with negative values. Instead, you should add the absolute values of amount0 and amount1 to the respective totals.


```
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

let totalUSDCReceived = ethers.BigNumber.from(0);
let totalUSDCSent = ethers.BigNumber.from(0);
let totalETHReceived = ethers.BigNumber.from(0);
let totalETHSent = ethers.BigNumber.from(0);

// Monitor each time there is a swap from the pool
async function main() {
    console.log("Monitoring swaps from the pool...\n");
    let count = 1;
    poolContract.on("Swap", (sender, recipient, amount0, amount1, sqrtPriceX96, liquidity, tick, event) => {
        try {
            console.log(`Swap event: https://etherscan.io/tx/${event.transactionHash}`);
            const amount0Human = ethers.utils.formatUnits(amount0 < 0 ? -amount0 : amount0, 6);
            const amount1Human = ethers.utils.formatUnits(amount1 < 0 ? -amount1 : amount1, 18);

            if (amount0 < 0) {
                console.log(RED_BOLD, `Contract Sent (%USDC): ${amount0Human}`, RESET);
                console.log(GREEN, `Contract received ($ETH): ${amount1Human}`, RESET);
                totalUSDCSent = totalUSDCSent.add(amount0.abs());
                totalETHReceived = totalETHReceived.add(amount1.abs());
            } else {
                console.log(GREEN_BOLD, `Contract Received ($USDC): ${amount0Human}`, RESET);
                console.log(RED, `Contract Sent ($ETH): ${amount1Human}`);
                totalUSDCReceived = totalUSDCReceived.add(amount0.abs());
                totalETHSent = totalETHSent.add(amount1.abs());
            }

            console.log();
            if (count == 3) {
                const totalUSDCReceivedHuman = parseFloat(ethers.utils.formatUnits(totalUSDCReceived, 6));
                const totalUSDCSentHuman = parseFloat(ethers.utils.formatUnits(totalUSDCSent, 6));
                const totalETHReceivedHuman = parseFloat(ethers.utils.formatUnits(totalETHReceived, 18));
                const totalETHSentHuman = parseFloat(ethers.utils.formatUnits(totalETHSent, 18));

                if (totalUSDCReceivedHuman > totalUSDCSentHuman) {
                    const netUSDCReceived = totalUSDCReceivedHuman - totalUSDCSentHuman;
                    console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
                    console.log(GREEN_BOLD, `┃ Total USDC received: ${netUSDCReceived.toFixed(12)} ┃`, RESET);
                    console.log("┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫");
                    console.log(GREEN_BOLD, `┃ Total ETH sent: ${totalETHSentHuman.toFixed(12)} ┃`, RESET);
                    console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
                } else {
                    const netUSDCSent = totalUSDCSentHuman - totalUSDCReceivedHuman;
                    console.log("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓");
                    console.log(RED_BOLD, `┃ Total USDC sent: ${netUSDCSent.toFixed(12)} ┃`, RESET);
                    console.log("┣━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┫");
                    console.log(RED_BOLD, `┃ Total ETH received: ${totalETHReceivedHuman.toFixed(12)} ┃`, RESET);
                    console.log("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛");
                }
                console.log();

                process.exit(0);
            }
            count++;
        } catch (error) {
            console.error("Error processing swap event:", error);
        }
    });
}

main().catch((error) => {
    console.error("Error in the main function:", error);
});
```

Explanation:
Use amount0.abs() and amount1.abs(): Ensure that the absolute values of amount0 and amount1 are added to the respective totals.
Format Output: Use toFixed(12) to format the final output to always have 12 digits.
Steps:
Update the code to correctly handle the arithmetic operations and format the final output.
Run the script using npx ts-node swapFromPool.ts.
This setup will correctly handle the arithmetic operations and display the summary of received and sent amounts before exiting.