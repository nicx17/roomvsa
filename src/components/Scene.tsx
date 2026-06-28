import React from 'react';
import { Canvas } from '@react-three/fiber';
import {
  OrbitControls,
  Environment,
  ContactShadows,
  Lightformer,
} from '@react-three/drei';
import Room from './Room';
import Furniture from './Furniture';
import { useRoomStore } from '../store';

export default function Scene() {
  const dimensions = useRoomStore((state) => state.dimensions);
  const envLightIntensity = useRoomStore((state) => state.envLightIntensity);
  const setSelectedId = useRoomStore((state) => state.setSelectedId);

  const cameraZ = Math.max(dimensions.length + 5, 8);
  const cameraY = dimensions.height;
  const maxDim = Math.max(
    dimensions.width,
    dimensions.length,
    dimensions.height,
  );
  const shadowSize = maxDim * 1.5;

  return (
    <Canvas
      camera={{
        position: [0, cameraY, cameraZ],
        fov: 50,
        far: Math.max(2000, maxDim * 3),
      }}
      shadows
      dpr={[1, 1.5]}
      onPointerMissed={() => setSelectedId(null)}
    >
      <color attach="background" args={['#f0f4f8']} />

      <ambientLight intensity={envLightIntensity} />
      <directionalLight
        position={[maxDim, maxDim * 1.5, maxDim]}
        intensity={envLightIntensity * 2}
        castShadow
        shadow-mapSize={2048} // increased for larger potential rooms
        shadow-camera-far={maxDim * 3}
        shadow-camera-left={-shadowSize}
        shadow-camera-right={shadowSize}
        shadow-camera-top={shadowSize}
        shadow-camera-bottom={-shadowSize}
      />

      <Environment resolution={256}>
        <group rotation={[-Math.PI / 4, -0.3, 0]}>
          <Lightformer
            intensity={4}
            rotation-x={Math.PI / 2}
            position={[0, 5, -9]}
            scale={[10, 10, 1]}
          />
          <Lightformer
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, 1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={2}
            rotation-y={Math.PI / 2}
            position={[-5, -1, -1]}
            scale={[50, 2, 1]}
          />
          <Lightformer
            intensity={2}
            rotation-y={-Math.PI / 2}
            position={[10, 1, 0]}
            scale={[50, 2, 1]}
          />
        </group>
      </Environment>

      <group position={[0, 0, 0]}>
        <React.Suspense fallback={null}>
          <Room />
          <Furniture />
        </React.Suspense>
        <ContactShadows
          position={[0, -0.049, 0]}
          opacity={0.2}
          scale={20}
          blur={2.5}
          far={10}
        />
      </group>

      <OrbitControls
        enablePan={true}
        enableZoom={true}
        enableRotate={true}
        target={[0, dimensions.height / 2, 0]}
        maxDistance={maxDim * 4}
        minDistance={0.5}
        makeDefault
      />
    </Canvas>
  );
}
