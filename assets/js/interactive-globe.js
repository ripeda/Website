/**
 * Interactive Globe with Country Labels
 * Professional Earth globe for Ripeda website showing supported regions
 */

class InteractiveGlobe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.earth = null;
        this.atmosphere = null;
        this.countryGroup = null;

        // Globe configuration
        this.globeRadius = 2.2;
        this.rotationSpeed = 0.003;

        // Supported countries - add more here as business expands
        this.supportedCountries = ['CA', 'US', 'MX', 'CN'];
        this.countryMarkers = new Map();

        // Colors
        this.colors = {
            supported: 0x00ff88,
            atmosphere: 0x87CEEB
        };

        this.init();
    }

    async init() {
        this.setupScene();
        this.setupLighting();
        await this.createEarth();
        this.createCountryMarkers();
        this.animate();
        this.handleResize();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf4f9fe);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 6);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);

        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);

        // Main directional light (sun)
        const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
        sunLight.position.set(5, 3, 5);
        this.scene.add(sunLight);

        // Fill light (subtle)
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
        fillLight.position.set(-5, -1, -2);
        this.scene.add(fillLight);
    }

    async createEarth() {
        // Create Earth sphere
        const earthGeometry = new THREE.SphereGeometry(this.globeRadius, 64, 32);

        // Use NASA Blue Marble texture (public domain)
        try {
            const textureLoader = new THREE.TextureLoader();
            const earthTexture = await this.loadTexture(textureLoader, 'https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg');

            const earthMaterial = new THREE.MeshPhongMaterial({
                map: earthTexture,
                shininess: 50
            });

            this.earth = new THREE.Mesh(earthGeometry, earthMaterial);

        } catch (error) {
            // Simple solid color fallback if texture fails
            const earthMaterial = new THREE.MeshPhongMaterial({
                color: 0x1e3a5f, // Ocean blue
                shininess: 50
            });
            this.earth = new THREE.Mesh(earthGeometry, earthMaterial);
        }

        // Set optimal rotation to show North America and supported regions
        this.earth.rotation.set(0.285, 28.261, 0.000);

        this.scene.add(this.earth);

        // Add atmosphere glow
        this.createAtmosphere();
    }

    loadTexture(loader, url) {
        return new Promise((resolve, reject) => {
            loader.load(url, resolve, undefined, reject);
        });
    }

    createAtmosphere() {
        // Subtle atmosphere glow
        const atmosphereGeometry = new THREE.SphereGeometry(this.globeRadius * 1.02, 32, 16);
        const atmosphereMaterial = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.FrontSide,
            blending: THREE.AdditiveBlending,
            uniforms: {
                glowColor: { value: new THREE.Color(this.colors.atmosphere) },
                intensity: { value: 0.1 }
            },
            vertexShader: `
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vPosition = position;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying vec3 vNormal;
                varying vec3 vPosition;
                void main() {
                    vec3 viewDirection = normalize(cameraPosition - vPosition);
                    float rim = 1.0 - max(0.0, dot(viewDirection, vNormal));
                    float alpha = pow(rim, 2.0) * intensity;
                    gl_FragColor = vec4(glowColor, alpha);
                }
            `
        });

        this.atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
        this.atmosphere.rotation.set(0.285, 28.261, 0.000);
        this.scene.add(this.atmosphere);
    }

    createCountryMarkers() {
        this.countryGroup = new THREE.Group();
        this.countryGroup.rotation.set(0.285, 28.261, 0.000);
        this.scene.add(this.countryGroup);

        // ====== SUPPORTED COUNTRIES ======
        // To expand: Add country code to supportedCountries array above,
        // then add country details here with lat/lon coordinates
        const countries = [
            { code: 'CA', lat: 56.1304, lon: -106.3468, name: 'Canada' },
            { code: 'US', lat: 39.8283, lon: -98.5795, name: 'United States' },
            { code: 'MX', lat: 23.6345, lon: -102.5528, name: 'Mexico' },
            { code: 'CN', lat: 35.8617, lon: 104.1954, name: 'China' }
            // Add more countries here as business expands
        ];

        countries.forEach(country => {
            const position = this.latLonToSphere(country.lat, country.lon);

            // Create ring marker (green cheerios)
            const ringGeometry = new THREE.RingGeometry(0.025, 0.055, 16);
            const ringMaterial = new THREE.MeshBasicMaterial({
                color: this.colors.supported,
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });

            const ring = new THREE.Mesh(ringGeometry, ringMaterial);
            ring.position.copy(position);
            ring.lookAt(new THREE.Vector3(0, 0, 0));

            ring.userData = {
                countryCode: country.code,
                name: country.name
            };

            this.countryGroup.add(ring);
            this.countryMarkers.set(country.code, ring);
        });
    }

    createCountryLabel(countryName, position) {
        // Create canvas for text
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 64;

        // Configure text style
        context.fillStyle = '#1d4ed8';
        context.font = 'bold 28px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';

        // Add text with strong white outline for visibility
        context.strokeStyle = '#ffffff';
        context.lineWidth = 4;
        context.strokeText(countryName, canvas.width / 2, canvas.height / 2);
        context.fillText(countryName, canvas.width / 2, canvas.height / 2);

        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        texture.needsUpdate = true;

        // Create sprite (always faces camera)
        const spriteMaterial = new THREE.SpriteMaterial({
            map: texture,
            transparent: true,
            opacity: 0.9
        });

        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5, 0.125, 1);

        // Position the label slightly outward from the ring
        const labelPosition = position.clone().normalize().multiplyScalar(this.globeRadius * 1.08);
        sprite.position.copy(labelPosition);

        this.countryGroup.add(sprite);
    }

    latLonToSphere(lat, lon) {
        // Convert latitude/longitude to 3D sphere coordinates
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(this.globeRadius * 1.02) * Math.sin(phi) * Math.cos(theta);
        const z = (this.globeRadius * 1.02) * Math.sin(phi) * Math.sin(theta);
        const y = (this.globeRadius * 1.02) * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Constant auto-rotation around Y axis
        this.earth.rotation.y += this.rotationSpeed;
        this.atmosphere.rotation.y += this.rotationSpeed;
        this.countryGroup.rotation.y += this.rotationSpeed;

        this.renderer.render(this.scene, this.camera);
    }

    handleResize() {
        const handleResize = () => {
            const width = this.container.clientWidth;
            const height = this.container.clientHeight;

            this.camera.aspect = width / height;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(width, height);
        };

        window.addEventListener('resize', handleResize);
        handleResize();
    }
}

// Initialize globe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const globeContainer = document.getElementById('globeContainer');
    if (globeContainer) {
        const globe = new InteractiveGlobe('globeContainer');
        window.interactiveGlobe = globe;
    }
});