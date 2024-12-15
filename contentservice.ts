import { ethers } from 'ethers';
import contentManagementABI from './contentABI.json'; // Replace with the actual path to your ABI

declare global {
  interface Window {
    ethereum: any;
  }
}

const contentManagementAddress = "0x8d293D8dA79c39A9AAD97E8d00B6C6D2Db3Dd6D9"; // Replace with your deployed contract address

let provider: ethers.BrowserProvider;
let contract: ethers.Contract;

export const initContentContract = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(contentManagementAddress, contentManagementABI, signer);
  } else {
    throw new Error("No Ethereum provider found");
  }
};

export const uploadContent = async (
  contentHash: string,
  combinedHash: string,
  contentURL: string,
  forSale: boolean,
  price: number,
  emailHash: string // Add emailHash parameter
) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Uploading content with parameters:", {
      contentHash,
      combinedHash,
      contentURL,
      forSale,
      price,
      emailHash
    });
    const tx = await contract.uploadContent(contentHash, combinedHash, contentURL, forSale, price, emailHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error("Error uploading content:", error);
    throw error;
  }
};

export const getContentOfOwner = async (emailHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Fetching content of owner with emailHash:", emailHash);
    const contents = await contract.getContentOfOwner(emailHash);
    return contents.map((content: any) => ({
      id: content.contentID,
      owner: content.owner,
      timeStamp: content.timeStamp,
      contentHash: content.contentHash,
      combinedHash: content.combinedHash,
      url: content.contentURL,
      price: content.price,
      forSale: content.forSale,
    }));
  } catch (error) {
    console.error("Error fetching content of owner:", error);
    throw error;
  }
};

export const getContentByHash = async (contentHash: string, emailHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Fetching content by hash with contentHash:", contentHash, "and emailHash:", emailHash);
    const content = await contract.getContentByHash(contentHash, emailHash);
    return {
      id: content.contentID,
      owner: content.owner,
      timeStamp: content.timeStamp,
      contentHash: content.contentHash,
      combinedHash: content.combinedHash,
      url: content.contentURL,
      price: content.price,
      forSale: content.forSale,
    };
  } catch (error) {
    console.error("Error fetching content by hash:", error);
    throw error;
  }
};

export const getContentByURLs = async (contentURL: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Fetching content by URL with contentURL:");
    const content = await contract.getContentByURLs(contentURL);
    return {
      id: content.contentID,
      owner: content.owner,
      timeStamp: content.timeStamp,
      contentHash: content.contentHash,
      combinedHash: content.combinedHash,
      url: content.contentURL,
      price: content.price,
      forSale: content.forSale,
    };
  } catch (error) {
    console.error("Error fetching content by URL:", error);
    throw error;
  }
};

export const getContentIDsbyAddress = async (owner: string, emailHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    console.log("Fetching content IDs by address with owner:", owner, "and emailHash:", emailHash);
    const contentIDs = await contract.getContentIDsbyAddress(owner, emailHash);
    return contentIDs; // Returns an array of uint representing content IDs
  } catch (error) {
    console.error("Error fetching content IDs by address:", error);
    throw error;
  }
};
