// c:\성원파크골프컨설팅\js\main.js

document.addEventListener('DOMContentLoaded', () => {
    // Header Scroll Effect
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // Smooth Scrolling for Anchor Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                // Account for fixed header
                const headerHeight = header.offsetHeight;
                const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Initialize Space Starfield
    initStarfield();

    // Initialize 3D Globe
    initGlobe();
});

function initGlobe() {
    const globeContainer = document.getElementById('globeViz');
    if (!globeContainer) return;

    try {
        // Generate Nodes (Cities)
        const numNodes = 40;
        const color = '#00e5ff'; // Cyan blue neon color matching the screenshot
        
        const nodes = [...Array(numNodes).keys()].map(() => ({
            lat: (Math.random() - 0.5) * 160,
            lng: (Math.random() - 0.5) * 360,
            size: Math.random() * 0.4 + 0.1
        }));

        // Generate Links (Connections)
        const numLinks = 60;
        const links = [];
        for (let i = 0; i < numLinks; i++) {
            const startNode = nodes[Math.floor(Math.random() * numNodes)];
            const endNode = nodes[Math.floor(Math.random() * numNodes)];
            if (startNode === endNode) continue;
            links.push({
                startLat: startNode.lat,
                startLng: startNode.lng,
                endLat: endNode.lat,
                endLng: endNode.lng,
                altitude: Math.random() * 0.2 + 0.05
            });
        }

        // Duplicate links for static paths and moving network dashes
        const staticLinks = links.map(d => ({ ...d, isStatic: true }));
        const dynamicLinks = links.map(d => ({ 
            ...d, 
            isStatic: false,
            initialGap: Math.random() * 5,
            animateTime: Math.random() * 3000 + 2000
        }));
        
        const allLinks = [...staticLinks, ...dynamicLinks];

        const myGlobe = Globe()(globeContainer)
          .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-dark.jpg') // Dark glossy earth
          .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
          .showAtmosphere(true)
          .atmosphereColor('#00e5ff') // Cyan glow
          .atmosphereAltitude(0.2) // 달무리(Halo) 1.3배 확장 (기존 0.15 -> 0.2)
          
          // Nodes
          .pointsData(nodes)
          .pointColor(() => color)
          .pointAltitude(0.01)
          .pointRadius('size')
          .pointResolution(32)

          // Arcs (Static paths + Moving traffic)
          .arcsData(allLinks)
          .arcColor(d => d.isStatic ? 'rgba(0, 229, 255, 0.2)' : 'rgba(0, 229, 255, 1)') // Faint static, bright moving
          .arcAltitude('altitude')
          .arcStroke(d => d.isStatic ? 0.3 : 0.8) // Moving dash is thicker
          .arcDashLength(d => d.isStatic ? 1 : 0.1) // Static is solid, moving is short dash
          .arcDashGap(d => d.isStatic ? 0 : 2)
          .arcDashInitialGap(d => d.isStatic ? 0 : d.initialGap)
          .arcDashAnimateTime(d => d.isStatic ? 0 : d.animateTime);

        // Fetch GeoJSON to draw continent outlines
        fetch('https://raw.githubusercontent.com/vasturiano/globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
          .then(res => res.json())
          .then(countries => {
              myGlobe.polygonsData(countries.features)
                .polygonCapColor(() => 'rgba(0, 0, 0, 0)') // Transparent land
                .polygonSideColor(() => 'rgba(0, 0, 0, 0)')
                .polygonStrokeColor(() => '#00e5ff'); // Cyan borders
          })
          .catch(err => console.error("GeoJSON load error:", err));

        myGlobe.controls().autoRotate = true;
        myGlobe.controls().autoRotateSpeed = 0.5;
        myGlobe.controls().enableZoom = true; // 휠 스크롤로 확대/축소 활성화
        myGlobe.controls().zoomSpeed = 0.8;   // 부드러운 줌 속도 설정
        
        // Transparent background to let the CSS starfield show through
        myGlobe.backgroundColor('rgba(0,0,0,0)');

        function resizeGlobe() {
            myGlobe.width(window.innerWidth);
            myGlobe.height(window.innerHeight);
        }
        window.addEventListener('resize', resizeGlobe);
        resizeGlobe();
    } catch (e) {
        console.error("Globe initialization error:", e);
    }
}

function initStarfield() {
    const canvas = document.getElementById('starfield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    let width, height;
    let stars = [];
    let shootingStars = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        initStars();
    }

    function initStars() {
        stars = [];
        const numStars = Math.floor((width * height) / 1000); // density
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * 1.2,
                alpha: Math.random(),
                velocity: Math.random() * 0.05 + 0.01 // twinkling speed
            });
        }
    }

    function createShootingStar() {
        shootingStars.push({
            x: Math.random() * width,
            y: 0,
            len: Math.random() * 80 + 20,
            speed: Math.random() * 10 + 5,
            angle: Math.PI / 4 + (Math.random() * 0.2 - 0.1), // roughly 45 degrees
            alpha: 1,
            fadeRate: 0.02
        });
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        
        // Draw static/twinkling stars
        stars.forEach(star => {
            star.alpha += star.velocity;
            if (star.alpha >= 1 || star.alpha <= 0.2) {
                star.velocity = -star.velocity;
            }
            
            ctx.beginPath();
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
            ctx.fill();
        });

        // Draw shooting stars
        for (let i = shootingStars.length - 1; i >= 0; i--) {
            let s = shootingStars[i];
            s.x -= s.speed * Math.cos(s.angle); // move left
            s.y += s.speed * Math.sin(s.angle); // move down
            s.alpha -= s.fadeRate;

            if (s.alpha <= 0) {
                shootingStars.splice(i, 1);
                continue;
            }

            ctx.beginPath();
            ctx.moveTo(s.x, s.y);
            ctx.lineTo(s.x + s.len * Math.cos(s.angle), s.y - s.len * Math.sin(s.angle));
            ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
            ctx.lineWidth = 1.5;
            ctx.stroke();
        }

        // Random chance for new shooting star
        if (Math.random() < 0.005) { // Occasional
            createShootingStar();
        }

        requestAnimationFrame(animate);
    }

    window.addEventListener('resize', resize);
    resize();
    animate();
}
