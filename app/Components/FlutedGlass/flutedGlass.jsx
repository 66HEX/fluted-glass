import React, {useMemo} from "react";
import {useControls} from "leva";
import * as THREE from "three";
import {MeshTransmissionMaterial} from "@react-three/drei";

export default function FlutedGlass() {
    const [dimensions, setDimensions] = React.useState({ width: 1, height: 1 });

    React.useEffect(() => {
        const updateDimensions = () => {
            const aspectRatio = window.innerWidth / window.innerHeight;
            if (aspectRatio > 1) {
                setDimensions({
                    width: 2 * aspectRatio,
                    height: 2
                });
            } else {
                setDimensions({
                    width: 2,
                    height: 2 / aspectRatio
                });
            }
        };

        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => {
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

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
        thickness: { value: 1, min: 0, max: 1, step: 0.1 },
        roughness: { value: 0.4, min: 0, max: 1, step: 0.1 },
        transmission: { value: 1, min: 0, max: 1, step: 0.1 },
        ior: { value: 1.5, min: 1, max: 3, step: 0.1 },
        distortion: { value: 1, min: 0, max: 1, step: 0.1 },
        distortionScale: { value: 1, min: 0, max: 1, step: 0.1 },
        temporalDistortion: { value: 0.1, min: 0, max: 1, step: 0.1 },
        clearcoat: { value: 0, min: 0, max: 1, step: 0.1 },
        attenuationDistance: { value: 0.5, min: 0, max: 2, step: 0.1 },
        flutes: { value: 20, min: 5, max: 50, step: 1 },
        depth: { value: 0.2, min: 0.01, max: 0.2, step: 0.01 },
        curvature: { value: 0.5, min: 0.1, max: 0.5, step: 0.01 }
    });

    const geometry = useMemo(() => {
        const { width, height } = dimensions;
        const path = new THREE.Path();
        const fluteWidth = width / flutes;

        path.moveTo(-width / 2, 0);

        for (let i = 0; i < flutes; i++) {
            const x1 = (i * fluteWidth) - width / 2;
            const x2 = ((i + 1) * fluteWidth) - width / 2;

            const cp1x = x1 + fluteWidth * (1 - curvature);
            const cp1y = 0;
            const cp2x = x2 - fluteWidth * (1 - curvature);
            const cp2y = 0;

            path.bezierCurveTo(
                cp1x, cp1y,
                cp2x, cp2y,
                x2, depth
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
        geo.rotateY(Math.PI / 8);
        geo.rotateZ(Math.PI / 8);
        return geo;
    }, [flutes, depth, curvature, dimensions]);

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
                attenuationColor={'#ffffff'}
            />
        </mesh>
    );
}