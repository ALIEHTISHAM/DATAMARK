import { keccak256, toUtf8Bytes } from 'ethers';

// Hashing function for email using ethers v6
export const hashEmail = (email: string): string => {
  return keccak256(toUtf8Bytes(email));
};

// Hashing function for password using ethers v6
export const hashPassword = (password: string): string => {
  return keccak256(toUtf8Bytes(password));
};

// Hashing function for content using ethers v6
export const hashContent = (content: string): string => {
  return keccak256(toUtf8Bytes(content));
};

// Hashing function to combine content hash and URL using ethers v6
export const hashCombined = (contentHash: string, contentURL: string): string => {
  return keccak256(toUtf8Bytes(contentHash + contentURL));
};
