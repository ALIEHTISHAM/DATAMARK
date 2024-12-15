import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { 
  initRoyaltyContract, 
  listRoyalty as listRoyaltyService, 
  buyRoyaltyByURL as buyRoyaltyByURLService, 
  getOwnerDetailsWithRoyalties, 
  getRoyaltiesBoughtByUser 
} from '../royalityservice'; // Ensure correct import paths
import { useAuth } from './AuthContext';
import { connectMetaMask } from './metamaskAuth';
import { BigNumber } from '@ethersproject/bignumber';
import { hashEmail } from './hashUtils';

interface Royalty {
  contentIDs: number[];
  buyerAddresses: string[]; // Used for owner details with royalties
  owners: string[]; // Used for royalties bought by user
  timestamps: number[];
  royaltyPrices: BigNumber[];
}

interface RoyaltyContextProps {
  royalties: Royalty;
  setRoyalties: React.Dispatch<React.SetStateAction<Royalty>>;
  reconnectWallet: () => Promise<void>;
  walletAddress: string | null;
  listRoyalty: (contentID: number) => Promise<void>;
  buyRoyaltyByURL: (contentURL: string, value: BigNumber) => Promise<void>;
  fetchOwnerDetailsWithRoyalties: () => Promise<void>;
  fetchRoyaltiesBoughtByUser: () => Promise<void>;
}

const RoyaltyContext = createContext<RoyaltyContextProps | undefined>(undefined);

export const useRoyalty = () => {
  const context = useContext(RoyaltyContext);
  if (!context) throw new Error('useRoyalty must be used within a RoyaltyProvider');
  return context;
};

export const RoyaltyProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { walletAddress, setWalletAddress, email } = useAuth();
  const [royalties, setRoyalties] = useState<Royalty>({
    contentIDs: [],
    buyerAddresses: [], // Initialize the buyerAddresses array
    owners: [], // Initialize the owners array
    timestamps: [],
    royaltyPrices: []
  });

  useEffect(() => {
    const init = async () => {
      try {
        await initRoyaltyContract();
      } catch (error) {
        console.error('Error initializing royalty contract:', error);
      }
    };
    init();
  }, []);

  useEffect(() => {
    const storedWalletAddress = localStorage.getItem('walletAddress');
    if (storedWalletAddress) {
      setWalletAddress(storedWalletAddress);
    }

    if (email) {
      const computedEmailHash = hashEmail(email);
      sessionStorage.setItem('emailHash', computedEmailHash);
    }
  }, [setWalletAddress, email]);

  const reconnectWallet = async () => {
    try {
      const address = await connectMetaMask();
      setWalletAddress(address);
      localStorage.setItem('walletAddress', address);
    } catch (error) {
      console.error('Error reconnecting wallet:', error);
    }
  };

  const listRoyaltyHandler = async (contentID: number) => {
    const userHash = sessionStorage.getItem('emailHash');
    if (!userHash) {
      alert('User hash not found in sessionStorage');
      return;
    }

    try {
      await listRoyaltyService(contentID, userHash);
      alert('Royalty listed successfully!');
    } catch (error) {
      console.error('Error listing royalty:', error);
      alert('Error listing royalty');
    }
  };

  const buyRoyaltyByURLHandler = async (contentURL: string, value: BigNumber) => {
    const userHash = sessionStorage.getItem('emailHash');
    if (!userHash) {
      alert('User hash not found in sessionStorage');
      return;
    }

    if (!walletAddress) {
      alert('Wallet not connected');
      return;
    }

    try {
      await buyRoyaltyByURLService(contentURL, userHash, value);
      alert('Royalty purchased successfully!');
    } catch (error) {
      console.error('Error buying royalty:', error);
      alert('Error buying royalty');
    }
  };

  const fetchOwnerDetailsWithRoyalties = async () => {
    const userHash = sessionStorage.getItem('emailHash');
    if (!userHash) {
      alert('User hash not found in sessionStorage');
      return;
    }

    try {
      const details = await getOwnerDetailsWithRoyalties(userHash);

      const transformedDetails: Royalty = {
        contentIDs: details.contentIDs || [],
        buyerAddresses: details.buyerAddresses || [], // Use buyerAddresses
        owners: [], // Set empty owners array
        timestamps: details.timestamps || [],
        royaltyPrices: details.royaltyPrices.map((price: any) => BigNumber.from(price))
      };

      setRoyalties(transformedDetails);
    } catch (error) {
      console.error('Error fetching owner details with royalties:', error);
    }
  };

  const fetchRoyaltiesBoughtByUser = async () => {
    const userHash = sessionStorage.getItem('emailHash');
    if (!userHash) {
      alert('User hash not found in sessionStorage');
      return;
    }

    try {
      const details = await getRoyaltiesBoughtByUser();

      const transformedRoyalties: Royalty = {
        contentIDs: details.contentIDs || [],
        buyerAddresses: [], // Set empty buyerAddresses array
        owners: details.owners || [], // Use owners
        timestamps: details.timestamps || [],
        royaltyPrices: details.prices.map((price: any) => BigNumber.from(price)),
      };

      setRoyalties(transformedRoyalties);
    } catch (error) {
      console.error('Error fetching royalties bought by user:', error);
    }
  };

  return (
    <RoyaltyContext.Provider
      value={{
        royalties,
        setRoyalties,
        reconnectWallet,
        walletAddress,
        listRoyalty: listRoyaltyHandler,
        buyRoyaltyByURL: buyRoyaltyByURLHandler,
        fetchOwnerDetailsWithRoyalties,
        fetchRoyaltiesBoughtByUser,
      }}
    >
      {children}
    </RoyaltyContext.Provider>
  );
};
