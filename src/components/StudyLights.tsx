import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { DirectionalLight } from 'three';

export function StudyLights({ shadows }: { shadows: boolean }) {
  const key = useRef<DirectionalLight>(null);
  useFrame(({ camera }) => {
    if (!key.current) return;
    key.current.position.set(camera.position.x + 3, 7, camera.position.z + 2);
    key.current.target.position.set(camera.position.x, 0, -1);
    key.current.target.updateMatrixWorld();
  });
  return <>
    <ambientLight intensity={1.1} color="#fff5e7" />
    <hemisphereLight intensity={.7} color="#e1eff6" groundColor="#463426" />
    <directionalLight ref={key} intensity={2.3} color="#fff5df" castShadow={shadows}
      shadow-mapSize-width={1024} shadow-mapSize-height={1024}
      shadow-camera-left={-4} shadow-camera-right={4} shadow-camera-top={4} shadow-camera-bottom={-4}
      shadow-bias={-.0003} />
  </>;
}
