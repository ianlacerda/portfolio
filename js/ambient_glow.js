/**
 * Ambient Glow Background Animation
 * Generates three organic, blurred visual shapes that slowly drift and follow
 * the user's cursor coordinates, morphing using sine-wave modulated border-radii.
 */
(function() {
  // Create and append the fixed background wrapper to the document body
  const container = document.createElement('div');
  container.id = 'ambient-glow-container';
  container.style.position = 'fixed';
  container.style.top = '0';
  container.style.left = '0';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.zIndex = '-2';
  container.style.pointerEvents = 'none';
  container.style.overflow = 'hidden';
  document.body.appendChild(container);

  // Default color settings matching the homepage video sky
  let colors = {
    c1: 'rgba(100, 60, 180, 0.35)', // Purple cloud glow
    c2: 'rgba(31, 109, 179, 0.32)',  // Deep Blue cloud glow
    c3: 'rgba(232, 17, 71, 0.15)'   // Sunset magenta glow
  };
  let blurAmount = '130px';

  // Customize glow colors and intensity based on the active body class
  if (document.body.classList.contains('ux-report-body')) {
    // UX Design Report: Soft pastel rose & coral tones
    colors.c1 = 'rgba(240, 216, 216, 0.20)';
    colors.c2 = 'rgba(233, 114, 114, 0.15)';
    colors.c3 = 'rgba(255, 255, 255, 0.05)';
    blurAmount = '140px';
  } else if (document.body.classList.contains('infinity-art-body')) {
    // InfinityART: Soft pink, orange & amber artist palette
    colors.c1 = 'rgba(232, 17, 71, 0.07)';
    colors.c2 = 'rgba(219, 73, 36, 0.06)';
    colors.c3 = 'rgba(224, 131, 36, 0.04)';
    blurAmount = '150px';
  } else if (document.body.classList.contains('home-body')) {
    // Home Page: Deep purple, blue and sunset red tones
    colors.c1 = 'rgba(100, 60, 180, 0.35)';
    colors.c2 = 'rgba(31, 109, 179, 0.32)';
    colors.c3 = 'rgba(232, 17, 71, 0.15)';
    blurAmount = '130px';
  }

  // Create three glowing blob div elements
  const blob1 = document.createElement('div');
  const blob2 = document.createElement('div');
  const blob3 = document.createElement('div');

  // Common styles shared across all visual glow blobs
  const baseStyle = {
    position: 'absolute',
    left: '0',
    top: '0',
    borderRadius: '50%',
    filter: `blur(${blurAmount})`,
    webkitFilter: `blur(${blurAmount})`,
    transform: 'translate3d(0, 0, 0) translate(-50%, -50%)',
    willChange: 'transform, border-radius',
    opacity: '0.9'
  };

  // Configure distinct sizes and color profiles for the blobs
  Object.assign(blob1.style, baseStyle, {
    width: '450px',
    height: '450px',
    background: colors.c1
  });

  Object.assign(blob2.style, baseStyle, {
    width: '550px',
    height: '500px',
    background: colors.c2
  });

  Object.assign(blob3.style, baseStyle, {
    width: '350px',
    height: '350px',
    background: colors.c3
  });

  container.appendChild(blob1);
  container.appendChild(blob2);
  container.appendChild(blob3);

  // Use screen dimensions which do not trigger forced layout reflows, with safe fallbacks
  let targetX = (typeof window !== 'undefined' && window.screen && window.screen.width) ? (window.screen.width / 2) : 600;
  let targetY = (typeof window !== 'undefined' && window.screen && window.screen.height) ? (window.screen.height / 2) : 400;

  // Blob positions (starting at center defaults)
  let b1 = { x: targetX, y: targetY };
  let b2 = { x: targetX + 180, y: targetY - 120 };
  let b3 = { x: targetX - 150, y: targetY + 150 };

  let time = 0;

  // Animation render loop
  function update() {
    time += 0.002; 

    // Smooth linear interpolation (lerp) towards cursor targets
    b1.x += (targetX - b1.x) * 0.04;
    b1.y += (targetY - b1.y) * 0.04;

    // Blob 2 orbits around target coordinates with sinusoidal patterns
    const o2X = targetX + Math.sin(time * 2) * 160;
    const o2Y = targetY + Math.cos(time * 2) * 160;
    b2.x += (o2X - b2.x) * 0.035;
    b2.y += (o2Y - b2.y) * 0.035;

    // Blob 3 orbits in counter-direction with varying speed
    const o3X = targetX + Math.cos(time * 1.5) * -200;
    const o3Y = targetY + Math.sin(time * 1.5) * -180;
    b3.x += (o3X - b3.x) * 0.025;
    b3.y += (o3Y - b3.y) * 0.025;

    // Generate organic, fluid shapes using time-modulated border-radii
    const r1 = `${Math.floor(50 + 10 * Math.sin(time * 4))}% ${Math.floor(50 + 10 * Math.cos(time * 3))}% ${Math.floor(50 + 12 * Math.sin(time * 2.5))}% ${Math.floor(50 + 8 * Math.cos(time * 3.5))}% / ${Math.floor(50 + 8 * Math.sin(time * 2))}% ${Math.floor(50 + 12 * Math.cos(time * 3))}% ${Math.floor(50 + 10 * Math.sin(time * 2.8))}% ${Math.floor(50 + 10 * Math.cos(time * 3.2))}%`;
    const r2 = `${Math.floor(50 + 12 * Math.cos(time * 3))}% ${Math.floor(50 + 8 * Math.sin(time * 2))}% ${Math.floor(50 + 10 * Math.cos(time * 3.2))}% ${Math.floor(50 + 12 * Math.sin(time * 2.4))}% / ${Math.floor(50 + 10 * Math.sin(time * 3))}% ${Math.floor(50 + 10 * Math.cos(time * 2.5))}% ${Math.floor(50 + 8 * Math.sin(time * 3.5))}% ${Math.floor(50 + 10 * Math.cos(time * 1.8))}%`;
    const r3 = `${Math.floor(50 + 8 * Math.sin(time * 2.5))}% ${Math.floor(50 + 12 * Math.cos(time * 4))}% ${Math.floor(50 + 10 * Math.sin(time * 3.2))}% ${Math.floor(50 + 8 * Math.cos(time * 2.8))}% / ${Math.floor(50 + 12 * Math.sin(time * 3.5))}% ${Math.floor(50 + 10 * Math.cos(time * 1.5))}% ${Math.floor(50 + 12 * Math.sin(time * 2))}% ${Math.floor(50 + 8 * Math.cos(time * 3))}%`;

    blob1.style.borderRadius = r1;
    blob2.style.borderRadius = r2;
    blob3.style.borderRadius = r3;

    // Apply composited positions and rotations using translate3d to avoid layout thrashing (CLS)
    blob1.style.transform = `translate3d(${b1.x}px, ${b1.y}px, 0) translate(-50%, -50%) rotate(${time * 10}deg)`;
    blob2.style.transform = `translate3d(${b2.x}px, ${b2.y}px, 0) translate(-50%, -50%) rotate(${time * -15}deg)`;
    blob3.style.transform = `translate3d(${b3.x}px, ${b3.y}px, 0) translate(-50%, -50%) rotate(${time * 8}deg)`;

    requestAnimationFrame(update);
  }

  // Update target cursor coordinates on cursor move
  window.addEventListener('mousemove', (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  });

  // Touch tracking for mobile device displays
  window.addEventListener('touchmove', (e) => {
    if (e.touches && e.touches.length > 0) {
      targetX = e.touches[0].clientX;
      targetY = e.touches[0].clientY;
    }
  });

  // Recenter targets on window resizing
  window.addEventListener('resize', () => {
    targetX = window.innerWidth / 2;
    targetY = window.innerHeight / 2;
  });

  // Launch the animation update loop
  update();
})();
