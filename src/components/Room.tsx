import React from 'react';
import * as THREE from 'three';
import { useTexture } from '@react-three/drei';
import { Geometry, Base, Subtraction } from '@react-three/csg';
import type { FurnitureItem } from '../types';
import { useRoomStore } from '../store';

const FLOOR_COLOR = '#e2e8f0';

export default function Room() {
  const dimensions = useRoomStore((state) => state.dimensions);
  const wallColor = useRoomStore((state) => state.wallColor);
  const floorColor = useRoomStore((state) => state.floorColor);
  const lightColor = useRoomStore((state) => state.lightColor);
  const ceilingLightIntensity = useRoomStore((state) => state.ceilingLightIntensity);
  const items = useRoomStore((state) => state.items);
  const floorTex = useTexture('/textures/floor.png?v=2');
  React.useMemo(() => {
    floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping;
    floorTex.repeat.set(dimensions.width / 0.6, dimensions.length / 0.6);
    floorTex.colorSpace = THREE.SRGBColorSpace;
  }, [floorTex, dimensions.width, dimensions.length]);

  const { width: w, length: l, height: h } = dimensions;
  const t = 0.5; // Wall thickness

  const cutouts = items.filter((i) => i.type === 'window' || i.type === 'door');

  const RecessedLight = ({ pos }: { pos: [number, number, number] }) => (
    <group position={pos}>
      {/* Outer trim (metal/white plastic ring) */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <ringGeometry args={[0.08, 0.12, 32]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.3} metalness={0.2} />
      </mesh>

      {/* The bulb / inner glow */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[0.07, 0.07, 0.01, 32]} />
        <meshBasicMaterial color={lightColor} />
      </mesh>

      {/* The actual light source */}
      <spotLight
        position={[0, -0.1, 0]}
        color={lightColor}
        intensity={ceilingLightIntensity}
        distance={w + l}
        angle={Math.PI / 5}
        penumbra={0.6}
        castShadow
      >
        <object3D position={[0, -1, 0]} attach="target" />
      </spotLight>
    </group>
  );

  // Helper to draw a wall with translucent outside and opaque inside, using CSG to cut window holes
  const Wall = ({
    boxPos,
    boxArgs,
    planePos,
    planeRot,
    planeArgs,
    color,
    materialProps = {},
  }: any) => (
    <group>
      {/* Translucent thick body */}
      <mesh>
        <Geometry useGroups={false}>
          <Base position={boxPos}>
            <boxGeometry args={boxArgs} />
          </Base>
          {cutouts.map((cut) => {
            const isDoor = cut.type === 'door';
            const cutW = cut.size[0] - (isDoor ? 0.02 : 0.05);
            const cutH = isDoor ? cut.size[1] + 0.1 : cut.size[1] - 0.05;
            const cutY = isDoor ? cut.position[1] - 0.05 : cut.position[1];

            return (
              <Subtraction
                key={cut.id}
                position={[cut.position[0], cutY, cut.position[2]]}
                rotation={cut.rotation as [number, number, number]}
              >
                <boxGeometry args={[cutW, cutH, 1.5]} />
              </Subtraction>
            );
          })}
        </Geometry>
        <meshStandardMaterial
          color={color}
          transparent
          opacity={0.15}
          depthWrite={false}
        />
      </mesh>

      {/* Opaque inner face */}
      <mesh receiveShadow>
        <Geometry useGroups={false}>
          <Base position={planePos} rotation={planeRot}>
            <planeGeometry args={planeArgs} />
          </Base>
          {cutouts.map((cut) => {
            const isDoor = cut.type === 'door';
            const cutW = cut.size[0] - (isDoor ? 0.02 : 0.05);
            const cutH = isDoor ? cut.size[1] + 0.1 : cut.size[1] - 0.05;
            const cutY = isDoor ? cut.position[1] - 0.05 : cut.position[1];

            return (
              <Subtraction
                key={cut.id}
                position={[cut.position[0], cutY, cut.position[2]]}
                rotation={cut.rotation as [number, number, number]}
              >
                <boxGeometry args={[cutW, cutH, 1.5]} />
              </Subtraction>
            );
          })}
        </Geometry>
        <meshStandardMaterial color={color} roughness={0.9} {...materialProps} />
      </mesh>
    </group>
  );

  return (
    <group>
      {/* Floor */}
      <mesh
        receiveShadow
        position={[0, -0.05, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <planeGeometry args={[w, l]} />
        <meshPhysicalMaterial 
          map={floorTex} 
          color={floorColor} 
          roughness={0.6} 
          metalness={0} 
          clearcoat={1.0} 
          clearcoatRoughness={0.1}
          emissive={floorColor}
          emissiveIntensity={0.5} 
        />
      </mesh>

      {/* Ceiling */}
      <Wall
        boxPos={[0, h + t / 2, 0]}
        boxArgs={[w + t * 2, t, l + t * 2]}
        planePos={[0, h, 0]}
        planeRot={[Math.PI / 2, 0, 0]}
        planeArgs={[w, l]}
        color="#ffffff"
        materialProps={{ emissive: '#ffffff', emissiveIntensity: 0.5 }}
      />

      {/* Back Wall */}
      <Wall
        boxPos={[0, h / 2, -l / 2 - t / 2]}
        boxArgs={[w + t * 2, h, t]}
        planePos={[0, h / 2, -l / 2]}
        planeRot={[0, 0, 0]}
        planeArgs={[w, h]}
        color={wallColor}
      />

      {/* Front Wall */}
      <Wall
        boxPos={[0, h / 2, l / 2 + t / 2]}
        boxArgs={[w + t * 2, h, t]}
        planePos={[0, h / 2, l / 2]}
        planeRot={[0, Math.PI, 0]}
        planeArgs={[w, h]}
        color={wallColor}
      />

      {/* Left Wall */}
      <Wall
        boxPos={[-w / 2 - t / 2, h / 2, 0]}
        boxArgs={[t, h, l]}
        planePos={[-w / 2, h / 2, 0]}
        planeRot={[0, Math.PI / 2, 0]}
        planeArgs={[l, h]}
        color={wallColor}
      />

      {/* Right Wall */}
      <Wall
        boxPos={[w / 2 + t / 2, h / 2, 0]}
        boxArgs={[t, h, l]}
        planePos={[w / 2, h / 2, 0]}
        planeRot={[0, -Math.PI / 2, 0]}
        planeArgs={[l, h]}
        color={wallColor}
      />

      {/* Ceiling Lights (4 corners) */}
      <RecessedLight pos={[-w / 2 + 0.5, h, -l / 2 + 0.5]} />
      <RecessedLight pos={[w / 2 - 0.5, h, -l / 2 + 0.5]} />
      <RecessedLight pos={[-w / 2 + 0.5, h, l / 2 - 0.5]} />
      <RecessedLight pos={[w / 2 - 0.5, h, l / 2 - 0.5]} />
    </group>
  );
}
