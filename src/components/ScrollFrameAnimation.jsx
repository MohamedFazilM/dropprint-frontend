import { useEffect, useRef, useState, useCallback } from "react";

// Import all frames from pages/images (using the numbered 99-196 set)
// Full sequence — files are ezgif-frame-001.png to ezgif-frame-196.png
const frameCount = 196;
const getFramePath = (index) => {
  const num = index + 1; // 1 to 196
  const padded = String(num).padStart(3, "0"); // 001, 002, ... 196
  return new URL(`../pages/images/ezgif-frame-${padded}.png`, import.meta.url).href;
};

function ScrollFrameAnimation() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const currentFrameRef = useRef(0);
  const rafRef = useRef(null);
  const targetProgressRef = useRef(0);
  const currentProgressRef = useRef(0);

  // Preload all images
  useEffect(() => {
    const images = [];
    let loaded = 0;

    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === frameCount) {
          setAllLoaded(true);
        }
      };
      images.push(img);
    }

    imagesRef.current = images;

    return () => {
      images.forEach((img) => {
        img.onload = null;
      });
    };
  }, []);

  // Draw a frame on canvas
  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const img = imagesRef.current[frameIndex];

    if (!img || !img.complete || img.naturalWidth === 0) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;

    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
    ctx.scale(dpr, dpr);

    ctx.clearRect(0, 0, rect.width, rect.height);

    // COVER fit — image full canvas ah fill pannum, excess crop aagum (object-fit: cover)
    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = rect.width / rect.height;

    let sx = 0, sy = 0;
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;

    if (canvasAspect > imgAspect) {
      // canvas image-ah vida wide-ah irukku -> top/bottom crop pannunga
      sHeight = img.naturalWidth / canvasAspect;
      sy = (img.naturalHeight - sHeight) / 2;
    } else {
      // canvas image-ah vida narrow-ah irukku -> left/right crop pannunga
      sWidth = img.naturalHeight * canvasAspect;
      sx = (img.naturalWidth - sWidth) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, rect.width, rect.height);
  }, []);

  // Draw first frame once loaded
  useEffect(() => {
    if (allLoaded) {
      drawFrame(0);
    }
  }, [allLoaded, drawFrame]);

  // Scroll handler — track the outer section (.hero-3d-section) for scroll progress
  useEffect(() => {
    if (!allLoaded) return;

    const lerpSpeed = 0.05; // Buttery-smooth easing factor

    const updateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;

      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * lerpSpeed;

        const frameIndex = Math.min(
          frameCount - 1,
          Math.max(0, Math.floor(currentProgressRef.current * frameCount))
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      }
      rafRef.current = requestAnimationFrame(updateLoop);
    };

    const handleScroll = () => {
      // Find the parent section that has the extended scroll height
      const section = document.querySelector(".hero-3d-section");
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      // The section is 300vh tall, sticky keeps canvas visible for entire scroll
      const scrollableDistance = sectionRect.height - windowHeight;
      const scrolled = -sectionRect.top;

      let progress = 0;
      if (scrollableDistance > 0) {
        progress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
      }
      targetProgressRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial call

    rafRef.current = requestAnimationFrame(updateLoop);

    // Handle resize
    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [allLoaded, drawFrame]);

  return (
    <div ref={containerRef} className="scroll-frame-container">
      <canvas
        ref={canvasRef}
        className="scroll-frame-canvas"
        style={{ opacity: allLoaded ? 1 : 0 }}
      />
    </div>
  );
}
export default ScrollFrameAnimation;
