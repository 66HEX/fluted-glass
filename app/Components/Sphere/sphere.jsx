import React from "react";
import {folder, useControls} from "leva";
import {useFrame} from "@react-three/fiber";
import * as THREE from 'three';

export default function Sphere() {
    const meshRef = React.useRef();
    const materialRef = React.useRef();
    const glowRef = React.useRef();
    const startPosition = { x: 0.6, y: -1.2 };

    const {
        baseRed,
        baseGreen,
        baseBlue,
        blueGlowIntensity,
        glowSpeed,
        metalness,
        roughness,
        emissiveIntensity,
        sphereSize,
        segments,
        glowOpacity
    } = useControls('Sphere', {
        colors: folder({
            baseRed: { value: 1, min: 0, max: 1, step: 0.1 },
            baseGreen: { value: 0.3, min: 0, max: 1, step: 0.1 },
            baseBlue: { value: 0.1, min: 0, max: 1, step: 0.1 },
            blueGlowIntensity: { value: 0.1, min: 0, max: 2, step: 0.1 },
            glowSpeed: { value: 0.5, min: 0.1, max: 2, step: 0.1 }
        }),
        material: folder({
            metalness: { value: 0, min: 0, max: 1, step: 0.1 },
            roughness: { value: 0, min: 0, max: 1, step: 0.1 },
            emissiveIntensity: { value: 2, min: 0, max: 2, step: 0.05 },
            glowOpacity: { value: 0.3, min: 0, max: 1, step: 0.05 }
        }),
        geometry: folder({
            sphereSize: { value: 0.3, min: 0.1, max: 1, step: 0.1 },
            segments: { value: 8, min: 8, max: 64, step: 1 }
        })
    });

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();

        if (meshRef.current) {
            const xAmplitude = 0.4;
            const yAmplitude = 0.2;

            const xMovement = Math.sin(time * 0.07) * xAmplitude;
            const yMovement = Math.cos(time * 0.05) * yAmplitude;

            meshRef.current.position.x = startPosition.x + xMovement;
            meshRef.current.position.y = startPosition.y + yMovement;
            meshRef.current.position.z = -1;
        }

        const r = baseRed + Math.sin(time * 0.15) * 0.1;
        const g = baseGreen + Math.sin(time * 0.25) * 0.15;
        const b = baseBlue + Math.sin(time * 0.35) * 0.05;

        if (materialRef.current) {
            materialRef.current.emissive.setRGB(r * 0.5, g * 0.3, b * 0.2);
            materialRef.current.color.setRGB(r, g, b);
            materialRef.current.emissiveIntensity = emissiveIntensity + Math.sin(time * 0.4) * 0.5;
        }

        if (glowRef.current) {
            glowRef.current.position.copy(meshRef.current.position);
            glowRef.current.rotation.copy(meshRef.current.rotation);
        }

        if (materialRef.current) {
            const blueGlow = Math.sin(time * glowSpeed) * blueGlowIntensity;
            materialRef.current.emissive.setRGB(r * 0.5 + 0, g * 0.3 + 0, b * 0.2 + blueGlow);
            materialRef.current.color.setRGB(r, g, b);
            materialRef.current.emissiveIntensity = emissiveIntensity + Math.sin(time * 0.4) * 0.5;
        }
    });

    return (
        <group>
            <mesh ref={meshRef} position={[0, 0, -2]}>
                <sphereGeometry args={[sphereSize, segments, segments]}/>
                <meshStandardMaterial
                    ref={materialRef}
                    metalness={metalness}
                    roughness={roughness}
                    emissive="#ff4400"
                    emissiveIntensity={emissiveIntensity}
                />
            </mesh>
            <mesh position={[0, 0, -2]} ref={glowRef}>
                <sphereGeometry args={[sphereSize * 1.5, segments, segments]}/>
                <meshStandardMaterial
                    transparent={true}
                    opacity={glowOpacity}
                    emissive="#0044ff"
                    emissiveIntensity={blueGlowIntensity}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}