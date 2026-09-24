import { Suspense, createContext, useEffect, useState } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Scene3D } from './Scene3D';
import { CameraController } from './CameraController';

export const MotionContext = createContext(false);

function ContextLoss({ onLost }: { onLost: () => void }) {
  const { gl } = useThree();
  useEffect(() => {
    const lost = (event: Event) => { event.preventDefault(); onLost(); };
    gl.domElement.addEventListener('webglcontextlost', lost);
    return () => gl.domElement.removeEventListener('webglcontextlost', lost);
  }, [gl, onLost]);
  return null;
}

type Props = React.ComponentProps<typeof Scene3D> & {
  reducedMotion: boolean; lowPower: boolean; pageVisible: boolean; section: number;
  onSection: (section: number) => void; onActiveMilestone: (index: number) => void;
};

export default function WorkspaceCanvas(props: Props) {
  const [lost, setLost] = useState(false);
  const reduced = props.reducedMotion || props.lowPower;
  if (lost) return <div className="scene-fallback">The 3D view paused. Continue with the portfolio below.</div>;
  return <Canvas dpr={props.isMobile || props.lowPower ? 1 : [1, 1.5]}
    shadows={!props.isMobile && !reduced}
    frameloop={!props.pageVisible || (props.isMobile && props.section > 0) ? 'never' : reduced ? 'demand' : 'always'}
    camera={{ position: [.2, 2.3, 7], fov: props.isMobile ? 48 : 44 }}
    gl={{ antialias: !props.isMobile, alpha: true, powerPreference: props.lowPower ? 'low-power' : 'default' }}
    fallback={<div className="scene-fallback">Read the complete portfolio below.</div>}>
    <ContextLoss onLost={() => setLost(true)} />
    <MotionContext.Provider value={reduced}>
      <Suspense fallback={null}><Scene3D {...props} /></Suspense>
      <CameraController {...props} reducedMotion={reduced} />
    </MotionContext.Provider>
  </Canvas>;
}
