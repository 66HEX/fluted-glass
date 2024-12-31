'use client'

import FlutedGlass from "@/app/Components/FlutedGlass/flutedGlass";
import Sphere from "@/app/Components/Sphere/sphere";
import {Canvas, useFrame, useThree} from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import {useEffect, useLayoutEffect} from 'react';

function FrameLimiter({ fps }) {
    const set = useThree((state) => state.set);
    const get = useThree((state) => state.get);
    const advance = useThree((state) => state.advance);
    const frameloop = useThree((state) => state.frameloop);

    useLayoutEffect(() => {
        const initFrameloop = get().frameloop;

        return () => {
            set({ frameloop: initFrameloop });
        };
    }, []);

    useFrame((state) => {
        if (state.get().blocked) return;
        state.set({ blocked: true });

        setTimeout(() => {
            state.set({ blocked: false });

            state.advance();
        }, Math.max(0, 1000 / fps - state.clock.getDelta()));
    });

    useEffect(() => {
        if (frameloop !== 'never') {
            set({ frameloop: 'never' });
            advance();
        }
    }, [frameloop]);

    return null;
}

const Scene = () => {
    const aspectRatio = window.innerWidth / window.innerHeight;
    const frustumSize = 5;

    return (
        <div className="h-screen w-full">
            <Canvas className="bg-black">
                <FrameLimiter fps={30} />
                <OrthographicCamera
                    makeDefault
                    position={[0, 0, 2]}
                    zoom={4}
                    left={-frustumSize * aspectRatio / 2}
                    right={frustumSize * aspectRatio / 2}
                    top={frustumSize / 2}
                    bottom={-frustumSize / 2}
                    near={-1000}
                    far={1000}
                />

                <OrbitControls />

                <group position={[-1, 1.1, 0]}>
                    <FlutedGlass />
                    <Sphere />
                </group>

            </Canvas>
        </div>
    );
};

export default Scene;