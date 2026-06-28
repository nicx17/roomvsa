import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { useTexture, RoundedBox, TransformControls } from '@react-three/drei';
import type { FurnitureItem } from '../types';

import { useRoomStore } from '../store';

const ItemRenderer = ({
  item,
  isSelected,
  onSelect,
  updateItem,
  themeData,
  dimensions,
  windowTint,
  windowOpacity,
}: {
  item: FurnitureItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
  updateItem: (id: string, updates: Partial<FurnitureItem>) => void;
  themeData: any;
  dimensions: { width: number; length: number; height: number };
}) => {
  const [groupObj, setGroupObj] = useState<THREE.Group | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const doorHingeRef = useRef<THREE.Group>(null);
  const windowLeftHingeRef = useRef<THREE.Group>(null);
  const windowRightHingeRef = useRef<THREE.Group>(null);
  const wardrobeLeftHingeRef = useRef<THREE.Group>(null);
  const wardrobeRightHingeRef = useRef<THREE.Group>(null);

  const [isOpen, setIsOpen] = useState(false);

  const textures = useTexture({
    oak: '/textures/wood_oak.png',
    walnut: '/textures/wood_walnut.png',
    white: '/textures/wood_white.png',
    fabric: '/textures/fabric.png',
  });

  React.useMemo(() => {
    Object.values(textures).forEach((tex) => {
      tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
      tex.colorSpace = THREE.SRGBColorSpace;
    });
  }, [textures]);

  const activeWoodTexture =
    item.woodType === 'walnut'
      ? textures.walnut
      : item.woodType === 'white'
        ? textures.white
        : textures.oak;
  const woodColor = item.color || '#ffffff';

  useFrame((_, delta) => {
    if (doorHingeRef.current) {
      // Door swings inward (-90 degrees clockwise)
      const targetRotation = isOpen ? -Math.PI / 2 : 0;
      doorHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        doorHingeRef.current.rotation.y,
        targetRotation,
        delta * 6,
      );
    }
    if (windowLeftHingeRef.current) {
      // Left window sash swings outward (+60 degrees counter-clockwise)
      const targetRotation = isOpen ? Math.PI / 3 : 0;
      windowLeftHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        windowLeftHingeRef.current.rotation.y,
        targetRotation,
        delta * 6,
      );
    }
    if (windowRightHingeRef.current) {
      // Right window sash swings outward (-60 degrees clockwise)
      const targetRotation = isOpen ? -Math.PI / 3 : 0;
      windowRightHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        windowRightHingeRef.current.rotation.y,
        targetRotation,
        delta * 6,
      );
    }
    if (wardrobeLeftHingeRef.current) {
      // Left wardrobe door swings outward (-90 degrees clockwise)
      const targetRotation = isOpen ? -Math.PI / 2 : 0;
      wardrobeLeftHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        wardrobeLeftHingeRef.current.rotation.y,
        targetRotation,
        delta * 6,
      );
    }
    if (wardrobeRightHingeRef.current) {
      // Right wardrobe door swings outward (+90 degrees counter-clockwise)
      const targetRotation = isOpen ? Math.PI / 2 : 0;
      wardrobeRightHingeRef.current.rotation.y = THREE.MathUtils.lerp(
        wardrobeRightHingeRef.current.rotation.y,
        targetRotation,
        delta * 6,
      );
    }
  });

  const handleObjectChange = (e: any) => {
    const obj = e?.target?.object;
    if (obj) {
      const pos = obj.position;
      let [w, h, d] = item.size;

      // Swap width and depth if rotated ~90 degrees
      const rotY = Math.abs(item.rotation[1] % Math.PI);
      if (rotY > Math.PI / 4 && rotY < (3 * Math.PI) / 4) {
        const temp = w;
        w = d;
        d = temp;
      }

      const roomW = dimensions.width;
      const roomL = dimensions.length;
      const wallT = 0.5;

      const isFloorItem = [
        'wardrobe',
        'table',
        'pot',
        'bed',
        'chair',
        'door',
      ].includes(item.type);
      const floorY = h / 2;

      const minY = isFloorItem ? floorY : h / 2 + 0.001;
      const maxY = dimensions.height - h / 2 - 0.001;

      // Adjust for internal wall faces with a small offset to prevent Z-fighting
      let minX = -roomW / 2 + w / 2 + 0.005;
      let maxX = roomW / 2 - w / 2 - 0.005;

      let minZ = -roomL / 2 + d / 2 + 0.005;
      let maxZ = roomL / 2 - d / 2 - 0.005;

      // Allow windows and doors to recess 0.25m into the walls
      if (item.type === 'window' || item.type === 'door') {
        minX -= 0.25;
        maxX += 0.25;
        minZ -= 0.25;
        maxZ += 0.25;
      }

      if (isFloorItem) {
        pos.y = floorY;
      } else {
        if (pos.y < minY) pos.y = minY;
        if (pos.y > maxY) pos.y = maxY;
      }

      if (pos.x < minX) pos.x = minX;
      if (pos.x > maxX) pos.x = maxX;

      if (pos.z < minZ) pos.z = minZ;
      if (pos.z > maxZ) pos.z = maxZ;
    }
  };

  const handleClick = (e: any) => {
    e.stopPropagation();
    onSelect(item.id);
    if (item.type === 'wardrobe') {
      setIsOpen(!isOpen);
    }
  };

  const handleMouseUp = () => {
    if (groupObj) {
      const pos = groupObj.position;
      updateItem(item.id, { position: [pos.x, pos.y, pos.z] });
    }
  };

  const renderModel = () => {
    const [w, h, d] = item.size;
    switch (item.type) {
      case 'wardrobe':
        return (
          <group>
            {/* Main Body (Hollow) */}
            {/* Back Outer */}
            <mesh position={[0, 0, -d / 2 + 0.025]} castShadow receiveShadow>
              <boxGeometry args={[w, h, 0.05]} />
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.5}
              />
            </mesh>
            {/* Back Inner (White) */}
            <mesh position={[0, 0, -d / 2 + 0.051]} receiveShadow>
              <boxGeometry args={[w - 0.1, h - 0.1, 0.002]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>

            {/* Left Outer */}
            <mesh position={[-w / 2 + 0.025, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.05, h, d - 0.05]} />
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.5}
              />
            </mesh>
            {/* Left Inner (White) */}
            <mesh position={[-w / 2 + 0.051, 0, 0]} receiveShadow>
              <boxGeometry args={[0.002, h - 0.1, d - 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>

            {/* Right Outer */}
            <mesh position={[w / 2 - 0.025, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[0.05, h, d - 0.05]} />
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.5}
              />
            </mesh>
            {/* Right Inner (White) */}
            <mesh position={[w / 2 - 0.051, 0, 0]} receiveShadow>
              <boxGeometry args={[0.002, h - 0.1, d - 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>

            {/* Top Outer */}
            <mesh position={[0, h / 2 - 0.025, 0]} castShadow receiveShadow>
              <boxGeometry args={[w - 0.1, 0.05, d - 0.05]} />
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.5}
              />
            </mesh>
            {/* Top Inner (White) */}
            <mesh position={[0, h / 2 - 0.051, 0]} receiveShadow>
              <boxGeometry args={[w - 0.1, 0.002, d - 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>

            {/* Bottom Outer */}
            <mesh position={[0, -h / 2 + 0.025, 0]} castShadow receiveShadow>
              <boxGeometry args={[w - 0.1, 0.05, d - 0.05]} />
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.5}
              />
            </mesh>
            {/* Bottom Inner (White) */}
            <mesh position={[0, -h / 2 + 0.051, 0]} receiveShadow>
              <boxGeometry args={[w - 0.1, 0.002, d - 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>

            {/* Shelf (White) */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[w - 0.1, 0.05, d - 0.05]} />
              <meshStandardMaterial color="#ffffff" roughness={0.7} />
            </mesh>
            {/* Hanger Rod */}
            <mesh
              position={[0, h / 4, 0]}
              rotation={[0, 0, Math.PI / 2]}
              castShadow
              receiveShadow
            >
              <cylinderGeometry args={[0.015, 0.015, w - 0.1, 16]} />
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.2}
              />
            </mesh>

            {/* Wardrobe doors (left and right) */}
            <group
              ref={wardrobeLeftHingeRef}
              position={[-w / 2 + 0.05, 0, d / 2 - 0.02]}
            >
              <mesh position={[(w / 2 - 0.05) / 2, 0, 0]}>
                <boxGeometry args={[w / 2 - 0.05, h - 0.1, 0.04]} />
                {/* Outer Color */}
                <meshStandardMaterial
                  color={item.color || '#ffffff'}
                  map={activeWoodTexture}
                  roughness={0.4}
                />
              </mesh>
              {/* Inner Door Face (White) */}
              <mesh position={[(w / 2 - 0.05) / 2, 0, -0.021]}>
                <boxGeometry args={[w / 2 - 0.05, h - 0.1, 0.002]} />
                <meshStandardMaterial
                  color={item.color || '#ffffff'}
                  map={textures.fabric}
                  roughness={0.8}
                />
              </mesh>
              {/* Handle */}
              <mesh position={[w / 2 - 0.15, 0, 0.04]}>
                <cylinderGeometry args={[0.01, 0.01, 0.2, 16]} />
                <meshStandardMaterial
                  color={item.color || '#e2e8f0'}
                  map={textures.fabric}
                  roughness={0.8}
                />
              </mesh>
            </group>

            <group
              ref={wardrobeRightHingeRef}
              position={[w / 2 - 0.05, 0, d / 2 - 0.02]}
            >
              <mesh position={[-(w / 2 - 0.05) / 2, 0, 0]}>
                <boxGeometry args={[w / 2 - 0.05, h - 0.1, 0.04]} />
                {/* Outer Color */}
                <meshStandardMaterial
                  color={item.color || '#ffffff'}
                  map={activeWoodTexture}
                  roughness={0.4}
                />
              </mesh>
              {/* Inner Door Face (White) */}
              <mesh position={[-(w / 2 - 0.05) / 2, 0, -0.021]}>
                <boxGeometry args={[w / 2 - 0.05, h - 0.1, 0.002]} />
                <meshStandardMaterial
                  color={item.color || '#ffffff'}
                  map={textures.fabric}
                  roughness={0.8}
                />
              </mesh>
              {/* Handle */}
              <mesh position={[-(w / 2 - 0.15), 0, 0.04]}>
                <cylinderGeometry args={[0.01, 0.01, 0.2, 16]} />
                <meshStandardMaterial
                  color={item.color || '#e2e8f0'}
                  map={textures.fabric}
                  roughness={0.8}
                />
              </mesh>
            </group>
          </group>
        );
      case 'table':
        return (
          <group>
            <RoundedBox
              args={[w, 0.04, d]}
              radius={0.01}
              smoothness={4}
              castShadow
              receiveShadow
              position={[0, h / 2 - 0.02, 0]}
            >
              <meshStandardMaterial
                color={item.color || '#475569'}
                roughness={0.6}
              />
            </RoundedBox>
            {[-1, 1].map((x) =>
              [-1, 1].map((z) => (
                <mesh
                  key={`leg-${x}-${z}`}
                  castShadow
                  receiveShadow
                  position={[x * (w / 2 - 0.05), 0, z * (d / 2 - 0.05)]}
                >
                  <boxGeometry args={[0.04, h, 0.04]} />
                  {/* Wood legs instead of black */}
                  <meshStandardMaterial
                    color={item.color || '#5c4033'}
                    roughness={0.7}
                  />
                </mesh>
              )),
            )}
            {/* Left Drawer */}
            <group
              position={[-(w / 2 - 0.05) / 2 - 0.005, h / 2 - 0.1, d * 0.05]}
            >
              <mesh castShadow receiveShadow>
                <boxGeometry args={[w / 2 - 0.05, 0.12, d * 0.9]} />
                <meshStandardMaterial color="#334155" roughness={0.6} />
              </mesh>
            </group>

            {/* Right Drawer */}
            <group
              position={[(w / 2 - 0.05) / 2 + 0.005, h / 2 - 0.1, d * 0.05]}
            >
              <mesh castShadow receiveShadow>
                <boxGeometry args={[w / 2 - 0.05, 0.12, d * 0.9]} />
                <meshStandardMaterial color="#334155" roughness={0.6} />
              </mesh>
            </group>

            {/* Laptop */}
            <group position={[0, h / 2, 0.05]}>
              {/* Base */}
              <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
                <boxGeometry args={[0.35, 0.01, 0.25]} />
                <meshStandardMaterial
                  color="#cbd5e1"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
              {/* Screen */}
              <group position={[0, 0.01, -0.125]} rotation={[-0.2, 0, 0]}>
                <mesh castShadow receiveShadow position={[0, 0.1, 0]}>
                  <boxGeometry args={[0.35, 0.2, 0.01]} />
                  <meshStandardMaterial
                    color="#cbd5e1"
                    metalness={0.8}
                    roughness={0.2}
                  />
                </mesh>
                {/* Display Area */}
                <mesh position={[0, 0.1, 0.006]}>
                  <planeGeometry args={[0.33, 0.18]} />
                  <meshStandardMaterial
                    color="#000000"
                    emissive="#0284c7"
                    emissiveIntensity={0.5}
                    roughness={0.1}
                  />
                </mesh>
              </group>
              {/* Keyboard */}
              <mesh position={[0, 0.011, 0.02]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.3, 0.1]} />
                <meshStandardMaterial color="#1e293b" roughness={0.8} />
              </mesh>
              {/* Trackpad */}
              <mesh position={[0, 0.011, 0.09]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[0.1, 0.06]} />
                <meshStandardMaterial color="#94a3b8" roughness={0.5} />
              </mesh>
            </group>

            {/* Bookshelf Speakers */}
            {[-1, 1].map((side) => (
              <group
                key={`speaker-${side}`}
                position={[side * ((w / 2) * 0.58), h / 2 + 0.09, -d * 0.08]}
                rotation={[-0.05, 0, 0]}
              >
                {/* Speaker Box */}
                <RoundedBox
                  args={[0.1, 0.18, 0.14]}
                  radius={0.015}
                  smoothness={4}
                  castShadow
                  receiveShadow
                >
                  <meshStandardMaterial color="#111111" roughness={0.7} />
                </RoundedBox>
                {/* Woofer (Large) */}
                <mesh
                  position={[0, -0.03, 0.071]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.035, 0.035, 0.005, 32]} />
                  <meshStandardMaterial color="#222222" roughness={0.9} />
                </mesh>
                {/* Tweeter (Small) */}
                <mesh
                  position={[0, 0.05, 0.071]}
                  rotation={[Math.PI / 2, 0, 0]}
                >
                  <cylinderGeometry args={[0.015, 0.015, 0.005, 32]} />
                  <meshStandardMaterial color="#222222" roughness={0.9} />
                </mesh>
                {/* Logo (Yellow Leaf) */}
                <mesh position={[0.03, 0.06, 0.071]}>
                  <sphereGeometry args={[0.005, 16, 16]} />
                  <meshStandardMaterial color="#d9f99d" roughness={0.5} />
                </mesh>
              </group>
            ))}

            {/* Table Lamp (Right side) */}
            <group position={[(w / 2) * 0.8, h / 2, -d * 0.08]}>
              {/* Rim */}
              <mesh position={[0, 0.005, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.06, 0.06, 0.01, 32]} />
                <meshStandardMaterial color="#111111" roughness={0.8} />
              </mesh>
              {/* Cone Base */}
              <mesh position={[0, 0.025, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.01, 0.06, 0.03, 32]} />
                <meshStandardMaterial color="#111111" roughness={0.8} />
              </mesh>
              {/* Vertical Pole */}
              <mesh position={[0, 0.19, 0]} castShadow receiveShadow>
                <cylinderGeometry args={[0.006, 0.006, 0.3, 16]} />
                <meshStandardMaterial color="#111111" roughness={0.8} />
              </mesh>
              {/* Gooseneck Arc */}
              <mesh position={[-0.06, 0.34, 0]} castShadow receiveShadow>
                <torusGeometry args={[0.06, 0.006, 16, 32, Math.PI * 1.15]} />
                <meshStandardMaterial color="#111111" roughness={0.8} />
              </mesh>
              {/* Lamp Head Group */}
              <group
                position={[
                  -0.06 + 0.06 * Math.cos(Math.PI * 1.15),
                  0.34 + 0.06 * Math.sin(Math.PI * 1.15),
                  0,
                ]}
                rotation={[0, 0, Math.PI * 1.15]}
              >
                {/* Connector */}
                <mesh position={[0, 0.015, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.01, 0.007, 0.03, 16]} />
                  <meshStandardMaterial color="#111111" roughness={0.8} />
                </mesh>
                {/* Bell */}
                <mesh position={[0, 0.06, 0]} castShadow receiveShadow>
                  <cylinderGeometry args={[0.04, 0.01, 0.06, 32]} />
                  <meshStandardMaterial color="#111111" roughness={0.8} />
                </mesh>
                {/* Light Bulb / Glow */}
                <mesh position={[0, 0.09, 0]}>
                  <sphereGeometry args={[0.025, 16, 16]} />
                  {item.isOn !== false ? (
                    <meshStandardMaterial
                      color="#ffedd5"
                      emissive="#ffedd5"
                      emissiveIntensity={1}
                    />
                  ) : (
                    <meshStandardMaterial color="#333333" roughness={0.6} />
                  )}
                </mesh>
                {/* Point Light for the lamp */}
                {item.isOn !== false && (
                  <pointLight
                    position={[0, 0.1, 0]}
                    intensity={0.5}
                    distance={1.5}
                    color="#ffedd5"
                  />
                )}
              </group>
            </group>
          </group>
        );
      case 'pot':
        return (
          <group>
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <cylinderGeometry args={[w / 2, (w / 2) * 0.75, h, 32]} />
              <meshStandardMaterial
                color={item.color || '#a0522d'}
                roughness={0.8}
              />
            </mesh>
            <mesh castShadow position={[0, h / 2 + w / 2, 0]}>
              <sphereGeometry args={[(w / 2) * 1.5, 32, 32]} />
              <meshStandardMaterial color="#22c55e" roughness={0.9} />
            </mesh>
          </group>
        );
      case 'poster':
        return (
          <group>
            <mesh position={[0, 0, d / 2 + 0.01]}>
              <planeGeometry args={[w, h]} />
              <meshBasicMaterial map={themeData.texture} />
            </mesh>
            <mesh>
              <boxGeometry args={[w + 0.08, h + 0.08, d]} />
              <meshStandardMaterial color="#111827" roughness={0.8} />
            </mesh>
          </group>
        );
      case 'bed':
        const headboardH = h * 2.5;
        return (
          <group>
            <RoundedBox
              args={[w, h, d]}
              radius={0.05}
              smoothness={4}
              castShadow
              receiveShadow
              position={[0, 0, 0]}
            >
              <meshStandardMaterial color="#ffffff" roughness={0.9} />
            </RoundedBox>
            <RoundedBox
              args={[w + 0.02, h + 0.02, d * 0.6]}
              radius={0.04}
              smoothness={4}
              castShadow
              receiveShadow
              position={[0, 0.01, d * 0.2]}
            >
              <meshStandardMaterial
                color={item.secondaryColor || '#a0522d'}
                roughness={0.8}
              />
            </RoundedBox>
            <RoundedBox
              args={[w, headboardH, 0.1]}
              radius={0.02}
              smoothness={4}
              castShadow
              receiveShadow
              position={[0, headboardH / 2 - h / 2, -d / 2 + 0.05]}
            >
              <meshStandardMaterial
                color={item.color || '#ffffff'}
                map={activeWoodTexture}
                roughness={0.6}
              />
            </RoundedBox>
            <RoundedBox
              args={[w * 0.4, 0.1, 0.3]}
              radius={0.04}
              smoothness={4}
              castShadow
              receiveShadow
              position={[-w * 0.25, h / 2 + 0.05, -d / 2 + 0.3]}
            >
              <meshStandardMaterial
                color={item.tertiaryColor || '#f8fafc'}
                roughness={0.9}
              />
            </RoundedBox>
            <RoundedBox
              args={[w * 0.4, 0.1, 0.3]}
              radius={0.04}
              smoothness={4}
              castShadow
              receiveShadow
              position={[w * 0.25, h / 2 + 0.05, -d / 2 + 0.3]}
            >
              <meshStandardMaterial
                color={item.tertiaryColor || '#f8fafc'}
                roughness={0.9}
              />
            </RoundedBox>
          </group>
        );
      case 'door':
        const doorW = w - 0.1;
        const doorH = h - 0.05; // Less gap at the bottom
        const woodColor = '#2d1b11'; // Very dark brown wood
        return (
          <group scale={item.flipX ? [-1, 1, 1] : [1, 1, 1]}>
            {/* Outer Frame - Top */}
            <mesh castShadow receiveShadow position={[0, h / 2 - 0.025, 0]}>
              <boxGeometry args={[w, 0.05, d * 0.8]} />
              <meshStandardMaterial color={woodColor} roughness={0.8} />
            </mesh>
            {/* Outer Frame - Left */}
            <mesh castShadow receiveShadow position={[-w / 2 + 0.025, 0, 0]}>
              <boxGeometry args={[0.05, h, d * 0.8]} />
              <meshStandardMaterial color={woodColor} roughness={0.8} />
            </mesh>
            {/* Outer Frame - Right */}
            <mesh castShadow receiveShadow position={[w / 2 - 0.025, 0, 0]}>
              <boxGeometry args={[0.05, h, d * 0.8]} />
              <meshStandardMaterial color={woodColor} roughness={0.8} />
            </mesh>

            {/* Door Hinge Group (rotates around left frame) */}
            <group ref={doorHingeRef} position={[-w / 2 + 0.05, 0, 0]}>
              {/* Door Leaf (offset from hinge) */}
              <mesh
                castShadow
                receiveShadow
                position={[doorW / 2, -0.025, 0.01]}
              >
                <boxGeometry args={[doorW, doorH, d * 0.6]} />
                <meshStandardMaterial color={woodColor} roughness={0.7} />
              </mesh>

              {/* Panels (raised) */}
              {/* Top Left */}
              <mesh
                castShadow
                receiveShadow
                position={[doorW / 2 - doorW / 4, h * 0.2, d * 0.3 + 0.01]}
                rotation={[0, 0, 0]}
              >
                <boxGeometry args={[doorW * 0.35, h * 0.4, 0.02]} />
                <meshStandardMaterial color={woodColor} roughness={0.7} />
              </mesh>
              {/* Top Right */}
              <mesh
                castShadow
                receiveShadow
                position={[doorW / 2 + doorW / 4, h * 0.2, d * 0.3 + 0.01]}
                rotation={[0, 0, 0]}
              >
                <boxGeometry args={[doorW * 0.35, h * 0.4, 0.02]} />
                <meshStandardMaterial color={woodColor} roughness={0.7} />
              </mesh>
              {/* Bottom Left */}
              <mesh
                castShadow
                receiveShadow
                position={[doorW / 2 - doorW / 4, -h * 0.2, d * 0.3 + 0.01]}
                rotation={[0, 0, 0]}
              >
                <boxGeometry args={[doorW * 0.35, h * 0.3, 0.02]} />
                <meshStandardMaterial color={woodColor} roughness={0.7} />
              </mesh>
              {/* Bottom Right */}
              <mesh
                castShadow
                receiveShadow
                position={[doorW / 2 + doorW / 4, -h * 0.2, d * 0.3 + 0.01]}
                rotation={[0, 0, 0]}
              >
                <boxGeometry args={[doorW * 0.35, h * 0.3, 0.02]} />
                <meshStandardMaterial color={woodColor} roughness={0.7} />
              </mesh>

              {/* Door Handle */}
              <mesh position={[doorW - 0.1, 0, d * 0.3 + 0.03]} castShadow>
                <cylinderGeometry args={[0.02, 0.02, 0.15]} />
                <meshStandardMaterial
                  color="#94a3b8"
                  metalness={0.8}
                  roughness={0.2}
                />
              </mesh>
            </group>
          </group>
        );
      case 'ac':
        return (
          <group>
            {/* Main AC Body */}
            <RoundedBox
              args={[w, h, d]}
              radius={0.05}
              smoothness={4}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color="#ffffff"
                roughness={0.3}
                metalness={0.1}
              />
            </RoundedBox>
            {/* Vent at bottom front */}
            <mesh position={[0, -h / 2 + 0.04, d / 2 + 0.01]}>
              <boxGeometry args={[w * 0.8, 0.04, 0.02]} />
              <meshStandardMaterial color="#1f2937" roughness={0.8} />
            </mesh>
            {/* Vent lines */}
            <mesh position={[0, -h / 2 + 0.04, d / 2 + 0.02]}>
              <boxGeometry args={[w * 0.8, 0.005, 0.02]} />
              <meshStandardMaterial color="#4b5563" roughness={0.8} />
            </mesh>
            {/* LED display */}
            <mesh position={[w / 2 - 0.15, 0, d / 2 + 0.01]}>
              <planeGeometry args={[0.08, 0.04]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>
        );
      case 'tv':
        return (
          <group>
            {/* TV Screen / Bezel Outer */}
            <mesh castShadow receiveShadow position={[0, 0, 0]}>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial
                color="#0f172a"
                metalness={0.9}
                roughness={0.3}
              />
            </mesh>
            {/* TV Display Panel */}
            <mesh position={[0, 0, d / 2 + 0.001]}>
              <planeGeometry args={[w - 0.02, h - 0.02]} />
              {/* Glossy dark screen with subtle emissive glow to simulate a backlight bleed or deep blacks */}
              <meshStandardMaterial
                color="#000000"
                metalness={0.8}
                roughness={0.1}
                emissive="#020617"
                emissiveIntensity={0.5}
              />
            </mesh>
            {/* LED indicator */}
            <mesh position={[w / 2 - 0.05, -h / 2 + 0.01, d / 2 + 0.002]}>
              <planeGeometry args={[0.01, 0.005]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
          </group>
        );
      case 'window':
        const sashW = w / 2 - 0.05;
        return (
          <group>
            {/* Fixed Outer Frame - Top */}
            <mesh castShadow receiveShadow position={[0, h / 2 - 0.025, 0]}>
              <boxGeometry args={[w, 0.05, d]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
            </mesh>
            {/* Fixed Outer Frame - Bottom */}
            <mesh castShadow receiveShadow position={[0, -h / 2 + 0.025, 0]}>
              <boxGeometry args={[w, 0.05, d]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
            </mesh>
            {/* Fixed Outer Frame - Left */}
            <mesh castShadow receiveShadow position={[-w / 2 + 0.025, 0, 0]}>
              <boxGeometry args={[0.05, h - 0.1, d]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
            </mesh>
            {/* Fixed Outer Frame - Right */}
            <mesh castShadow receiveShadow position={[w / 2 - 0.025, 0, 0]}>
              <boxGeometry args={[0.05, h - 0.1, d]} />
              <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
            </mesh>

            {/* Left Sash (Hinged) */}
            <group ref={windowLeftHingeRef} position={[-w / 2 + 0.05, 0, 0]}>
              {/* Glass panel */}
              <mesh position={[sashW / 2, 0, 0]}>
                <boxGeometry args={[sashW, h - 0.1, d * 0.4]} />
                <meshStandardMaterial
                  color={windowTint}
                  transparent={true}
                  opacity={windowOpacity}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
              {/* Vertical Sash Mullion (Center Grid) */}
              <mesh position={[sashW / 2, 0, 0]}>
                <boxGeometry args={[0.03, h - 0.1, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              {/* Vertical Sash Mullion (Meeting Edge) */}
              <mesh position={[sashW - 0.015, 0, 0]}>
                <boxGeometry args={[0.03, h - 0.1, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              {/* Horizontal Sash Mullions */}
              <mesh position={[sashW / 2, h / 4, 0]}>
                <boxGeometry args={[sashW, 0.03, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              <mesh position={[sashW / 2, 0, 0]}>
                <boxGeometry args={[sashW, 0.03, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              <mesh position={[sashW / 2, -h / 4, 0]}>
                <boxGeometry args={[sashW, 0.03, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
            </group>

            {/* Right Sash (Hinged) */}
            <group ref={windowRightHingeRef} position={[w / 2 - 0.05, 0, 0]}>
              {/* Glass panel */}
              <mesh position={[-sashW / 2, 0, 0]}>
                <boxGeometry args={[sashW, h - 0.1, d * 0.4]} />
                <meshStandardMaterial
                  color={windowTint}
                  transparent={true}
                  opacity={windowOpacity}
                  metalness={0.9}
                  roughness={0.1}
                />
              </mesh>
              {/* Vertical Sash Mullion (Center Grid) */}
              <mesh position={[-sashW / 2, 0, 0]}>
                <boxGeometry args={[0.03, h - 0.1, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              {/* Vertical Sash Mullion (Meeting Edge) */}
              <mesh position={[-sashW + 0.015, 0, 0]}>
                <boxGeometry args={[0.03, h - 0.1, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              {/* Horizontal Sash Mullions */}
              <mesh position={[-sashW / 2, h / 4, 0]}>
                <boxGeometry args={[sashW, 0.03, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              <mesh position={[-sashW / 2, 0, 0]}>
                <boxGeometry args={[sashW, 0.03, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
              <mesh position={[-sashW / 2, -h / 4, 0]}>
                <boxGeometry args={[sashW, 0.03, d * 0.6]} />
                <meshStandardMaterial color="#f1f5f9" roughness={0.8} />
              </mesh>
            </group>
          </group>
        );
      case 'tubelight':
        return (
          <group>
            {/* Base (mounts to wall) */}
            <mesh position={[0, 0, 0]} castShadow receiveShadow>
              <boxGeometry args={[w, h, d]} />
              <meshStandardMaterial
                color="#cbd5e1"
                roughness={0.5}
                metalness={0.2}
              />
            </mesh>
            {/* Tube (glowing part) */}
            <mesh
              position={[0, 0, d / 2 + 0.015]}
              rotation={[0, 0, Math.PI / 2]}
            >
              <cylinderGeometry args={[0.02, 0.02, w - 0.04, 32]} />
              {item.isOn !== false ? (
                <meshBasicMaterial color="#ffffff" />
              ) : (
                <meshStandardMaterial color="#94a3b8" roughness={0.6} />
              )}
            </mesh>
            {/* Light sources spread across the tube */}
            {item.isOn !== false && (
              <>
                <pointLight
                  position={[0, 0, d / 2 + 0.05]}
                  intensity={0.8}
                  distance={8}
                  color="#ffffff"
                  castShadow
                />
                <pointLight
                  position={[w / 3, 0, d / 2 + 0.05]}
                  intensity={0.5}
                  distance={6}
                  color="#ffffff"
                />
                <pointLight
                  position={[-w / 3, 0, d / 2 + 0.05]}
                  intensity={0.5}
                  distance={6}
                  color="#ffffff"
                />
              </>
            )}
          </group>
        );
      case 'chair':
        const seatYOffset = 0.02; // Move seat up slightly to make room for legs
        return (
          <group>
            {/* Seat Frame */}
            <RoundedBox
              args={[w - 0.02, 0.03, d - 0.02]}
              radius={0.005}
              position={[0, seatYOffset, 0]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial
                color={item.color || '#5c4033'}
                roughness={0.7}
              />
            </RoundedBox>

            {/* Seat Cushion (Yellow/Gold fabric) */}
            <RoundedBox
              args={[w, 0.04, d]}
              radius={0.015}
              position={[0, seatYOffset + 0.035, 0.01]}
              castShadow
              receiveShadow
            >
              <meshStandardMaterial color="#d4af37" roughness={0.9} />
            </RoundedBox>

            {/* Front Legs - Flared out slightly */}
            {[-1, 1].map((x) => (
              <mesh
                key={`fleg-${x}`}
                position={[
                  (w / 2 - 0.03) * x,
                  -0.22 + seatYOffset,
                  d / 2 - 0.04,
                ]}
                rotation={[0, 0, x * 0.05]}
                castShadow
                receiveShadow
              >
                <boxGeometry args={[0.03, 0.45, 0.03]} />
                <meshStandardMaterial
                  color={item.color || '#5c4033'}
                  roughness={0.7}
                />
              </mesh>
            ))}

            {/* Back Legs / Side Posts - Angled backward and tapering outward */}
            {[-1, 1].map((x) => (
              <group
                key={`bleg-${x}`}
                position={[(w / 2 - 0.03) * x, 0.075, -d / 2 + 0.04]}
                rotation={[-0.12, 0, x * -0.08]}
              >
                <mesh castShadow receiveShadow>
                  {/* Total length from floor to top rail is ~0.95 */}
                  <boxGeometry args={[0.03, 0.95, 0.03]} />
                  <meshStandardMaterial
                    color={item.color || '#5c4033'}
                    roughness={0.7}
                  />
                </mesh>
              </group>
            ))}

            {/* Top Rail - Curved, wider and taller */}
            <group position={[0, 0.5, -d / 2 - 0.02]} rotation={[-0.12, 0, 0]}>
              <RoundedBox
                args={[w + 0.02, 0.08, 0.02]}
                radius={0.005}
                castShadow
                receiveShadow
              >
                <meshStandardMaterial
                  color={item.color || '#5c4033'}
                  roughness={0.7}
                />
              </RoundedBox>
            </group>

            {/* Lower Rail (Backrest) */}
            <group position={[0, 0.12, -d / 2 + 0.03]} rotation={[-0.12, 0, 0]}>
              <mesh castShadow receiveShadow>
                <boxGeometry args={[w - 0.04, 0.04, 0.02]} />
                <meshStandardMaterial
                  color={item.color || '#5c4033'}
                  roughness={0.7}
                />
              </mesh>
            </group>

            {/* Vertical Slats in Backrest (Comb-like extending over the top rail, fanned out) */}
            {[-3, -2, -1, 0, 1, 2, 3].map((i) => (
              <group
                key={`slat-${i}`}
                position={[i * 0.045, 0.33, -d / 2 + 0.01]}
                rotation={[-0.12, 0, i * -0.015]}
              >
                <mesh castShadow receiveShadow>
                  {/* Extend from lower rail past top rail. */}
                  <boxGeometry args={[0.015, 0.48, 0.015]} />
                  <meshStandardMaterial
                    color={item.color || '#5c4033'}
                    roughness={0.7}
                  />
                </mesh>
              </group>
            ))}

            {/* Stretchers (Crossbars between legs) */}
            {/* Front Stretcher */}
            <mesh
              position={[0, -0.25 + seatYOffset, d / 2 - 0.04]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[w - 0.06, 0.02, 0.015]} />
              <meshStandardMaterial
                color={item.color || '#5c4033'}
                roughness={0.7}
              />
            </mesh>
            {/* Side Stretchers */}
            {[-1, 1].map((x) => (
              <group
                key={`stretcher-side-${x}`}
                position={[(w / 2 - 0.03) * x, -0.25 + seatYOffset, 0]}
              >
                <mesh castShadow receiveShadow>
                  <boxGeometry args={[0.015, 0.02, d - 0.08]} />
                  <meshStandardMaterial
                    color={item.color || '#5c4033'}
                    roughness={0.7}
                  />
                </mesh>
              </group>
            ))}
          </group>
        );
      default:
        return null;
    }
  };

  return (
    <>
      {isSelected && groupObj && (
        <TransformControls
          object={groupObj}
          mode="translate"
          showY={
            !['wardrobe', 'table', 'pot', 'bed', 'chair', 'door'].includes(
              item.type,
            )
          }
          onChange={handleObjectChange}
          onMouseUp={handleMouseUp}
        />
      )}
      <group
        ref={setGroupObj}
        position={item.position as [number, number, number]}
        rotation={item.rotation as [number, number, number]}
        onClick={handleClick}
        onDoubleClick={(e) => {
          e.stopPropagation();
          if (item.type === 'door' || item.type === 'window') {
            setIsOpen(!isOpen);
          }
        }}
        onPointerOver={() => {
          document.body.style.cursor = 'pointer';
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto';
        }}
      >
        {renderModel()}
      </group>
    </>
  );
};

export default function Furniture() {
  const dimensions = useRoomStore((state) => state.dimensions);
  const items = useRoomStore((state) => state.items);
  const theme = useRoomStore((state) => state.theme);
  const selectedId = useRoomStore((state) => state.selectedId);
  const setSelectedId = useRoomStore((state) => state.setSelectedId);
  const updateItem = useRoomStore((state) => state.updateItem);
  const windowTint = useRoomStore((state) => state.windowTint);
  const windowOpacity = useRoomStore((state) => state.windowOpacity);
  const textures = {
    warm: useTexture('/warm.png'),
    crisp: useTexture('/crisp.png'),
    natural: useTexture('/natural.png'),
    jewel: useTexture('/jewel.png'),
    sunset: useTexture('/sunset.png'),
  };

  Object.values(textures).forEach((tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  const getThemeData = () => {
    switch (theme) {
      case 'crisp':
        return { wardrobe: '#f1f5f9', pot: '#1e3a8a', texture: textures.crisp };
      case 'natural':
        return {
          wardrobe: '#b4c5b0',
          pot: '#a3a3a3',
          texture: textures.natural,
        };
      case 'jewel':
        return { wardrobe: '#064e3b', pot: '#a21caf', texture: textures.jewel };
      case 'sunset':
        return {
          wardrobe: '#fecdd3',
          pot: '#c084fc',
          texture: textures.sunset,
        };
      case 'warm':
      default:
        return { wardrobe: '#e6c287', pot: '#cc7752', texture: textures.warm };
    }
  };
  const themeData = getThemeData();

  return (
    <group>
      {items.map((item) => (
        <ItemRenderer
          key={item.id}
          item={item}
          isSelected={item.id === selectedId}
          onSelect={setSelectedId}
          updateItem={updateItem}
          themeData={themeData}
          dimensions={dimensions}
          windowTint={windowTint}
          windowOpacity={windowOpacity}
        />
      ))}
    </group>
  );
}
