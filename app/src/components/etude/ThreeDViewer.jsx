import React, { Suspense } from 'react';
import { Canvas, useLoader } from '@react-three/fiber';
import { 
    OrbitControls, 
    Stage, 
    Center, 
    useGLTF, 
    Environment, 
    ContactShadows,
    Float,
    Html,
    useProgress
} from '@react-three/drei';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';

// Loader UI
const Loader = () => {
    const { progress } = useProgress();
    return (
        <Html center>
            <div style={{ 
                color: '#3182ce', 
                background: 'rgba(255,255,255,0.8)', 
                padding: '10px 20px', 
                borderRadius: '20px',
                fontWeight: 'bold',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                whiteSpace: 'nowrap'
            }}>
                Chargement {Math.round(progress)}%
            </div>
        </Html>
    );
};

// STL Component
const STLMesh = ({ url }) => {
    const geometry = useLoader(STLLoader, url);
    
    return (
        <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
            <mesh geometry={geometry} castShadow receiveShadow>
                <meshStandardMaterial 
                    color="#4a5568" 
                    metalness={0.8} 
                    roughness={0.2} 
                    envMapIntensity={1}
                />
            </mesh>
        </Float>
    );
};

// GLTF Component
const GLTFMesh = ({ url }) => {
    const { scene } = useGLTF(url);
    
    // Apply premium materials to all meshes in the scene
    scene.traverse((child) => {
        if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
                child.material.envMapIntensity = 1.5;
            }
        }
    });

    return (
        <Float speed={1.5} rotationIntensity={0.4} floatIntensity={0.4}>
            <primitive object={scene} />
        </Float>
    );
};

const ThreeDViewer = ({ fileUrl, fileType, height = '450px' }) => {
    if (!fileUrl) return null;

    const isSTL = fileType?.toLowerCase().includes('stl') || fileUrl.toLowerCase().endsWith('.stl');
    const isGLB = fileType?.toLowerCase().includes('glb') || fileType?.toLowerCase().includes('gltf') || 
                  fileUrl.toLowerCase().endsWith('.glb') || fileUrl.toLowerCase().endsWith('.gltf') ||
                  fileUrl.startsWith('data:application/octet-stream'); // Common for uploaded GLBs

    return (
        <div style={{ 
            width: '100%', 
            height, 
            backgroundColor: '#1a202c', // Dark professional background
            borderRadius: '16px', 
            border: '1px solid #2d3748', 
            position: 'relative', 
            overflow: 'hidden',
            boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
        }}>
            <Canvas shadows camera={{ position: [0, 0, 15], fov: 35 }}>
                <color attach="background" args={['#0f172a']} />
                
                <Suspense fallback={<Loader />}>
                    <Stage 
                        environment="city" 
                        intensity={0.6} 
                        contactShadow={{ opacity: 0.4, blur: 2 }}
                        adjustCamera
                    >
                        <Center>
                            {isSTL ? (
                                <STLMesh url={fileUrl} />
                            ) : (
                                <GLTFMesh url={fileUrl} />
                            )}
                        </Center>
                    </Stage>
                    <Environment preset="city" />
                    <ContactShadows 
                        position={[0, -2, 0]} 
                        opacity={0.4} 
                        scale={20} 
                        blur={2.4} 
                        far={4.5} 
                    />
                </Suspense>

                <OrbitControls 
                    makeDefault 
                    autoRotate 
                    autoRotateSpeed={0.5}
                    minPolarAngle={0} 
                    maxPolarAngle={Math.PI / 1.75} 
                    enableDamping
                />
            </Canvas>
            
            {/* UI Overlay */}
            <div style={{ 
                position: 'absolute', 
                top: '15px', 
                right: '15px', 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '5px' 
            }}>
                <div style={{ 
                    backgroundColor: 'rgba(255,255,255,0.1)', 
                    backdropFilter: 'blur(4px)',
                    color: 'white', 
                    padding: '4px 12px', 
                    borderRadius: '8px', 
                    fontSize: '11px',
                    fontWeight: '600',
                    border: '1px solid rgba(255,255,255,0.2)'
                }}>
                    VUE INTERACTIVE
                </div>
            </div>

            <div style={{ 
                position: 'absolute', 
                bottom: '15px', 
                left: '20px', 
                fontSize: '10px', 
                color: '#718096', 
                pointerEvents: 'none',
                textTransform: 'uppercase',
                letterSpacing: '0.05em'
            }}>
                Rotation : Clic Gauche | Pan : Clic Droit | Zoom : Roulette
            </div>
        </div>
    );
};

export default ThreeDViewer;
