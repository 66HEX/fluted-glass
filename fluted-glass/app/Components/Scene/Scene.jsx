'use client'

import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Canvas, extend } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import { MeshTransmissionMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useControls } from 'leva';
import {Perf} from "r3f-perf";

const Sphere = () => {
    const meshRef = React.useRef();
    const materialRef = React.useRef();
    const mousePosition = React.useRef({ x: 0, y: 0 });
    const targetPosition = React.useRef({ x: 0, y: -1 });
    const lerpedPosition = React.useRef({ x: 0, y: -1 });
    const lerpSpeed = 0.08;

    React.useEffect(() => {
        const updateMousePosition = (e) => {

            mousePosition.current = {
                x: (e.clientX / window.innerWidth) * 2 - 1,
                y: (-(e.clientY / window.innerHeight) * 2 + 1) * 0.5 - 1
            };
        };

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    useFrame((state, delta) => {
        const time = state.clock.getElapsedTime();

        const lerp = (start, end, t) => start + (end - start) * t;
        const easing = 0.1;

        targetPosition.current.x = mousePosition.current.x;
        targetPosition.current.y = mousePosition.current.y;

        lerpedPosition.current.x += (targetPosition.current.x - lerpedPosition.current.x) * lerpSpeed;
        lerpedPosition.current.y += (targetPosition.current.y - lerpedPosition.current.y) * lerpSpeed;

        if (meshRef.current) {
            meshRef.current.position.x = lerp(
                meshRef.current.position.x,
                lerpedPosition.current.x,
                easing
            );
            meshRef.current.position.y = lerp(
                meshRef.current.position.y,
                lerpedPosition.current.y,
                easing
            );

            meshRef.current.position.z = -0.5;

            meshRef.current.rotation.x = Math.sin(time * 0.5) * 0.05;
            meshRef.current.rotation.z = Math.cos(time * 0.4) * 0.05;
        }

        const baseRed = 0.9;
        const baseGreen = 0.3;
        const baseBlue = 0.1;

        const r = baseRed + Math.sin(time * 0.3) * 0.1;
        const g = baseGreen + Math.sin(time * 0.5) * 0.15;
        const b = baseBlue + Math.sin(time * 0.7) * 0.05;

        if (materialRef.current) {
            materialRef.current.emissive.setRGB(r * 0.5, g * 0.3, b * 0.2);
            materialRef.current.color.setRGB(r, g, b);
            materialRef.current.emissiveIntensity = 1.5 + Math.sin(time * 0.4) * 0.5;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, -1, -2]}>
            <sphereGeometry args={[0.2, 32, 32]} />
            <meshStandardMaterial
                ref={materialRef}
                metalness={0.3}
                roughness={0.3}
                emissive="#ff4400"
                emissiveIntensity={1}
            />
        </mesh>
    );
};

const FlutedGlass = () => {
    const {
        samples,
        resolution,
        thickness,
        roughness,
        transmission,
        ior,
        distortion,
        distortionScale,
        temporalDistortion,
        clearcoat,
        attenuationDistance,
        flutes,
        depth,
        curvature
    } = useControls({
        samples: { value: 32, min: 1, max: 1024, step: 1 },
        resolution: { value: 256, min: 256, max: 2048, step: 256 },
        thickness: { value: 0.3, min: 0, max: 1, step: 0.1 },
        roughness: { value: 0.5, min: 0, max: 1, step: 0.1 },
        transmission: { value: 1, min: 0, max: 1, step: 0.1 },
        ior: { value: 1.5, min: 1, max: 3, step: 0.1 },
        distortion: { value: 1, min: 0, max: 1, step: 0.1 },
        distortionScale: { value: 1, min: 0, max: 1, step: 0.1 },
        temporalDistortion: { value: 0.1, min: 0, max: 1, step: 0.1 },
        clearcoat: { value: 0, min: 0, max: 1, step: 0.1 },
        attenuationDistance: { value: 0.5, min: 0, max: 2, step: 0.1 },
        flutes: { value: 20, min: 5, max: 50, step: 1 },
        depth: { value: 0.2, min: 0.01, max: 0.2, step: 0.01 },
        curvature: { value: 0.1, min: 0.1, max: 0.5, step: 0.01 }
    });

    const geometry = useMemo(() => {
        const width = 2;
        const height = 2;
        const path = new THREE.Path();
        const fluteWidth = width / flutes;

        path.moveTo(-width / 2, 0);

        for (let i = 0; i < flutes; i++) {
            const x1 = (i * fluteWidth) - width / 2;
            const x2 = ((i + 1) * fluteWidth) - width / 2;

            const cp1x = x1 + fluteWidth * curvature;
            const cp1y = depth;
            const cp2x = x2 - fluteWidth * curvature;
            const cp2y = depth;

            path.bezierCurveTo(
                cp1x, cp1y,
                cp2x, cp2y,
                x2, 0
            );
        }

        const shape = new THREE.Shape(path.getPoints(flutes * 10));

        const extrudeSettings = {
            steps: 1,
            depth: height,
            bevelEnabled: false
        };

        const geo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
        geo.rotateX(Math.PI / 2);
        geo.rotateY(Math.PI * 0.25);
        return geo;
    }, [flutes, depth, curvature]);

    return (
        <mesh geometry={geometry}>
            <MeshTransmissionMaterial
                samples={samples}
                resolution={resolution}
                thickness={thickness}
                roughness={roughness}
                transmission={transmission}
                ior={ior}
                distortion={distortion}
                distortionScale={distortionScale}
                temporalDistortion={temporalDistortion}
                clearcoat={clearcoat}
                attenuationDistance={attenuationDistance}
                backside={true}
            />
        </mesh>
    );
};

const Scene = () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 5;

    return (
        <div className="h-screen w-full">
            <Canvas className="bg-black">
                <Perf position="top-left" />
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 2]}
                    zoom={10}
                    left={-frustumSize * aspectRatio / 2}
                    right={frustumSize * aspectRatio / 2}
                    top={frustumSize / 2}
                    bottom={-frustumSize / 2}
                    near={-1000}
                    far={1000}
                />

                <primitive object={new THREE.AmbientLight('#ffffff', 0.5)} />
                <primitive object={new THREE.DirectionalLight('#ffffff', 1)} position={[5, 5, 5]} />

                <OrbitControls />

                <group position={[0.125, 1, 0]}>
                    <FlutedGlass />
                    <Sphere />
                </group>

            </Canvas>
        </div>
    );
};

export default Scene;