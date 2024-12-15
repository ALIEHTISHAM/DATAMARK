import { BigNumber } from '@ethersproject/bignumber';
import { ethers } from 'ethers';
import RoyaltyManagementABI from './royalityABI.json'; // Replace with the actual path to your ABI

declare global {
  interface Window {
    ethereum: any;
  }
}

const royaltyManagementAddress = "0xB80129440c9576098506eCfb58B2608fEfb019A0"; // Replace with your deployed contract address

let provider: ethers.BrowserProvider;
let contract: ethers.Contract;

export const initRoyaltyContract = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(royaltyManagementAddress, RoyaltyManagementABI, signer);
  } else {
    throw new Error("No Ethereum provider found");
  }
};

export const listRoyalty = async (contentID: number, userHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Listing royalty for contentID:", contentID, "with userHash:", userHash);
    const tx = await contract.ListRoyalty(contentID, userHash);
    await tx.wait();
    return tx; // Return transaction receipt or any relevant data
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error listing royalty:", error.message);
    } else {
      console.error("Error listing royalty:", error);
    }
    throw error;
  }
};

export const buyRoyaltyByURL = async (contentURL: string, userHash: string, value: BigNumber) => {
  if (!contract) throw new Error("Contract not initialized");

  try {
    // Ensure value is a BigNumber and properly formatted
    if (!BigNumber.isBigNumber(value)) {
      throw new Error("Invalid BigNumber value");
    }

    console.log("Buying royalty by URL with contentURL:", contentURL, "and userHash:", userHash, "value:", value.toString());

    // Make the transaction call
    const tx = await contract.buyRoyaltyByURL(contentURL, userHash, {
      value: value.toString() // Ensure value is sent as a string
    });

    await tx.wait(); // Wait for the transaction to be mined

    console.log("Transaction successful:", tx);
    return tx; // Return transaction receipt or any relevant data
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error buying royalty by URL:", error.message);
    } else {
      console.error("Error buying royalty by URL:", error);
    }
    throw error;
  }
};

export const getOwnerDetailsWithRoyalties = async (userHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Fetching owner details with royalties for userHash:", userHash);
    const result = await contract.ownerDetailsWithRoyalties(userHash);

    // Destructure the result and handle each type correctly
    const [contentIDs, buyerAddresses, timestamps, royaltyPrices] = result;

    // Convert BigNumber arrays to arrays of numbers
    const toNumberArray = (arr: BigNumber[]) => arr.map(item => {
      if (BigNumber.isBigNumber(item)) {
        return item.toNumber();
      } else {
        console.warn('Item is not a BigNumber:', item);
        return Number(item); // Fallback to convert the item to a number
      }
    });

    return {
      contentIDs: toNumberArray(contentIDs), // Convert BigNumber[] to number[]
      buyerAddresses, // These are already addresses (strings)
      timestamps: toNumberArray(timestamps), // Convert BigNumber[] to number[]
      royaltyPrices: toNumberArray(royaltyPrices) // Convert BigNumber[] to number[]
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching owner details with royalties:", error.message);
    } else {
      console.error("Error fetching owner details with royalties:", error);
    }
    throw error;
  }
};

export const getRoyaltiesBoughtByUser = async () => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Fetching royalties bought by user");
    const result = await contract.royaltiesBoughtByUser();

    // Destructure the result and handle each type correctly
    const [owners, contentIDs, prices, timestamps] = result;

    // Convert BigNumber arrays to arrays of numbers
    const toNumberArray = (arr: BigNumber[]) => arr.map(item => {
      if (BigNumber.isBigNumber(item)) {
        return item.toNumber();
      } else {
        console.warn('Item is not a BigNumber:', item);
        return Number(item); // Fallback to convert the item to a number
      }
    });

    return {
      owners, // These are already addresses (strings)
      contentIDs: toNumberArray(contentIDs), // Convert BigNumber[] to number[]
      prices: toNumberArray(prices), // Convert BigNumber[] to number[]
      timestamps: toNumberArray(timestamps) // Convert BigNumber[] to number[]
    };
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Error fetching royalties bought by user:", error.message);
    } else {
      console.error("Error fetching royalties bought by user:", error);
    }
    throw error;
  }
};
