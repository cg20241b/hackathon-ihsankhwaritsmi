import { useEffect, useRef } from "react";
import * as THREE from "three";
import { FontLoader, Font } from "three/examples/jsm/loaders/FontLoader.js";
import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import "./App.css";

function App() {
  const threeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!threeRef.current) return;

    // Create the scene
    const scene = new THREE.Scene();

    // Load HDR environment map
    const rgbeLoader = new RGBELoader();
    rgbeLoader.load("public/nighttime.hdr", (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping; // Set mapping
      scene.environment = texture; // Set the environment map
    });

    // Set up the camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 5;

    // Set up the renderer
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    threeRef.current.appendChild(renderer.domElement);

    const composer = new EffectComposer(renderer);
    // Handle window resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener("resize", handleResize);

    // Load the font
    const loader = new FontLoader();
    loader.load(
      "https://threejs.org/examples/fonts/helvetiker_regular.typeface.json",
      (font: Font) => {
        // Create text geometry for 'A'
        const textGeometryA = new TextGeometry("N", {
          font: font,
          size: 1,
          height: 0.2,
        });

        // Alphabet Material
        const alphabetMaterial = new THREE.MeshPhongMaterial({
          color: 0xf92d28, // Deep carmine pink
          specular: 0xffffff, // Low roughness for a shiny plastic look
          envMap: scene.environment,
        });
        const textMeshA = new THREE.Mesh(textGeometryA, alphabetMaterial);
        textMeshA.position.x = -2; // Position on the left side
        scene.add(textMeshA);

        // Create text geometry for '0'
        const textGeometry0 = new TextGeometry("1", {
          font: font,
          size: 1,
          height: 0.1,
        });

        // Digit Material
        const digitMaterial = new THREE.MeshStandardMaterial({
          color: 0x06d2d7, // Complementary color
          roughness: 0.2, // Low roughness for a shiny metallic look
          metalness: 1.0, // High metalness for metallic appearance
          envMap: scene.environment,
        });
        const textMesh0 = new THREE.Mesh(textGeometry0, digitMaterial);
        textMesh0.position.x = 1; // Position closer to the cube
        scene.add(textMesh0);

        // Create a glowing cube at the center with red emissive color
        const cubeGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5); // Smaller cube
        const cubeMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          emissive: 0xffffff,
          emissiveIntensity: 5, // Increase emissive intensity
        });
        const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cube.scale.set(0.4, 0.4, 0.4);
        scene.add(cube);

        // Add a point light at the cube's position with white color
        const pointLight = new THREE.PointLight(0xffffff, 10, 1000); // Increase distance and change color to white
        pointLight.position.copy(cube.position);
        scene.add(pointLight);

        // Set up post-processing for bloom effect
        const composer = new EffectComposer(renderer);
        const renderPass = new RenderPass(scene, camera);
        composer.addPass(renderPass);

        const bloomPass = new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          5.0, // Increase strength
          0.1, // Radius
          0.85 // Threshold
        );
        composer.addPass(bloomPass);

        // Handle keydown events for interactivity
        const handleKeyDown = (event: KeyboardEvent) => {
          switch (event.key) {
            case "w":
              cube.position.y += 0.1;
              break;
            case "s":
              cube.position.y -= 0.1;
              break;
            case "a":
              camera.position.x += 0.1;
              break;
            case "d":
              camera.position.x -= 0.1;
              break;
            case "q":
              cube.position.z += 0.1;
              break;
            case "e":
              cube.position.z -= 0.1;
              break;
          }
          // Update light position
          pointLight.position.copy(cube.position);
        };
        window.addEventListener("keydown", handleKeyDown);

        // Render the scene
        const animate = () => {
          requestAnimationFrame(animate);
          // Randomly rotate the cube
          cube.rotation.x += (Math.random() - 0.5) * 0.01; // Random rotation on the x-axis
          cube.rotation.y += (Math.random() - 0.5) * 0.01; // Random rotation on the y-axis
          cube.rotation.z += (Math.random() - 0.5) * 0.01; // Random rotation on the z-axis

          composer.render();
        };
        animate();

        // Clean up on component unmount
        return () => {
          window.removeEventListener("resize", handleResize);
          window.removeEventListener("keydown", handleKeyDown);
          if (threeRef.current) {
            threeRef.current.removeChild(renderer.domElement);
          }
        };
      }
    );
  }, []);

  return (
    <div
      ref={threeRef}
      style={{ width: "100%", height: "100vh", margin: 0, padding: 0 }}
    ></div>
  );
}

export default App;
