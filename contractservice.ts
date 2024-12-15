// src/contractService.ts

import { ethers } from 'ethers';
import contractABI from './contractABI.json';

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = "0x3a037351f496E7edC1115c4924379Fde550F9775";

let provider: ethers.BrowserProvider;
let contract: ethers.Contract;

export const initContract = async () => {
  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    contract = new ethers.Contract(contractAddress, contractABI, signer);
  } else {
    throw new Error("No Ethereum provider found");
  }
};

export const registerUser = async (userHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    const tx = await contract.registeruser(userHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const updateUserProfile = async (newUserHash: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    const tx = await contract.updateUserProfile(newUserHash);
    await tx.wait();
    return tx;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getUser = async (userAddress: string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    const user = await contract.getUser(userAddress);
    return user;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const authenticateUser = async (userAddress: string, userEmail:string) => {
  if (!contract) throw new Error("Contract not initialized");
  try {
    const isAuthenticated = await contract.authenticateUser(userAddress,userEmail);
    return isAuthenticated;
  } catch (error) {
    console.error(error);
    throw error;
  }
};