import { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, Environment } from '@react-three/drei';
import { Group } from 'three';

// Simple 3D dog using basic geometry since we don't have a GLB model
const DogModel = () => {
  const groupRef = useRef<Group>(null);
  
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]} scale={0.8}>
      {/* Body */}
      <mesh position={[0, 0, 0]} castShadow>
        <boxGeometry args={[2, 1, 1.5]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Head */}
      <mesh position={[1.2, 0.3, 0]} castShadow>
        <boxGeometry args={[1, 0.8, 0.8]} />
        <meshStandardMaterial color="#D2691E" />
      </mesh>
      
      {/* Snout */}
      <mesh position={[1.8, 0.1, 0]} castShadow>
        <boxGeometry args={[0.4, 0.3, 0.4]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Ears */}
      <mesh position={[1.0, 0.7, -0.3]} rotation={[0, 0, -0.3]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      <mesh position={[1.0, 0.7, 0.3]} rotation={[0, 0, 0.3]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.1]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Legs */}
      <mesh position={[0.6, -0.8, -0.5]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[0.6, -0.8, 0.5]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.6, -0.8, -0.5]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      <mesh position={[-0.6, -0.8, 0.5]} castShadow>
        <boxGeometry args={[0.3, 0.6, 0.3]} />
        <meshStandardMaterial color="#8B4513" />
      </mesh>
      
      {/* Tail */}
      <mesh position={[-1.2, 0.2, 0]} rotation={[0, 0, 0.5]} castShadow>
        <boxGeometry args={[0.8, 0.2, 0.2]} />
        <meshStandardMaterial color="#654321" />
      </mesh>
      
      {/* Eyes */}
      <mesh position={[1.6, 0.4, -0.2]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      <mesh position={[1.6, 0.4, 0.2]} castShadow>
        <sphereGeometry args={[0.08, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
      
      {/* Nose */}
      <mesh position={[2.0, 0.1, 0]} castShadow>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#000000" />
      </mesh>
    </group>
  );
};

interface Dog3DProps {
  onClick?: () => void;
  className?: string;
}

const Dog3D = ({ onClick, className = "" }: Dog3DProps) => {
  return (
    <div 
      className={`cursor-pointer transition-transform duration-300 hover:scale-105 ${className}`}
      onClick={onClick}
    >
      <Canvas
        shadows
        camera={{ position: [5, 2, 5], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Environment preset="sunset" />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 5, 5]}
          intensity={1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <DogModel />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          maxPolarAngle={Math.PI / 2}
          minPolarAngle={Math.PI / 4}
          autoRotate
          autoRotateSpeed={2}
        />
        <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.5, 0]}>
          <planeGeometry args={[10, 10]} />
          <meshStandardMaterial color="#90EE90" opacity={0.3} transparent />
        </mesh>
      </Canvas>
    </div>
  );
};

export default Dog3D;