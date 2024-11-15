import { ethers } from "ethers";
import { config } from "dotenv";

config();

const ALCHEMY_API_URL = process.env.ALCHEMY_API_URL as string;
const CONTRACT_ADDRESS = '0x6982508145454ce325ddbe47a25d4ec3d2311933'; // Replace with your contract address
const ABI = JSON.parse(process.env.ABI_PEPE_COIN as string);

const provider = new ethers.JsonRpcProvider(ALCHEMY_API_URL);
const contract = new ethers.Contract(CONTRACT_ADDRESS, ABI, provider);

async function checkToken() {
    try {
        const name = await contract.name();
        const symbol = await contract.symbol();
        const decimals = await contract.decimals();
        const totalSupply = await contract.totalSupply();
        let myBalance;
        try {
            const myAddress = ethers.getAddress("0x5cCdC4A43942235b2c79B37520BE9b9b189Cf44d");
            myBalance = await contract.balanceOf(myAddress);
        } catch (error) {
            console.error("Error fetching balance");
        }
        console.log(`Token name: ${name}`);
        console.log(`Token symbol: ${symbol}`);
        console.log(`Token decimals: ${decimals}`);
        console.log(`Token total supply: ${totalSupply}`);
        console.log(`\nMy balance: ${myBalance}`);
    } catch (error) {
        console.error("Error fetching contract data:", error);
    }
}

checkToken();