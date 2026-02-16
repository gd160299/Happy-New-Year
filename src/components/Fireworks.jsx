import { useRef, useMemo, useCallback, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { getShapePoints } from '../utils/shapes'
import { playExplosion, playLaunch } from '../utils/audio'

const GRAVITY = -9.8
const MAX_PARTICLES = 1500
const isMobile = typeof window !== 'undefined' && window.innerWidth < 768

const _dummy = new THREE.Object3D()
const _color = new THREE.Color()

const STATE_INACTIVE = 0
const STATE_LAUNCHING = 1
const STATE_EXPLODING = 2
const STATE_SHAPED = 3

const PALETTES = [
    ['#ff006e', '#ff5ca1', '#ffb3d1'],
    ['#00f5d4', '#00d4aa', '#00b894'],
    ['#fee440', '#ffd60a', '#ffaa00'],
    ['#8338ec', '#a855f7', '#c084fc'],
    ['#3a86ff', '#60a5fa', '#93c5fd'],
    ['#ff6b35', '#ff8c61', '#ffb08a'],
    ['#ef476f', '#f07090', '#f598b0'],
    ['#ffd700', '#ffec80', '#fff5cc'],
]

// Shape rotation: each shape × 2, then loop
const SHAPE_SEQUENCE = [
    'heart', 'heart',
    'dragon', 'dragon',
    'horse', 'horse',
    'star', 'star',
]
const SHAPE_INTERVAL = 4.5 // seconds between shaped fireworks
const SHAPE_SCALE = isMobile ? 2.5 : 5.5

function createParticle() {
    return {
        state: STATE_INACTIVE,
        x: 0, y: 0, z: 0,
        vx: 0, vy: 0, vz: 0,
        tx: 0, ty: 0, tz: 0,
        ox: 0, oy: 0, oz: 0,
        arrivalTime: 0.4,
        holdTime: 2.0,
        life: 0, maxLife: 0,
        size: 1,
        r: 1, g: 1, b: 1,
    }
}

export default function Fireworks({ active = false, audioReady = false }) {
    const meshRef = useRef()
    const particles = useRef([])
    const nextLaunch = useRef(0)
    const shapeIndex = useRef(0)
    const nextShapeTime = useRef(0)
    const startTime = useRef(null)

    useMemo(() => {
        const pool = []
        for (let i = 0; i < MAX_PARTICLES; i++) pool.push(createParticle())
        particles.current = pool
    }, [])

    useEffect(() => {
        if (!active) return
        shapeIndex.current = 0
        nextShapeTime.current = 2.0 // first shape after 2s
        startTime.current = null
    }, [active])

    const getInactive = useCallback(() => {
        const pool = particles.current
        for (let i = 0; i < pool.length; i++) {
            if (pool[i].state === STATE_INACTIVE) return pool[i]
        }
        return null
    }, [])

    const launchFirework = useCallback(() => {
        const p = getInactive()
        if (!p) return
        p.state = STATE_LAUNCHING
        p.x = (Math.random() - 0.5) * 14
        p.y = -4
        p.z = (Math.random() - 0.5) * 8
        p.vx = (Math.random() - 0.5) * 1.0
        p.vy = 9 + Math.random() * 4
        p.vz = (Math.random() - 0.5) * 1.0
        p.life = 0
        p.maxLife = 1.0 + Math.random() * 0.5
        p.size = 0.18
        p.r = 1; p.g = 0.95; p.b = 0.8
        if (audioReady) playLaunch()
    }, [getInactive, audioReady])

    // Bigger spherical explosions
    const explodeSpherical = useCallback((source) => {
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]
        const count = isMobile ? 70 : 130
        for (let i = 0; i < count; i++) {
            const p = getInactive()
            if (!p) break
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const speed = 3.5 + Math.random() * 5.5
            p.state = STATE_EXPLODING
            p.x = source.x; p.y = source.y; p.z = source.z
            p.vx = Math.sin(phi) * Math.cos(theta) * speed
            p.vy = Math.sin(phi) * Math.sin(theta) * speed
            p.vz = Math.cos(phi) * speed
            p.life = 0; p.maxLife = 1.0 + Math.random() * 1.2
            p.size = 0.08 + Math.random() * 0.07
            const hex = palette[Math.floor(Math.random() * palette.length)]
            _color.set(hex); p.r = _color.r; p.g = _color.g; p.b = _color.b
        }
        if (audioReady) playExplosion()
    }, [getInactive, audioReady])

    const explodeShaped = useCallback((shapeName, cx, cy, cz) => {
        const pts = getShapePoints(shapeName)
        if (!pts) return
        const palette = PALETTES[Math.floor(Math.random() * PALETTES.length)]
        const scale = SHAPE_SCALE + Math.random() * (isMobile ? 0.8 : 1.5)

        for (let i = 0; i < pts.length; i++) {
            const p = getInactive()
            if (!p) break
            p.state = STATE_SHAPED
            p.ox = cx; p.oy = cy; p.oz = cz
            p.x = cx; p.y = cy; p.z = cz
            p.tx = cx + pts[i][0] * scale
            p.ty = cy + pts[i][1] * scale
            p.tz = cz + (Math.random() - 0.5) * 0.5
            p.vx = 0; p.vy = 0; p.vz = 0
            p.arrivalTime = 0.3 + Math.random() * 0.25
            p.holdTime = 2.2
            p.life = 0
            p.maxLife = p.arrivalTime + p.holdTime + 0.8
            p.size = 0.09
            const hex = palette[Math.floor(Math.random() * palette.length)]
            _color.set(hex); p.r = _color.r; p.g = _color.g; p.b = _color.b
        }
        if (audioReady) playExplosion()
    }, [getInactive, audioReady])

    const geo = useMemo(() => new THREE.SphereGeometry(1, 6, 6), [])
    const mat = useMemo(() => new THREE.MeshBasicMaterial({ toneMapped: false, transparent: true }), [])

    useFrame((state, delta) => {
        if (!meshRef.current || !active) return
        const dt = Math.min(delta, 0.05)
        const mesh = meshRef.current
        const pool = particles.current
        const elapsed = state.clock.elapsedTime

        if (startTime.current === null) startTime.current = elapsed
        const runTime = elapsed - startTime.current

        // Shaped firework queue — loops continuously
        if (runTime >= nextShapeTime.current) {
            const shapeName = SHAPE_SEQUENCE[shapeIndex.current % SHAPE_SEQUENCE.length]
            const spread = isMobile ? 4 : 8
            const cx = (Math.random() - 0.5) * spread
            const cy = (isMobile ? 3 : 2) + Math.random() * 3
            explodeShaped(shapeName, cx, cy, (Math.random() - 0.5) * 2)
            shapeIndex.current++
            nextShapeTime.current = runTime + SHAPE_INTERVAL
        }

        // Regular firework spawning
        if (elapsed > nextLaunch.current) {
            launchFirework()
            nextLaunch.current = elapsed + 0.5 + Math.random() * 0.7
        }

        let count = 0
        for (let i = 0; i < pool.length; i++) {
            const p = pool[i]
            if (p.state === STATE_INACTIVE) continue
            p.life += dt

            if (p.life >= p.maxLife) {
                if (p.state === STATE_LAUNCHING) explodeSpherical(p)
                p.state = STATE_INACTIVE
                continue
            }

            const progress = p.life / p.maxLife
            let scale = p.size
            let brightness = 2.0

            if (p.state === STATE_LAUNCHING) {
                p.vy += GRAVITY * 0.4 * dt
                p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt
                if (p.vy <= 0) { explodeSpherical(p); p.state = STATE_INACTIVE; continue }
                scale = p.size * (1.0 + Math.sin(p.life * 20) * 0.15)
                brightness = 3.0
            } else if (p.state === STATE_EXPLODING) {
                const drag = 0.97
                p.vy += GRAVITY * dt
                p.vx *= drag; p.vy *= drag; p.vz *= drag
                p.x += p.vx * dt; p.y += p.vy * dt; p.z += p.vz * dt
                const alpha = 1.0 - progress * progress
                scale = p.size * (1.0 - progress * 0.5)
                brightness = 2.5 * alpha + 0.3
            } else if (p.state === STATE_SHAPED) {
                const { arrivalTime, holdTime } = p
                const fadeStart = arrivalTime + holdTime
                if (p.life < arrivalTime) {
                    const t = p.life / arrivalTime
                    const ease = t * t * (3 - 2 * t)
                    p.x = p.ox + (p.tx - p.ox) * ease
                    p.y = p.oy + (p.ty - p.oy) * ease
                    p.z = p.oz + (p.tz - p.oz) * ease
                    brightness = 2.5 * t + 0.5
                } else if (p.life < fadeStart) {
                    p.x = p.tx + Math.sin(p.life * 15 + i) * 0.03
                    p.y = p.ty + Math.cos(p.life * 13 + i) * 0.03
                    p.z = p.tz
                    brightness = 2.8 + Math.sin(p.life * 20) * 0.5
                } else {
                    const ft = (p.life - fadeStart) / (p.maxLife - fadeStart)
                    p.x = p.tx + (Math.random() - 0.5) * 0.02
                    p.y = p.ty - ft * ft * 2.0
                    brightness = 1.5 * (1.0 - ft)
                    scale = p.size * (1.0 - ft * 0.6)
                }
            }

            _dummy.position.set(p.x, p.y, p.z)
            _dummy.scale.setScalar(Math.max(scale, 0.001))
            _dummy.updateMatrix()
            mesh.setMatrixAt(count, _dummy.matrix)
            mesh.setColorAt(count, _color.set(p.r * brightness, p.g * brightness, p.b * brightness))
            count++
        }

        for (let i = count; i < MAX_PARTICLES; i++) {
            _dummy.position.set(0, -1000, 0)
            _dummy.scale.setScalar(0)
            _dummy.updateMatrix()
            mesh.setMatrixAt(i, _dummy.matrix)
        }

        mesh.instanceMatrix.needsUpdate = true
        if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true
        mesh.count = Math.max(count, 1)
    })

    return (
        <instancedMesh ref={meshRef} args={[geo, mat, MAX_PARTICLES]} frustumCulled={false} />
    )
}
