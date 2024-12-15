import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useContent } from './Contentcontext'; // Adjust the path as needed
import { useRoyalty } from './royalitycontext'; // Adjust the path as needed
import { BigNumber } from '@ethersproject/bignumber';
import './ContentDisplay.css'

const ContentDisplay: React.FC = () => {
  const location = useLocation();
  const { fetchContentByURL } = useContent();
  const { buyRoyaltyByURL } = useRoyalty();
  const [content, setContent] = useState<any>(null);
  const [buying, setBuying] = useState(false);
  
  // Construct the full URL
  const baseURL = 'http://localhost:5173/';
  const fullURL = `${baseURL}${location.pathname.slice(1)}`; // Construct the full URL

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const result = await fetchContentByURL(fullURL);
        setContent(result);
      } catch (error) {
        console.error('Error fetching content:', error);
      }
    };

    fetchContent();
  }, [fullURL, fetchContentByURL]);

  const handleBuyRoyalty = async () => {
    if (!content?.url || !content?.price) {
      alert('Content URL or price is missing');
      return;
    }
    try {
      setBuying(true);
      const price = BigNumber.from(content.price); // Ensure the price is a BigNumber
      console.log("Buying royalty with value:", price.toString());
      await buyRoyaltyByURL(content.url, price); // Call the buyRoyaltyByURL function with BigNumber
      
    } catch (error) {
      console.error('Error buying royalty:', error);
      alert('Error buying royalty');
    } finally {
      setBuying(false);
    }
  };

  if (!content) {
    return <div>Loading...</div>; // Show a loading state while fetching
  }

  return (
    <div className='buypage'>
      <h1 className='buypagehead'>Content Details</h1>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '20px' }}>
        <tbody>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>ID</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{content?.id?.toString() || 'N/A'}</td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Owner</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{content?.owner || 'N/A'}</td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Timestamp</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              {content?.timeStamp ? new Date(Number(content.timeStamp) * 1000).toLocaleString() : 'N/A'}
            </td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Content Hash</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{content?.contentHash || 'N/A'}</td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Combined Hash</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{content?.combinedHash || 'N/A'}</td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>URL</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{content?.url || 'N/A'}</td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>Price</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>
              {content?.price !== undefined ? BigNumber.from(content.price).toString() : 'N/A'}
            </td>
          </tr>
          <tr>
            <th style={{ padding: '10px', border: '1px solid #ddd' }}>For Sale</th>
            <td style={{ padding: '10px', border: '1px solid #ddd' }}>{content?.forSale ? 'Yes' : 'No'}</td>
          </tr>
        </tbody>
      </table>
      {content?.forSale && (
        <button className='buttonmains' onClick={handleBuyRoyalty} disabled={buying}>
          {buying ? 'Processing...' : 'Buy Royalty'}
        </button>
      )}
    </div>
  );
};

export default ContentDisplay;
