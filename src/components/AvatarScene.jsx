import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, Grid } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../store/useStore';

// Dummy Stickman / Robot Avatar
const Avatar = () => {
    const groupRef = useRef();
    const { activeSection } = useStore();

    // Animation based on the currently selected section of the choreography
    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        switch (activeSection) {
            case 'intro':
                // Slow subtle breathing movement
                groupRef.current.position.y = Math.sin(time) * 0.1;
                groupRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
                break;
            case 'build-up':
                // Steady grooving
                groupRef.current.position.y = Math.sin(time * 3) * 0.2 + 0.1;
                groupRef.current.rotation.y = time % (Math.PI * 2);
                break;
            case 'climax':
                // Aggressive/Fast jumping & spinning
                groupRef.current.position.y = Math.abs(Math.sin(time * 8)) * 1.5;
                groupRef.current.rotation.x = Math.sin(time * 10) * 0.5;
                groupRef.current.rotation.y -= delta * 5;
                break;
            case 'outro':
                // Fading, settling down
                groupRef.current.position.y = THREE.MathUtils.lerp(groupRef.current.position.y, 0, 0.05);
                groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, 0, 0.05);
                groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 0.05);
                break;
            default:
                break;
        }
    });

    return (
        <group ref={groupRef} position={[0, 0, 0]}>
            {/* Head */}
            <mesh position={[0, 3, 0]}>
                <sphereGeometry args={[0.4, 32, 32]} />
                <meshStandardMaterial color="#c084fc" />
            </mesh>
            {/* Body */}
            <mesh position={[0, 1.5, 0]}>
                <capsuleGeometry args={[0.3, 1.5, 4, 16]} />
                <meshStandardMaterial color="#5b13ec" />
            </mesh>
            {/* Arms (abstract setup, not segmented for complex IK) */}
            <mesh position={[-0.6, 2, 0]} rotation={[0, 0, 0.3]}>
                <capsuleGeometry args={[0.1, 1, 4, 16]} />
                <meshStandardMaterial color="#818cf8" />
            </mesh>
            <mesh position={[0.6, 2, 0]} rotation={[0, 0, -0.3]}>
                <capsuleGeometry args={[0.1, 1, 4, 16]} />
                <meshStandardMaterial color="#818cf8" />
            </mesh>
        </group>
    );
};

const AvatarScene = () => {
    return (
        <Canvas camera={{ position: [0, 4, 8], fov: 45 }}>
            <ambientLight intensity={0.5} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
            <pointLight position={[-10, -10, -10]} intensity={0.5} />

            <Avatar />

            {/* Floor and Shadows */}
            <ContactShadows position={[0, -0.5, 0]} opacity={0.5} scale={10} blur={2} far={4} />

            {/* Grid for depth reference */}
            <Grid position={[0, -0.5, 0]} args={[20, 20]} cellColor="#ffffff" sectionColor="#5b13ec" sectionSize={2} cellSize={0.5} fadeDistance={20} />

            <OrbitControls enablePan={false} enableZoom={true} maxPolarAngle={Math.PI / 2} minPolarAngle={0} />
            <Environment preset="city" />
        </Canvas>
    );
};

export default AvatarScene;
