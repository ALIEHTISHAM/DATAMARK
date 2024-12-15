import React, { useState, useEffect } from 'react';
import { useContent } from './Contentcontext';
import { useRoyalty } from './royalitycontext';


const MyContent: React.FC = () => {
  const {
    fetchContentOfOwner,
    fetchContentByHash,
    fetchContentByURL,
    fetchContentIDsByAddress,
    ownerContent,
  } = useContent();

  const {
    listRoyalty,
    fetchOwnerDetailsWithRoyalties,
    fetchRoyaltiesBoughtByUser,
    royalties,
  } = useRoyalty();

  const [contentHash, setContentHash] = useState<string>('');
  const [contentURL, setContentURL] = useState<string>('');
  const [contentID, setContentID] = useState<number | ''>('');
  const [isFetchingIDs, setIsFetchingIDs] = useState<boolean>(false);
  const [activeSection, setActiveSection] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  useEffect(() => {
      const canvas = document.getElementById('particlecanvas') as HTMLCanvasElement;
      const ctx = canvas.getContext('2d');
      const particles: any[] = [];
  
      // Set canvas size
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
  
      // Handle window resizing
      window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      });
  
      // Particle class
      class Particle {
        x: number;
        y: number;
        size: number;
        speedX: number;
        speedY: number;
        color: string;
  
        constructor(x: number, y: number) {
          this.x = x;
          this.y = y;
          this.size = Math.random() * 5 + 1;
          this.speedX = Math.random() * 2 - 1; // Random horizontal speed
          this.speedY = Math.random() * 2 - 1; // Random vertical speed
          this.color = 'rgba(255, 255, 255, 0.8)';
        }
  
        // Update particle position
        update() {
          this.x += this.speedX;
          this.y += this.speedY;
  
          // Create a fading effect
          this.size *= 0.98; // Shrinks the particle slowly
        }
  
        // Draw particle on canvas
        draw() {
          if (ctx) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
          }
        }
      }
  
      // Add new particles
      const createParticles = (event: MouseEvent) => {
        const numberOfParticles = 10; // Number of particles to be generated
        for (let i = 0; i < numberOfParticles; i++) {
          const particle = new Particle(event.x, event.y);
          particles.push(particle);
        }
      };
  
      // Animation loop
      const animateParticles = () => {
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height); // Clear the canvas
          particles.forEach((particle, index) => {
            particle.update();
            particle.draw();
  
            // Remove particle if it fades out
            if (particle.size < 0.3) {
              particles.splice(index, 1);
            }
          });
        }
        requestAnimationFrame(animateParticles); // Keep animating
      };
  
      // Listen for mouse movement
      window.addEventListener('mousemove', createParticles);
  
      animateParticles();
  
      // Cleanup event listener
      return () => {
        window.removeEventListener('mousemove', createParticles);
      };
    }, []);
  

  useEffect(() => {
    const storedEmailHash = sessionStorage.getItem('emailHash');
    if (!storedEmailHash) {
      alert('User hash not found in sessionStorage');
    }
  }, []);
  const copyToClipboard = (content: string, cellIdentifier: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessage(`Copied: ${content}`);
    setCopiedCell(cellIdentifier);

    setTimeout(() => {
      setCopiedMessage(null);
      setCopiedCell(null);
    }, 2000); // Reset after 2 seconds
  };

  const handleFetchContentOfOwner = async () => {
    setIsFetchingIDs(false);
    setActiveSection('ownerContent');
    await fetchContentOfOwner();
  };

  const handleFetchContentByHash = async () => {
    setIsFetchingIDs(false);
    if (contentHash) {
      setActiveSection('contentByHash');
      await fetchContentByHash(contentHash);
    } else {
      alert('Please enter a content hash');
    }
  };

  const handleFetchContentByURL = async () => {
    setIsFetchingIDs(false);
    if (contentURL) {
      setActiveSection('contentByURL');
      await fetchContentByURL(contentURL);
    } else {
      alert('Please enter a content URL');
    }
  };

  const handleFetchContentIDsByAddress = async () => {
    setIsFetchingIDs(true);
    setActiveSection('contentIDs');
    await fetchContentIDsByAddress();
  };

  const handleListRoyalty = async () => {
    const userHash = sessionStorage.getItem('emailHash');
    if (!userHash) {
      alert('User hash not found in sessionStorage');
      return;
    }

    if (contentID !== '' && !isNaN(contentID)) {
      try {
        await listRoyalty(contentID);
      
      } catch (error) {
        console.error('Error listing royalty:', error);
        alert('Error listing royalty');
      }
    } else {
      alert('Please enter a valid content ID');
    }
  };

  const handleFetchOwnerDetailsWithRoyalties = async () => {
    setActiveSection('ownerDetailsWithRoyalties');
    await fetchOwnerDetailsWithRoyalties();
  };

  const handleFetchRoyaltiesBoughtByUser = async () => {
    setActiveSection('royaltiesBoughtByUser');
    await fetchRoyaltiesBoughtByUser();
  };

  return (
    <div className="maindiv">
       <canvas id="particlecanvas" className="particlecanvas"></canvas> {/* Add the canvas */}

      <h1 className="content">My Content</h1>
      <div>

        <button className="buttonmain" onClick={handleFetchOwnerDetailsWithRoyalties}>Royalties Sold</button>
        <button className="buttonmain" onClick={handleFetchRoyaltiesBoughtByUser}>Royalties Bought</button>

        
        <button className="buttonmain" onClick={handleListRoyalty}>List Royalty</button>
        <input
          className="inputfield"
          type="number"
          placeholder="Enter content ID"
          value={contentID}
          onChange={(e) => setContentID(Number(e.target.value))}
        />
      </div>
      {copiedMessage && <div className="copied-message">{copiedMessage}</div>}

      <div className="contentdiv">
        <h2 className="contenthead">
          {activeSection === 'ownerContent'
            ? ''
            : activeSection === 'contentByHash'
            ? ''
            : activeSection === 'contentByURL'
            ? ''
            : activeSection === 'contentIDs'
            ? ''
            : activeSection === 'ownerDetailsWithRoyalties'
            ? ''
            : activeSection === 'royaltiesBoughtByUser'
            ? ''
            : ''}
        </h2>

        {activeSection && (
          <table className="content-table">
            <thead>
            {activeSection === 'ownerContent' && (
      <>
                <th>ID</th>
                <th>Owner</th>
                <th>Timestamp</th>
                <th>Content Hash</th>
                <th>Combined Hash</th>
                <th>URL</th>
                <th>Price</th>
                <th>For Sale</th>
      </>
    )}
                {activeSection === 'contentIDs' && (
      <>
                <th>ID</th>

      </>
    )}
    {activeSection === 'ownerDetailsWithRoyalties' && (
      <>
                <th>ID</th>
                <th>Buyer</th>
                <th>Timestamp</th>
                <th>Price</th>
      </>
    )}
    {activeSection === 'royaltiesBoughtByUser' && (
      <>
                <th>ID</th>
                <th>Owner</th>
                <th>Timestamp</th>
                <th>Price</th>
      </>
    )}
    {activeSection === 'contentByHash' && (
      <>
                <th>ID</th>
                <th>Owner</th>
                <th>Timestamp</th>
                <th>Content Hash</th>
                <th>Combined Hash</th>
                <th>URL</th>
                <th>Price</th>
                <th>For Sale</th>
      </>
    )}
            </thead>
            <tbody>
              {activeSection === 'ownerContent' && ownerContent.length === 0 && (
                <tr><td colSpan={8}>No content available</td></tr>
              )}
              {activeSection === 'ownerContent' && ownerContent.map((content, index) => (
                <tr key={index}>
                  <td>{content?.id?.toString() || 'N/A'}</td>
                  <td
                    className={copiedCell === `owner-${index}` ? 'copied-cell' : ''}
                    onClick={() => copyToClipboard(content.owner || 'N/A', `owner-${index}`)}
                  >
                    {content.owner || 'N/A'}
                  </td>
                  <td>{content?.timeStamp ? new Date(Number(content.timeStamp) * 1000).toLocaleString() : 'N/A'}</td>
                  <td
                    className={copiedCell === `contentHash-${index}` ? 'copied-cell' : ''}
                    onClick={() => copyToClipboard(content.contentHash || 'N/A', `contentHash-${index}`)}
                  >
                    {content.contentHash || 'N/A'}
                  </td>
                  <td
                    className={copiedCell === `combinedHash-${index}` ? 'copied-cell' : ''}
                    onClick={() => copyToClipboard(content.combinedHash || 'N/A', `combinedHash-${index}`)}
                  >
                    {content.combinedHash || 'N/A'}
                  </td>
                  <td
                    className={copiedCell === `url-${index}` ? 'copied-cell' : ''}
                    onClick={() => copyToClipboard(content.url || 'N/A', `url-${index}`)}
                  >
                    {content.url || 'N/A'}
                  </td>
                  <td>{content?.price !== undefined ? content.price.toString() : 'N/A'}</td>
                  <td>{content?.forSale ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {activeSection === 'contentByHash' && ownerContent.length === 0 && (
                <tr><td colSpan={8}>No content found for this hash</td></tr>
              )}
              {activeSection === 'contentByHash' && ownerContent.map((content, index) => (
                <tr key={index}>
                  <td>{content?.id?.toString() || 'N/A'}</td>
                  <td>{content?.owner || 'N/A'}</td>
                  <td>{content?.timeStamp ? new Date(Number(content.timeStamp) * 1000).toLocaleString() : 'N/A'}</td>
                  <td>{content?.contentHash || 'N/A'}</td>
                  <td>{content?.combinedHash || 'N/A'}</td>
                  <td>{content?.url || 'N/A'}</td>
                  <td>{content?.price !== undefined ? content.price.toString() : 'N/A'}</td>
                  <td>{content?.forSale ? 'Yes' : 'No'}</td>
                </tr>
              ))}
              {activeSection === 'contentIDs' && ownerContent.length === 0 && (
                <tr><td colSpan={8}>No content IDs found</td></tr>
              )}
              {activeSection === 'contentIDs' && ownerContent.map((id, index) => (
                <tr key={index}>
                  <td>{id?.toString() || 'N/A'}</td>
             
                </tr>
              ))}
              {activeSection === 'ownerDetailsWithRoyalties' && royalties.contentIDs.length === 0 && (
                <tr><td colSpan={8}>No owner details available</td></tr>
              )}
              {activeSection === 'ownerDetailsWithRoyalties' && royalties.contentIDs.map((id, index) => (
                <tr key={index}>
                  <td>{id.toString()}</td>
                  <td>{royalties.buyerAddresses[index]}</td>
                  <td>{royalties.timestamps[index] ? new Date(Number(royalties.timestamps[index]) * 1000).toLocaleString() : 'N/A'}</td>
                  
                  <td>{royalties.royaltyPrices[index]?.toString() || 'N/A'}</td>
                </tr>
              ))}
              {activeSection === 'royaltiesBoughtByUser' && royalties.contentIDs.length === 0 && (
                <tr><td colSpan={8}>No royalties bought</td></tr>
              )}
              {activeSection === 'royaltiesBoughtByUser' && royalties.contentIDs.map((id, index) => (
                <tr key={index}>
                  <td>{id.toString()}</td>
                  <td>{royalties.owners[index]}</td>
                  <td>{royalties.timestamps[index] ? new Date(Number(royalties.timestamps[index]) * 1000).toLocaleString() : 'N/A'}</td>
               
                  <td>{royalties.royaltyPrices[index]?.toString() || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyContent;
