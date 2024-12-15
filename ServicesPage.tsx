import React, { useState, useRef, useEffect } from "react";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "./ServicesPage.css";
import { useContent } from "./Contentcontext";

function ServicesPage() {
  const {
    uploadedFiles,
    selectedFile,
    setSelectedFile,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleUploadFile,
    handleDeleteFile,
    contentURL,
    reconnectWallet,
    walletAddress,
    forSale,
    setForSale,
    price,
    setPrice,
    contentHash, // Added from useContent to access the contentHash
  } = useContent();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const [textContent, setTextContent] = useState<string | null>(null); // For text files

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedFile(null);
    setFilePreview(null);
    setTextContent(null);
    setForSale(false);
    setPrice(0);
  };

  const handleBrowseButtonClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const savePreviewToDB = async (contentHash: string, preview: unknown, type: string) => {
    try {
      const response = await fetch("http://localhost:3001/api/preview/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentHash, preview, type }),
      });
      if (!response.ok) {
        console.error("Failed to save preview");
      } else {
        console.log("Preview saved successfully");
      }
    } catch (error) {
      console.error("Error saving preview:", error);
    }
  };

  const generatePreview = async (file: Blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result); // Base64 string
      reader.onerror = () => reject("Error reading file");
      reader.readAsDataURL(file);
    });
  };

  const determineFileType = (file: File) => {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";
    if (file.type === "application/pdf") return "pdf";
    return "unsupported";
  };

  const handleFileChangeWithPreview = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleFileChange(event);
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Generate preview URL
      const fileUrl = URL.createObjectURL(file);
      setFilePreview(fileUrl);

      // Handle text file preview
      if (file.type === "text/plain") {
        file.text().then((text) => setTextContent(text));
      } else {
        setTextContent(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      console.error("No file selected");
      return;
    }
    setUploading(true);
    try {
      // Generate preview and determine type
      const preview = await generatePreview(selectedFile);
      const type = determineFileType(selectedFile);

      // Save the preview to the database
      await savePreviewToDB(contentHash, preview, type);

      // Proceed with existing upload logic
      await handleUploadFile();
      setUploading(false);
      handleCloseModal();
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploading(false);
    }
  };

  const handleReconnectWallet = async () => {
    try {
      await reconnectWallet();
    } catch (error) {
      console.error("Error reconnecting wallet:", error);
    }
  };

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
    return () => {
      if (filePreview) {
        URL.revokeObjectURL(filePreview);
      }
    };
  }, [filePreview]);
  return (
    <div className="divhead">
      <h1 className="heading"></h1>
      <div className="services-page">
      <canvas id="particlecanvas" className="particlecanvas"></canvas> {/* Add the canvas */}
        <div className="actions">
          <button
            onClick={() => setModalOpen(true)}
            className="action-button upload-button"
          >
            Upload File
          </button>
          <button
            onClick={handleReconnectWallet}
            className="action-button wallet-button"
          >
            {walletAddress ? "Reconnect Wallet" : "Connect Wallet"}
          </button>
        </div>

        {walletAddress && (
          <p className="wallet-info">
            Connected Wallet: <p className="walletaddress">{walletAddress}</p>
          </p>
        )}

        {modalOpen && (
          <div className="modal-overlay">
            <div
              className="modal-content"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <div className="drag-drop-section">
                <h2>Drag & Drop to Upload</h2>
                <button
                  className="browse-button"
                  onClick={handleBrowseButtonClick}
                >
                  Browse Files
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChangeWithPreview}
                  className="file-input"
                  accept=".doc,.docx,.pdf,.jpg,.jpeg,.png,.gif,.bmp,.mp4,.mov,.avi,.mkv,.txt"
                />
                {selectedFile && (
                  <div className="selected-file-info">
                    <p>Selected: {selectedFile.name}</p>
                    <p>Content URL: {contentURL}</p>

                    {/* Display file preview */}
                    {filePreview && (
                      <div className="file-preview">
                        {selectedFile.type.startsWith("image/") ? (
                          <img
                            src={filePreview}
                            alt="File preview"
                            className="preview-image"
                          />
                        ) : selectedFile.type.startsWith("video/") ? (
                          <video
                            src={filePreview}
                            controls
                            className="preview-video"
                          />
                        ) : selectedFile.type === "application/pdf" ? (
                          <div className="pdf-preview">
                            <Worker
                              workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}
                            >
                              <Viewer fileUrl={filePreview} />
                            </Worker>
                          </div>
                        ) : selectedFile.type === "text/plain" && textContent ? (
                          <div className="text-preview">
                            <pre>{textContent.slice(0, 500)}...</pre>
                          </div>
                        ) : (
                          <p>Preview not available for this file type</p>
                        )}
                      </div>
                    )}

                    <div className="sale-options">
                      <label>
                        <input
                          type="checkbox"
                          checked={forSale}
                          onChange={(e) => setForSale(e.target.checked)}
                        />
                        For Sale
                      </label>
                      {forSale && (
                        <input
                          type="number"
                          placeholder="Price (ETH)"
                          value={price}
                          onChange={(e) => setPrice(Number(e.target.value))}
                        />
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="modal-buttons">
                <button
                  className="browse-button"
                  onClick={handleBrowseButtonClick}
                >
                  Browse Files
                </button>
                <button
                  onClick={handleUpload}
                  className="upload-file-button"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Upload"}
                </button>
                <button
                  onClick={handleCloseModal}
                  className="close-modal-button"
                >
                  Close
                </button>
              </div>

              <div className="uploaded-files-section">
                <h3>Uploaded Files</h3>
                {uploadedFiles.length > 0 ? (
                  uploadedFiles.map((file, index) => (
                    <div key={index} className="uploaded-file">
                      <span className="uploaded-file-name">{file.name}</span>
                      <span
                        className="uploaded-file-delete"
                        onClick={() => handleDeleteFile(file)}
                      >
                        &times;
                      </span>
                    </div>
                  ))
                ) : (
                  <p>No files uploaded yet.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ServicesPage;
