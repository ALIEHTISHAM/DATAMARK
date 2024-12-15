import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Landingpage.css';

function LandingPage() {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login'); // Navigate to the Login page when the button is clicked
  };

  const handleSignUpClick = () => {
    navigate('/register'); // Navigate to the Register page when the button is clicked
  };

  useEffect(() => {
    const canvas = document.getElementById('particle-canvas') as HTMLCanvasElement;
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

  return (
    <div className="landing-page">
      <canvas id="particle-canvas" className="particle-canvas"></canvas>
      <div className="hero">
        <h1 className="title">DATAMARK</h1>
        <p className="subtitle">Copyright Protection leveraging Blockchain</p>
        <div className="buttons">
          <button className="button button-login" onClick={handleLoginClick}>Login</button>
          <button className="button button-signup" onClick={handleSignUpClick}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
