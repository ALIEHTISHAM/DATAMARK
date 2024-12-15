import React, { useState, useEffect, useRef } from 'react';
import { useContent } from './Contentcontext';

import './MyContent.css';

const MyContent: React.FC = () => {
  const {
    fetchContentOfOwner,
    fetchContentByHash,
    fetchContentByURL,
    fetchContentIDsByAddress,
    ownerContent,
  } = useContent();

  const [contentHash, setContentHash] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('');
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);
  const [copiedCell, setCopiedCell] = useState<string | null>(null);
  const [enrichedContent, setEnrichedContent] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state

  const previewCache = useRef<{ [contentHash: string]: { preview: string | null; type: string | null } }>({});
  useEffect(() => {
    const canvas = document.getElementById("particlecanvas") as HTMLCanvasElement;
    const ctx = canvas.getContext("2d");
    const particles: any[] = [];

    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Handle window resizing
    window.addEventListener("resize", () => {
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
        this.color = "rgba(255, 255, 255, 0.8)";
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
    window.addEventListener("mousemove", createParticles);

    animateParticles();

    // Cleanup event listener
    return () => {
      window.removeEventListener("mousemove", createParticles);
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

  // Enrich content with previews
  const fetchPreviews = async () => {
    if (ownerContent.length === 0) return;

    const updatedContent = await Promise.all(
      ownerContent.map(async (content) => {
        if (previewCache.current[content.contentHash]) {
          return { ...content, ...previewCache.current[content.contentHash] };
        }

        try {
          const response = await fetch(`http://localhost:3001/api/preview/${content.contentHash}`);
          const previewData = response.ok ? await response.json() : null;

          const enrichedData = {
            preview: previewData?.preview || null,
            type: previewData?.type || null,
          };
          previewCache.current[content.contentHash] = enrichedData;

          return { ...content, ...enrichedData };
        } catch (error) {
          console.error(`Error fetching preview for contentHash ${content.contentHash}:`, error);
          return { ...content, preview: null };
        }
      })
    );

    setEnrichedContent(updatedContent);
  };

  const handleFetchContentOfOwner = async () => {
    setIsLoading(true);
    setActiveSection('ownerContent');
    setEnrichedContent([]); // Clear enriched content immediately
    try {
      await fetchContentOfOwner();
    } catch (error) {
      console.error('Error fetching content of owner:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Watch for changes in `ownerContent` and enrich it with previews
  useEffect(() => {
    if (activeSection === 'ownerContent') {
      fetchPreviews();
    }
  }, [ownerContent, activeSection]);

  const handleFetchContentIDsByAddress = async () => {
    setIsLoading(true);
    setActiveSection('contentIDs');
    setEnrichedContent([]); // Clear enriched content immediately
    try {
      await fetchContentIDsByAddress();
    } catch (error) {
      console.error('Error fetching content IDs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFetchContentByHash = async () => {
    if (!contentHash) {
      alert('Please enter a content hash');
      return;
    }
  
    setIsLoading(true);
    setActiveSection('contentByHash');
    setEnrichedContent([]); // Clear enriched content immediately
  
    try {
      // Fetch content by hash and get the result
      const fetchedContent = await fetchContentByHash(contentHash);
  
      if (!fetchedContent) {
        setEnrichedContent([]);
        return; // No content found
      }
  
      // Fetch preview for the entered content hash if not cached
      if (!previewCache.current[contentHash]) {
        const response = await fetch(`http://localhost:3001/api/preview/${contentHash}`);
        const previewData = response.ok ? await response.json() : null;
  
        const enrichedData = {
          preview: previewData?.preview || null,
          type: previewData?.type || null,
        };
  
        // Update cache and enrich the content
        previewCache.current[contentHash] = enrichedData;
  
        setEnrichedContent([{ ...fetchedContent, ...enrichedData }]);
      } else {
        // Use cached preview
        setEnrichedContent([{ ...fetchedContent, ...previewCache.current[contentHash] }]);
      }
    } catch (error) {
      console.error('Error fetching content by hash:', error);
      setEnrichedContent([]); // Ensure no stale data remains
    } finally {
      setIsLoading(false);
    }
  };
  
  
  

  return (
    <div className="maindiv">
            <canvas id="particlecanvas" className="particlecanvas"></canvas> {/* Add the canvas */}

      
      <h1 className="content">My Content</h1>
      <div>
        <button className="buttonmain" onClick={handleFetchContentOfOwner} disabled={isLoading}>
          {isLoading && activeSection === 'ownerContent' ? 'Loading...' : 'My Content'}
        </button>
        <button className="buttonmain" onClick={handleFetchContentIDsByAddress} disabled={isLoading}>
          {isLoading && activeSection === 'contentIDs' ? 'Loading...' : 'Content IDs'}
        </button>
        <button className="buttonmain" onClick={handleFetchContentByHash} disabled={isLoading}>
          {isLoading && activeSection === 'contentByHash' ? 'Loading...' : 'Get Content'}
        </button>
        <input
          className="inputfield"
          type="text"
          placeholder="Enter contentHash"
          value={contentHash}
          onChange={(e) => setContentHash(e.target.value)}
        />
      </div>
      {copiedMessage && <div className="copied-message">{copiedMessage}</div>}

      <div className="contentdiv">
        <h2 className="contenthead">
          {activeSection === 'ownerContent'
            ? ''
            : activeSection === 'contentByHash'
            ? ''
            : activeSection === 'contentIDs'
            ? ''
            : ''}
        </h2>

        {isLoading && <p>Loading...</p>}

        {!isLoading && activeSection && (
          <table className="content-table">
            <thead>
              {activeSection === 'ownerContent' && (
                <tr>
                  <th>ID</th>
                  <th>Owner</th>
                  <th>Timestamp</th>
                  <th>Content Hash</th>
                  <th>Preview</th>
                  <th>URL</th>
                  <th>Price</th>
                  <th>For Sale</th>
                </tr>
              )}
              {activeSection === 'contentIDs' && (
                <tr>
                  <th>ID</th>
                </tr>
              )}
              {activeSection === 'contentByHash' && (
                <tr>
                  <th>ID</th>
                  <th>Owner</th>
                  <th>Timestamp</th>
                  <th>Content Hash</th>
                  <th>Preview</th>
                  <th>URL</th>
                  <th>Price</th>
                  <th>For Sale</th>
                </tr>
              )}
            </thead>
            <tbody>
              {activeSection === 'ownerContent' && enrichedContent.length === 0 && (
                <tr>
                  <td colSpan={8}>No content available</td>
                </tr>
              )}
              {activeSection === 'ownerContent' &&
                enrichedContent.map((content, index) => (
                  <tr key={index}>
                    <td>{content?.id?.toString() || 'N/A'}</td>
                    <td>{content?.owner || 'N/A'}</td>
                    <td>
                      {content?.timeStamp
                        ? new Date(Number(content.timeStamp) * 1000).toLocaleString()
                        : 'N/A'}
                    </td>
                    <td
                      className={
                        copiedCell === `contentHash-${index}`
                          ? 'copied-cell'
                          : ''
                      }
                      onClick={() =>
                        copyToClipboard(content.contentHash || 'N/A', `contentHash-${index}`)
                      }
                    >
                      {content.contentHash || 'N/A'}
                    </td>
                    <td>
                      {content.preview && content.type === 'image' ? (
                        <img src={content.preview} alt="Preview" style={{ width: '150px', height: 'auto' }} />
                      ) : content.preview && content.type === 'video' ? (
                        <video src={content.preview} controls style={{ width: '150px',height:'auto' }} />
                      ) : content.preview && content.type === 'pdf' ? (
                        <a href={content.preview} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      ) : (
                        'No preview available'
                      )}
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
              {activeSection === 'contentIDs' && ownerContent.length === 0 && (
                <tr>
                  <td colSpan={8}>No content IDs found</td>
                </tr>
              )}
              {activeSection === 'contentIDs' &&
                ownerContent.map((id, index) => (
                  <tr key={index}>
                    <td>{id?.toString() || 'N/A'}</td>
                  </tr>
                ))}
                {activeSection === 'contentByHash' && enrichedContent.length === 0 && (
  <tr>
    <td colSpan={8}>No content found for this hash</td>
  </tr>
)}
{activeSection === 'contentByHash' && enrichedContent.length > 0 && (
  enrichedContent.map((content, index) => (
    <tr key={index}>
      <td>{content?.id?.toString() || 'N/A'}</td>
      <td>{content?.owner || 'N/A'}</td>
      <td>
        {content?.timeStamp
          ? new Date(Number(content.timeStamp) * 1000).toLocaleString()
          : 'N/A'}
      </td>
      <td>{content?.contentHash || 'N/A'}</td>
      <td>
        {content.preview && content.type === 'image' ? (
          <img
            src={content.preview}
            alt="Preview"
            style={{ width: '150px', height: 'auto' }}
          />
        ) : content.preview && content.type === 'video' ? (
          <video src={content.preview} controls style={{ width: '150px', height:'auto' }} />
        ) : content.preview && content.type === 'pdf' ? (
          <a
            href={content.preview}
            target="_blank"
            rel="noopener noreferrer"
          >
            View PDF
          </a>
        ) : (
          'No preview available'
        )}
      </td>
      <td>{content?.url || 'N/A'}</td>
      <td>{content?.price !== undefined ? content.price.toString() : 'N/A'}</td>
      <td>{content?.forSale ? 'Yes' : 'No'}</td>
    </tr>
  ))
)}


            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MyContent;
