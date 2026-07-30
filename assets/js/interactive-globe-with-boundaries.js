/**
 * Interactive Globe with Country Boundaries
 * Displays a rotating 3D globe with country outlines instead of dot markers
 */

class InteractiveGlobe {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.globe = null;
        this.countryGroup = null;
        this.controls = null;

        // Globe configuration
        this.globeRadius = 2;
        this.rotationSpeed = 0.002;
        this.isRotating = true;

        // Country configuration
        this.supportedCountries = ['CA', 'US', 'MX', 'CN'];
        this.countryMeshes = new Map(); // Store country meshes for interaction

        // Colors
        this.colors = {
            globe: 0x1a1a2e,
            supported: 0x00ff88,
            other: 0x4a90e2,
            hover: 0xff6b6b,
            glow: 0x4a90e2
        };

        this.init();
    }

    async init() {
        this.setupScene();
        this.setupLighting();
        this.createGlobe();
        await this.loadCountryData();
        this.setupControls();
        this.setupEventListeners();
        this.animate();
        this.handleResize();
    }

    setupScene() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0a0a);

        // Camera
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
        this.camera.position.set(0, 0, 8);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

        this.container.appendChild(this.renderer.domElement);
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);

        // Main directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 3, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Fill light
        const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
        fillLight.position.set(-5, -3, -5);
        this.scene.add(fillLight);
    }

    createGlobe() {
        // Globe sphere
        const globeGeometry = new THREE.SphereGeometry(this.globeRadius, 64, 32);
        const globeMaterial = new THREE.MeshPhongMaterial({
            color: this.colors.globe,
            transparent: true,
            opacity: 0.8,
            shininess: 100
        });

        this.globe = new THREE.Mesh(globeGeometry, globeMaterial);
        this.globe.receiveShadow = true;
        this.scene.add(this.globe);

        // Create country group
        this.countryGroup = new THREE.Group();
        this.scene.add(this.countryGroup);

        // Add subtle glow effect
        this.addGlobeGlow();
    }

    addGlobeGlow() {
        const glowGeometry = new THREE.SphereGeometry(this.globeRadius * 1.05, 32, 16);
        const glowMaterial = new THREE.ShaderMaterial({
            transparent: true,
            side: THREE.BackSide,
            uniforms: {
                glowColor: { value: new THREE.Color(this.colors.glow) },
                intensity: { value: 0.3 }
            },
            vertexShader: `
                varying vec3 vNormal;
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform float intensity;
                varying vec3 vNormal;
                void main() {
                    float rim = 1.0 - dot(vNormal, vec3(0.0, 0.0, 1.0));
                    gl_FragColor = vec4(glowColor, rim * intensity);
                }
            `
        });

        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.scene.add(glow);
    }

    async loadCountryData() {
        try {
            // Load world countries GeoJSON data
            const response = await fetch('/assets/data/countries.geojson');
            const geojsonData = await response.json();

            this.processCountryData(geojsonData);
        } catch (error) {
            console.error('Error loading country data:', error);
            // Fallback to basic markers if GeoJSON fails
            this.createFallbackMarkers();
        }
    }

    processCountryData(geojsonData) {
        geojsonData.features.forEach(feature => {
            const countryCode = this.getCountryCode(feature);
            if (!countryCode) return;

            const isSupported = this.supportedCountries.includes(countryCode);
            const color = isSupported ? this.colors.supported : this.colors.other;

            // Create country outline from GeoJSON geometry
            const countryMesh = this.createCountryOutline(feature.geometry, color, countryCode);
            if (countryMesh) {
                this.countryGroup.add(countryMesh);
                this.countryMeshes.set(countryCode, countryMesh);
            }
        });
    }

    getCountryCode(feature) {
        // Try different common property names for country codes
        const props = feature.properties;
        return props.ISO_A2 || props.iso_a2 || props.ADM0_A3 ||
               props.adm0_a3 || props.CODE || props.code;
    }

    createCountryOutline(geometry, color, countryCode) {
        const group = new THREE.Group();
        group.userData = { countryCode, originalColor: color };

        if (geometry.type === 'Polygon') {
            this.addPolygonToGroup(geometry.coordinates, group, color);
        } else if (geometry.type === 'MultiPolygon') {
            geometry.coordinates.forEach(polygon => {
                this.addPolygonToGroup(polygon, group, color);
            });
        }

        return group.children.length > 0 ? group : null;
    }

    addPolygonToGroup(coordinates, group, color) {
        // Process each polygon ring (first is exterior, rest are holes)
        coordinates.forEach((ring, index) => {
            if (ring.length < 3) return; // Skip invalid rings

            const points = ring.map(coord => {
                return this.latLonToSphere(coord[1], coord[0]);
            });

            // Create line geometry for country outline
            const geometry = new THREE.BufferGeometry().setFromPoints(points);
            const material = new THREE.LineBasicMaterial({
                color: color,
                transparent: true,
                opacity: 0.8,
                linewidth: 1
            });

            const line = new THREE.Line(geometry, material);
            line.renderOrder = 1; // Render on top of globe
            group.add(line);
        });
    }

    latLonToSphere(lat, lon) {
        // Convert latitude/longitude to 3D sphere coordinates
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);

        const x = -(this.globeRadius * 1.001) * Math.sin(phi) * Math.cos(theta);
        const z = (this.globeRadius * 1.001) * Math.sin(phi) * Math.sin(theta);
        const y = (this.globeRadius * 1.001) * Math.cos(phi);

        return new THREE.Vector3(x, y, z);
    }

    createFallbackMarkers() {
        // Fallback country positions if GeoJSON fails
        const countries = [
            { code: 'CA', lat: 56.1304, lon: -106.3468, name: 'Canada' },
            { code: 'US', lat: 39.8283, lon: -98.5795, name: 'United States' },
            { code: 'MX', lat: 23.6345, lon: -102.5528, name: 'Mexico' },
            { code: 'CN', lat: 35.8617, lon: 104.1954, name: 'China' },
            { code: 'GB', lat: 55.3781, lon: -3.4360, name: 'United Kingdom' },
            { code: 'DE', lat: 51.1657, lon: 10.4515, name: 'Germany' },
            { code: 'FR', lat: 46.6034, lon: 1.8883, name: 'France' },
            { code: 'JP', lat: 36.2048, lon: 138.2529, name: 'Japan' },
            { code: 'AU', lat: -25.2744, lon: 133.7751, name: 'Australia' },
            { code: 'BR', lat: -14.2350, lon: -51.9253, name: 'Brazil' }
        ];

        countries.forEach(country => {
            const position = this.latLonToSphere(country.lat, country.lon);
            const isSupported = this.supportedCountries.includes(country.code);
            const color = isSupported ? this.colors.supported : this.colors.other;

            // Create a simple marker as fallback
            const geometry = new THREE.SphereGeometry(0.02, 8, 6);
            const material = new THREE.MeshPhongMaterial({
                color: color,
                transparent: true,
                opacity: 0.9
            });

            const marker = new THREE.Mesh(geometry, material);
            marker.position.copy(position);
            marker.userData = {
                countryCode: country.code,
                name: country.name,
                originalColor: color
            };

            this.countryGroup.add(marker);
            this.countryMeshes.set(country.code, marker);
        });
    }

    setupControls() {
        // Mouse/touch interaction for rotation control
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };
        let rotationVelocity = { x: 0, y: 0 };

        const onMouseDown = (event) => {
            isDragging = true;
            this.isRotating = false;
            previousMousePosition = {
                x: event.clientX || event.touches[0].clientX,
                y: event.clientY || event.touches[0].clientY
            };
        };

        const onMouseMove = (event) => {
            if (!isDragging) return;

            const currentPosition = {
                x: event.clientX || event.touches[0].clientX,
                y: event.clientY || event.touches[0].clientY
            };

            const deltaMove = {
                x: currentPosition.x - previousMousePosition.x,
                y: currentPosition.y - previousMousePosition.y
            };

            rotationVelocity = {
                x: deltaMove.y * 0.005,
                y: deltaMove.x * 0.005
            };

            this.globe.rotation.x += rotationVelocity.x;
            this.globe.rotation.y += rotationVelocity.y;
            this.countryGroup.rotation.x += rotationVelocity.x;
            this.countryGroup.rotation.y += rotationVelocity.y;

            previousMousePosition = currentPosition;
        };

        const onMouseUp = () => {
            isDragging = false;
            setTimeout(() => {
                this.isRotating = true;
            }, 1000);
        };

        // Mouse events
        this.renderer.domElement.addEventListener('mousedown', onMouseDown);
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);

        // Touch events
        this.renderer.domElement.addEventListener('touchstart', onMouseDown);
        document.addEventListener('touchmove', onMouseMove);
        document.addEventListener('touchend', onMouseUp);

        // Prevent context menu
        this.renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
    }

    setupEventListeners() {
        // Raycaster for country hover detection
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();

        const onMouseMove = (event) => {
            const rect = this.renderer.domElement.getBoundingClientRect();
            this.mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
            this.mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

            this.checkCountryHover();
        };

        this.renderer.domElement.addEventListener('mousemove', onMouseMove);
        this.renderer.domElement.addEventListener('click', () => this.handleCountryClick());
    }

    checkCountryHover() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Get all meshes from country groups
        const allMeshes = [];
        this.countryGroup.children.forEach(group => {
            if (group.children) {
                allMeshes.push(...group.children);
            } else {
                allMeshes.push(group);
            }
        });

        const intersects = this.raycaster.intersectObjects(allMeshes);

        // Reset all countries to original color
        this.countryMeshes.forEach((mesh, code) => {
            this.setCountryColor(mesh, mesh.userData.originalColor);
        });

        // Highlight hovered country
        if (intersects.length > 0) {
            const hoveredObject = intersects[0].object;
            const parentGroup = hoveredObject.parent;

            if (parentGroup && parentGroup.userData.countryCode) {
                this.setCountryColor(parentGroup, this.colors.hover);
                this.renderer.domElement.style.cursor = 'pointer';
            } else {
                this.renderer.domElement.style.cursor = 'default';
            }
        } else {
            this.renderer.domElement.style.cursor = 'default';
        }
    }

    setCountryColor(mesh, color) {
        if (mesh.children && mesh.children.length > 0) {
            // Country group with multiple lines
            mesh.children.forEach(child => {
                if (child.material) {
                    child.material.color.setHex(color);
                }
            });
        } else if (mesh.material) {
            // Single mesh
            mesh.material.color.setHex(color);
        }
    }

    handleCountryClick() {
        this.raycaster.setFromCamera(this.mouse, this.camera);

        const allMeshes = [];
        this.countryGroup.children.forEach(group => {
            if (group.children) {
                allMeshes.push(...group.children);
            } else {
                allMeshes.push(group);
            }
        });

        const intersects = this.raycaster.intersectObjects(allMeshes);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            const parentGroup = clickedObject.parent;

            if (parentGroup && parentGroup.userData.countryCode) {
                const countryCode = parentGroup.userData.countryCode;
                this.onCountrySelected(countryCode);
            }
        }
    }

    onCountrySelected(countryCode) {
        console.log(`Country selected: ${countryCode}`);

        // Flash the selected country
        const mesh = this.countryMeshes.get(countryCode);
        if (mesh) {
            const originalColor = mesh.userData.originalColor;
            this.setCountryColor(mesh, 0xffffff);

            setTimeout(() => {
                this.setCountryColor(mesh, originalColor);
            }, 200);
        }

        // Dispatch custom event
        const event = new CustomEvent('countrySelected', {
            detail: { countryCode }
        });
        document.dispatchEvent(event);
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

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotation
        if (this.isRotating) {
            this.globe.rotation.y += this.rotationSpeed;
            this.countryGroup.rotation.y += this.rotationSpeed;
        }

        this.renderer.render(this.scene, this.camera);
    }

    // Public methods for external control
    highlightCountry(countryCode, color = this.colors.hover) {
        const mesh = this.countryMeshes.get(countryCode);
        if (mesh) {
            this.setCountryColor(mesh, color);
        }
    }

    resetCountryColors() {
        this.countryMeshes.forEach((mesh, code) => {
            this.setCountryColor(mesh, mesh.userData.originalColor);
        });
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = speed;
    }

    toggleRotation() {
        this.isRotating = !this.isRotating;
    }
}

// Initialize globe when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const globeContainer = document.getElementById('globe-container');
    if (globeContainer) {
        const globe = new InteractiveGlobe('globe-container');

        // Make globe instance globally available
        window.interactiveGlobe = globe;

        // Example event listener for country selection
        document.addEventListener('countrySelected', (event) => {
            console.log(`Selected country: ${event.detail.countryCode}`);
        });
    }
});