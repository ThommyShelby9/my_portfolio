/**
 * Nano Technology Animation with Three.js
 * This creates an immersive background with nano-robot particles
 */

// Initialize Three.js scene
let scene, camera, renderer, particles, particleSystem;
let particleCount = 500;
let nanoSize = 5;
const particlesData = [];
const connectionDistance = 60;
const maxConnections = 3;

// Colors
const particleColor = 0x4d8dff; // Light blue
const connectionColor = 0x0062ff; // Primary blue
const particleColorDark = 0x00e1b1; // Secondary color
const connectionColorDark = 0x006655; // Dark teal

// Initialize the animation
function initNanoAnimation() {
    const container = document.getElementById('nano-container');
    
    // Create scene
    scene = new THREE.Scene();
    
    // Create camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 300;
    
    // Create renderer
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000, 0); // Transparent background
    container.appendChild(renderer.domElement);
    
    // Create particle system
    createParticleSystem();
    
    // Add event listeners
    window.addEventListener('resize', onWindowResize);
    document.addEventListener('mousemove', onMouseMove);
    
    // Start animation loop
    animate();
}

// Create particle system with nano-robots
function createParticleSystem() {
    const particles = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
        // Position
        const x = (Math.random() - 0.5) * window.innerWidth;
        const y = (Math.random() - 0.5) * window.innerHeight;
        const z = (Math.random() - 0.5) * 500;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Velocity
        const vx = (Math.random() - 0.5) * 0.2;
        const vy = (Math.random() - 0.5) * 0.2;
        const vz = (Math.random() - 0.5) * 0.2;
        
        velocities[i * 3] = vx;
        velocities[i * 3 + 1] = vy;
        velocities[i * 3 + 2] = vz;
        
        // Save particle data for connections
        particlesData.push({
            position: new THREE.Vector3(x, y, z),
            velocity: new THREE.Vector3(vx, vy, vz),
            connections: 0
        });
        
        // Color - slightly randomize for visual interest
        const color = new THREE.Color(particleColor);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    // Set buffer attributes
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    
    // Create material
    const material = new THREE.PointsMaterial({
        size: nanoSize,
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        map: createParticleTexture(),
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    // Create particle system
    particleSystem = new THREE.Points(particles, material);
    scene.add(particleSystem);
    
    // Create connections (lines between particles)
    createConnections();
}

// Create custom particle texture for nano-robots
function createParticleTexture() {
    const canvas = document.createElement('canvas');
    const size = 64;
    canvas.width = size;
    canvas.height = size;
    
    const context = canvas.getContext('2d');
    
    // Create gradient
    const gradient = context.createRadialGradient(
        size / 2, size / 2, 0,
        size / 2, size / 2, size / 2
    );
    
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.8)');
    gradient.addColorStop(0.6, 'rgba(255, 255, 255, 0.4)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    // Draw nano-robot shape (circular glow)
    context.fillStyle = gradient;
    context.fillRect(0, 0, size, size);
    
    // Create texture
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    
    return texture;
}

// Create connections between particles
function createConnections() {
    // Create lines geometry
    const lineGeometry = new THREE.BufferGeometry();
    const lineMaterial = new THREE.LineBasicMaterial({
        color: connectionColor,
        transparent: true,
        opacity: 0.2,
        blending: THREE.AdditiveBlending
    });
    
    // Positions will be updated in animation loop
    const positions = new Float32Array(particleCount * maxConnections * 2 * 3);
    lineGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Create line segments
    const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
    scene.add(lines);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    // Update particles
    updateParticles();
    
    // Update connections
    updateConnections();
    
    // Render scene
    renderer.render(scene, camera);
}

// Update particle positions
function updateParticles() {
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
        // Update position based on velocity
        positions[i * 3] += particlesData[i].velocity.x;
        positions[i * 3 + 1] += particlesData[i].velocity.y;
        positions[i * 3 + 2] += particlesData[i].velocity.z;
        
        // Update particle data position
        particlesData[i].position.set(
            positions[i * 3],
            positions[i * 3 + 1],
            positions[i * 3 + 2]
        );
        
        // Boundary check - wrap around if out of bounds
        if (positions[i * 3] < -window.innerWidth / 2 || positions[i * 3] > window.innerWidth / 2) {
            particlesData[i].velocity.x = -particlesData[i].velocity.x;
        }
        
        if (positions[i * 3 + 1] < -window.innerHeight / 2 || positions[i * 3 + 1] > window.innerHeight / 2) {
            particlesData[i].velocity.y = -particlesData[i].velocity.y;
        }
        
        if (positions[i * 3 + 2] < -500 || positions[i * 3 + 2] > 500) {
            particlesData[i].velocity.z = -particlesData[i].velocity.z;
        }
        
        // Reset connections count
        particlesData[i].connections = 0;
    }
    
    // Update buffer
    particleSystem.geometry.attributes.position.needsUpdate = true;
}

// Update connections between particles
function updateConnections() {
    const positions = scene.children[1].geometry.attributes.position.array;
    let vertexPosition = 0;
    
    // Reset connections
    for (let i = 0; i < particleCount; i++) {
        particlesData[i].connections = 0;
    }
    
    // Update connections
    for (let i = 0; i < particleCount; i++) {
        // Only create connections if this particle has less than maximum allowed
        if (particlesData[i].connections >= maxConnections) continue;
        
        for (let j = i + 1; j < particleCount; j++) {
            // Skip if target particle already has max connections
            if (particlesData[j].connections >= maxConnections) continue;
            
            // Calculate distance between particles
            const dx = particlesData[i].position.x - particlesData[j].position.x;
            const dy = particlesData[i].position.y - particlesData[j].position.y;
            const dz = particlesData[i].position.z - particlesData[j].position.z;
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
            
            // Create connection if within range
            if (distance < connectionDistance) {
                // Set line vertices
                positions[vertexPosition++] = particlesData[i].position.x;
                positions[vertexPosition++] = particlesData[i].position.y;
                positions[vertexPosition++] = particlesData[i].position.z;
                
                positions[vertexPosition++] = particlesData[j].position.x;
                positions[vertexPosition++] = particlesData[j].position.y;
                positions[vertexPosition++] = particlesData[j].position.z;
                
                // Increment connection count
                particlesData[i].connections++;
                particlesData[j].connections++;
                
                // Break if max connections reached
                if (particlesData[i].connections >= maxConnections) break;
            }
        }
    }
    
    // Fill remaining vertices with invisible lines
    for (let i = vertexPosition; i < particleCount * maxConnections * 2 * 3; i++) {
        positions[i] = 0;
    }
    
    scene.children[1].geometry.attributes.position.needsUpdate = true;
}

// Window resize handler
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Mouse move handler for interactive particles
let mouseX = 0, mouseY = 0;
const mouseInfluenceDistance = 100;
const mouseForce = 0.1;

function onMouseMove(event) {
    // Calculate mouse position in normalized device coordinates
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
    
    // Convert to world coordinates
    const vector = new THREE.Vector3(mouseX, mouseY, 0.5);
    vector.unproject(camera);
    
    const dir = vector.sub(camera.position).normalize();
    const distance = -camera.position.z / dir.z;
    const pos = camera.position.clone().add(dir.multiplyScalar(distance));
    
    // Apply force to nearby particles
    const positions = particleSystem.geometry.attributes.position.array;
    
    for (let i = 0; i < particleCount; i++) {
        const dx = positions[i * 3] - pos.x;
        const dy = positions[i * 3 + 1] - pos.y;
        const dz = positions[i * 3 + 2] - pos.z;
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
        
        if (distance < mouseInfluenceDistance) {
            // Calculate repulsion force
            const force = (mouseInfluenceDistance - distance) * mouseForce / distance;
            
            // Apply force
            particlesData[i].velocity.x += dx * force;
            particlesData[i].velocity.y += dy * force;
            particlesData[i].velocity.z += dz * force;
            
            // Limit velocity
            const maxVelocity = 2;
            const velocity = Math.sqrt(
                particlesData[i].velocity.x * particlesData[i].velocity.x +
                particlesData[i].velocity.y * particlesData[i].velocity.y +
                particlesData[i].velocity.z * particlesData[i].velocity.z
            );
            
            if (velocity > maxVelocity) {
                const scale = maxVelocity / velocity;
                particlesData[i].velocity.x *= scale;
                particlesData[i].velocity.y *= scale;
                particlesData[i].velocity.z *= scale;
            }
        }
    }
}

// Update colors based on theme
function updateThemeColors(isDark) {
    // Update particle colors
    const colors = particleSystem.geometry.attributes.color.array;
    const baseColor = isDark ? particleColorDark : particleColor;
    
    for (let i = 0; i < particleCount; i++) {
        const color = new THREE.Color(baseColor);
        color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.2);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
    }
    
    particleSystem.geometry.attributes.color.needsUpdate = true;
    
    // Update connection color
    scene.children[1].material.color.set(isDark ? connectionColorDark : connectionColor);
}

// Start animation when page is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize nano animation
    initNanoAnimation();
    
    // Add theme change listener
    document.getElementById('theme-toggle').addEventListener('click', () => {
        const isDark = document.body.classList.contains('dark-theme');
        updateThemeColors(isDark);
    });
    
    // Check initial theme
    if (localStorage.getItem('theme') === 'dark') {
        updateThemeColors(true);
    }
});