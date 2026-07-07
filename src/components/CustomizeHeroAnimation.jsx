import { useEffect, useRef, useState, useCallback } from "react";

const frameCount = 230;
const FIRST_FILE = 37; // First file is ezgif-frame-037
const START_FRAME = 2;  // ezgif-frame-039 (offset from first file: 039 - 037 = 2)
const START_PROGRESS = START_FRAME / (frameCount - 1);
const SCROLL_PER_FRAME = 14;

const getFramePath = (index) => {
  const num = FIRST_FILE + index; // 37, 38, 39, ... 300
  const padded = String(num).padStart(3, "0");
  return new URL(`../pages/customize_hero/ezgif-frame-${padded}.png`, import.meta.url).href;
};

function CustomizeHeroAnimation() {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imagesRef = useRef([]);
  const [loadedCount, setLoadedCount] = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const currentFrameRef = useRef(START_FRAME);

  const targetProgressRef = useRef(START_PROGRESS);
  const currentProgressRef = useRef(START_PROGRESS);
  const rafRef = useRef(null);

  useEffect(() => {
    const images = [];
    let loaded = 0;
    for (let i = 0; i < frameCount; i++) {
      const img = new Image();
      img.src = getFramePath(i);
      img.onload = () => {
        loaded++;
        setLoadedCount(loaded);
        if (loaded === frameCount) setAllLoaded(true);
      };
      images.push(img);
    }
    imagesRef.current = images;
    return () => images.forEach((img) => (img.onload = null));
  }, []);

  const drawFrame = useCallback((frameIndex) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const img = imagesRef.current[frameIndex];
    if (!img || !img.complete || img.naturalWidth === 0) return;

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

    const imgAspect = img.naturalWidth / img.naturalHeight;
    const canvasAspect = rect.width / rect.height;
    let sx = 0, sy = 0;
    let sWidth = img.naturalWidth;
    let sHeight = img.naturalHeight;

    if (canvasAspect > imgAspect) {
      sHeight = img.naturalWidth / canvasAspect;
      sy = (img.naturalHeight - sHeight) / 2;
    } else {
      sWidth = img.naturalHeight * canvasAspect;
      sx = (img.naturalWidth - sWidth) / 2;
    }

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, rect.width, rect.height);
  }, []);

  // Draw first frame once loaded
  useEffect(() => {
    if (allLoaded) {
      drawFrame(START_FRAME);
    }
  }, [allLoaded, drawFrame]);

  // Animation & scroll lerping loop
  useEffect(() => {
    if (!allLoaded) return;

    const lerpSpeed = 0.05; // Buttery-smooth easing factor

    const updateLoop = () => {
      const diff = targetProgressRef.current - currentProgressRef.current;

      // Only draw frames if there is visible movement
      if (Math.abs(diff) > 0.0001) {
        currentProgressRef.current += diff * lerpSpeed;

        const frameIndex = Math.min(
          frameCount - 1,
          Math.max(0, Math.round(currentProgressRef.current * (frameCount - 1)))
        );

        if (frameIndex !== currentFrameRef.current) {
          currentFrameRef.current = frameIndex;
          drawFrame(frameIndex);
        }
      }
      rafRef.current = requestAnimationFrame(updateLoop);
    };

    const handleScroll = () => {
      const section = document.querySelector(".customize-hero-section");
      if (!section) return;

      const sectionRect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      const scrollableDistance = sectionRect.height - windowHeight;
      const scrolled = -sectionRect.top;

      let progress = START_PROGRESS;
      if (scrollableDistance > 0) {
        const rawProgress = Math.max(0, Math.min(1, scrolled / scrollableDistance));
        // Map scroll progress to frame range starting from START_FRAME
        progress = START_PROGRESS + rawProgress * (1 - START_PROGRESS);
      }
      targetProgressRef.current = progress;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    const handleResize = () => {
      drawFrame(currentFrameRef.current);
    };
    window.addEventListener("resize", handleResize);

    rafRef.current = requestAnimationFrame(updateLoop);

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
        style={{ opacity: allLoaded ? 1 : 0, transform: "none" }}
      />
    </div>
  );
}

export default CustomizeHeroAnimation;