import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  initContentContract, 
  uploadContent, 
  getContentOfOwner, 
  getContentByHash, 
  getContentByURLs, 
  getContentIDsbyAddress 
} from '../contentservice';
import { hashContent, hashCombined, hashEmail } from './hashUtils';
import { useAuth } from './AuthContext';
import { connectMetaMask } from './metamaskAuth';

interface ContentContextProps {
  uploadedFiles: File[];
  selectedFile: File | null;
  setSelectedFile: React.Dispatch<React.SetStateAction<File | null>>;
  handleFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  handleDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  handleUploadFile: () => Promise<void>;
  handleDeleteFile: (file: File) => void;
  contentURL: string;
  setContentURL: React.Dispatch<React.SetStateAction<string>>;
  reconnectWallet: () => Promise<void>;
  walletAddress: string | null;
  forSale: boolean;
  setForSale: React.Dispatch<React.SetStateAction<boolean>>;
  price: number;
  setPrice: React.Dispatch<React.SetStateAction<number>>;
  emailHash: string | null;
  fetchContentOfOwner: () => Promise<void>;
  fetchContentByHash: (contentHash: string) => Promise<any>;
  fetchContentByURL: (contentURL: string) => Promise<any>;
  fetchContentIDsByAddress: () => Promise<void>;
  ownerContent: any[]; // Adjust type as needed
  contractInitialized: boolean; // Added to track contract initialization
  contentHash: string;
}

const ContentContext = createContext<ContentContextProps | undefined>(undefined);

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) throw new Error('useContent must be used within a ContentProvider');
  return context;
};

export const ContentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { walletAddress, email, setWalletAddress } = useAuth();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [contentURL, setContentURL] = useState('');
  const [contentHash, setContentHash] = useState('');
  const [combinedHash, setCombinedHash] = useState('');
  const [forSale, setForSale] = useState(false);
  const [price, setPrice] = useState(0);
  const [ownerContent, setOwnerContent] = useState<any[]>([]);
  const [emailHash, setEmailHash] = useState<string | null>(null);
  const [contractInitialized, setContractInitialized] = useState(false); // Track initialization status

  useEffect(() => {
    const init = async () => {
      try {
        await initContentContract();
        setContractInitialized(true);
      } catch (error) {
        console.error('Error initializing content contract:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    const storedEmailHash = sessionStorage.getItem('emailHash');
    if (storedEmailHash) {
      setEmailHash(storedEmailHash);
    } else if (email) {
      const computedEmailHash = hashEmail(email);
      setEmailHash(computedEmailHash);
      sessionStorage.setItem('emailHash', computedEmailHash);
    }
  }, [setWalletAddress, email]);

  useEffect(() => {
    if (walletAddress) {
      localStorage.setItem('walletAddress', walletAddress);
    }
  }, [walletAddress]);

  useEffect(() => {
    if (email) {
      const computedEmailHash = hashEmail(email);
      setEmailHash(computedEmailHash);
      sessionStorage.setItem('emailHash', computedEmailHash);
    }
  }, [email]);

  const reconnectWallet = async () => {
    try {
      const address = await connectMetaMask();
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
    } catch (error) {
      console.error('Error reconnecting wallet:', error);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      readAndHashFile(event.target.files[0]);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) {
      setSelectedFile(event.dataTransfer.files[0]);
      readAndHashFile(event.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const BASE_URL = 'http://localhost:5173/';

  const generateContentURL = (hash: string): string => {
    return `${BASE_URL}${hash}`;
  };

  const readAndHashFile = (file: File) => {
    const reader = new FileReader();

    reader.onload = () => {
      const content = reader.result as string;
      const contentHash = hashContent(content);
      const generatedURL = generateContentURL(contentHash);
      const combinedHash = hashCombined(contentHash, emailHash ?? '');
      setContentHash(contentHash);
      setCombinedHash(combinedHash);
      setContentURL(generatedURL);
      sessionStorage.setItem('uploadedContent', content);
    };

    reader.readAsText(file);
  };

  const handleUploadFile = async () => {
    await reconnectWallet();
    if (walletAddress && contentHash && combinedHash && contentURL && emailHash) {
      setUploading(true);
      try {
        await uploadContent(contentHash, combinedHash, contentURL, forSale, price, emailHash);
        setUploadedFiles([...uploadedFiles, selectedFile!]);
        setSelectedFile(null);
        setForSale(false);
        setPrice(0);
        alert('File uploaded successfully!');
      } catch (error) {
        console.error('Error uploading content:', error);
        alert('Error uploading content already exists');
      } finally {
        setUploading(false);
      }
    } else {
      console.log('Missing parameters:', { walletAddress, contentHash, combinedHash, contentURL, emailHash });
    }
  };

  const handleDeleteFile = (file: File) => {
    setUploadedFiles(uploadedFiles.filter((f) => f !== file));
  };

  const fetchContentOfOwner = async () => {
    if (emailHash) {
      try {
        const contents = await getContentOfOwner(emailHash);
        setOwnerContent(contents);
      } catch (error) {
        console.error('Error fetching content of owner:', error);
      }
    } else {
      console.error('Email hash is not set');
    }
  };

  const fetchContentByHash = async (contentHash: string): Promise<any> => {
    if (!emailHash) {
      console.error('Email hash is not set');
      return null; // Return early if email hash is not set
    }
  
    try {
      const content = await getContentByHash(contentHash, emailHash);
      setOwnerContent([content]); // Update state with the fetched content
      return content; // Return the fetched content for immediate use
    } catch (error) {
      console.error('Error fetching content by hash:', error);
      return null; // Return null if there’s an error
    }
  };
  

  const fetchContentByURL = async (contentURL: string): Promise<any> => {
  
    if (emailHash || contractInitialized) {
      try {
        const content = await getContentByURLs(contentURL);
        setOwnerContent([content]);
        return content; // Ensure this returns the content
      } catch (error) {
        console.error('Error fetching content by URL:', error);
        return undefined; // Handle error case
      }
    } else {
      console.error('Email hash or contract is not initialized');
      return undefined; // Handle missing emailHash or uninitialized contract case
    }
  };

  const fetchContentIDsByAddress = async () => {
  
    if (walletAddress && emailHash) {
      try {
        const contentIDs = await getContentIDsbyAddress(walletAddress, emailHash);
        console.log('Fetched Content IDs:', contentIDs);
        setOwnerContent(contentIDs);
      } catch (error) {
        console.error('Error fetching content IDs by address:', error);
      }
    } else {
      console.error('Wallet address or email hash is not set');
    }
  };

  return (
    <ContentContext.Provider
      value={{
        uploadedFiles,
        selectedFile,
        setSelectedFile,
        handleFileChange,
        handleDrop,
        handleDragOver,
        handleUploadFile,
        handleDeleteFile,
        contentURL,
        setContentURL,
        reconnectWallet,
        walletAddress,
        forSale,
        setForSale,
        price,
        setPrice,
        emailHash,
        fetchContentOfOwner,
        fetchContentByHash,
        fetchContentByURL,
        fetchContentIDsByAddress,
        ownerContent,
        contractInitialized,
        contentHash,
      }}
    >
      {children}
    </ContentContext.Provider>
  );
};
