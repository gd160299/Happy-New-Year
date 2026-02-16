import { Canvas } from '@react-three/fiber'
import { Stars } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import Fireworks from './Fireworks'

export default function Scene({ active, audioReady }) {
    return (
        <Canvas
            camera={{ position: [0, 3, 22], fov: 60 }}
            dpr={[1, 1.5]}
            gl={{
                antialias: false,
                powerPreference: 'high-performance',
                stencil: false,
                depth: true,
            }}
            style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}
        >
            <color attach="background" args={['#020010']} />
            <fog attach="fog" args={['#020010', 30, 55]} />
            <ambientLight intensity={0.05} />

            <Stars radius={80} depth={60} count={2500} factor={4} saturation={0.1} fade speed={0.5} />

            <Fireworks active={active} audioReady={audioReady} />

            <EffectComposer multisampling={0}>
                <Bloom luminanceThreshold={0.15} luminanceSmoothing={0.3} intensity={1.8} mipmapBlur />
            </EffectComposer>
        </Canvas>
    )
}
