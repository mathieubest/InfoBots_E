import { ethers } from "ethers";
import { config } from "dotenv";
import { error } from "console";
import { resolve } from "path";

config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL as string;
const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
const WALLET = '0x5cCdC4A43942235b2c79B37520BE9b9b189Cf44d'; // Replace with your wallet address
const ETH_USD_ADDRESS = '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419'; // Chainlink ETH/USD address
const ABI = JSON.parse(process.env.CHAINLINK_ETH_USD_ABI as string);

const priceFeed = new ethers.Contract(ETH_USD_ADDRESS, ABI, provider);

const getEthUsdPrice = async (): Promise<number> => {
    const latestRoundData = await priceFeed.latestRoundData();
    const price = Number(latestRoundData.answer) / 1e8;
    return price;
}

async function fetchEthData() {
    try {
        const ethUsdPrice = await getEthUsdPrice();
        console.log(`ETH/USD price: ${ethUsdPrice}`);

        const balance = await provider.getBalance(WALLET);
        console.log(`Balance: ${ethers.formatEther(balance)} ETH`);

        // Convert ETH to USD
        const balanceInEth = ethers.formatEther(balance);
        const balanceInUsd = parseFloat(balanceInEth) * ethUsdPrice;
        console.log(`Balance in USD: ${balanceInUsd} $`);
    } catch (error) {
        console.error("Error fetching balance: ", error);
    }
}

fetchEthData();