import { ethers, parseUnits } from "ethers";
import { config } from "dotenv";

config();

const API_URL = process.env.ETH_MAINNET_ALCHEMY_API_URL as string;
const provider = new ethers.JsonRpcProvider(API_URL);

const contractABI = JSON.parse(process.env.ABI as string);
const contractAddress = process.env.USDC_CONTRACT_ADDRESS_ETH_MAINNET as string;
const contract = new ethers.Contract(contractAddress, contractABI, provider);

const TRANSFER_THRESHOLD = ethers.parseUnits("100000", 6); // 100 USDC
async function main() {
    try {

        const name = await contract.name();
        console.log("Token name:", name);

        contract.on("Transfer", (from, to, value, event) => {
            try {
                if (value >= TRANSFER_THRESHOLD) {
                    console.log("Transfer event:");
                    console.log("From:", from);
                    console.log("To:", to);
                    console.log("Value:", value.toString());
                    console.log("Tx hash:", event.log.transactionHash);
                    console.log(`Tx URL: https://etherscan.io/tx/${event.log.transactionHash}`);
                }
            } catch (error) {
                console.error("Error processing transfer event:", error);
            }
        });
    } catch (error) {
        console.error("Error in main function:", error);
    }
}

main().catch((error) => {
    console.error("Error in the main function:", error);
});