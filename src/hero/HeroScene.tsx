import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  CylinderGeometry,
  Group,
  LatheGeometry,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  Vector2,
} from 'three'

function hasWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return Boolean(c.getContext('webgl2') ?? c.getContext('webgl'))
  } catch {
    return false
  }
}

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = (): void => setMatch(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return match
}

/** Bordeaux bottle, stacked from the punt up. Heights sum to 1.07. */
const BOTTLE = [
  { radiusTop: 0.1, radiusBottom: 0.1, height: 0.04 },
  { radiusTop: 0.09, radiusBottom: 0.09, height: 0.6 },
  { radiusTop: 0.045, radiusBottom: 0.09, height: 0.12 },
  { radiusTop: 0.045, radiusBottom: 0.045, height: 0.28 },
  { radiusTop: 0.055, radiusBottom: 0.055, height: 0.03 },
] as const

const BOTTLE_HEIGHT = BOTTLE.reduce((sum, part) => sum + part.height, 0)

const GLASSES = [
  { radius: 1.4, phase: 0, orbitalSpeed: 0.32, floatAmp: 0.06, floatFreq: 0.9 },
  { radius: 1.75, phase: (Math.PI * 2) / 3, orbitalSpeed: 0.24, floatAmp: 0.09, floatFreq: 0.7 },
  { radius: 1.55, phase: (Math.PI * 4) / 3, orbitalSpeed: 0.28, floatAmp: 0.07, floatFreq: 1.1 },
] as const

const GLASS_BASE_Y = -0.35
const GLASS_Z = 1
const STEM_H = 0.28
const BASE_H = 0.015

type SceneProps = { reduced: boolean }

function WineBottle(): React.JSX.Element {
  const parts = useMemo(() => {
    let y = -BOTTLE_HEIGHT / 2
    return BOTTLE.map((part) => {
      const geometry = new CylinderGeometry(part.radiusTop, part.radiusBottom, part.height, 48)
      const centre = y + part.height / 2
      y += part.height
      return { geometry, y: centre }
    })
  }, [])
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        color: '#1a0a0e',
        roughness: 0.08,
        metalness: 0.05,
        clearcoat: 1,
        clearcoatRoughness: 0.03,
        envMapIntensity: 1.5,
      }),
    [],
  )

  useEffect(
    () => () => {
      for (const part of parts) part.geometry.dispose()
      material.dispose()
    },
    [parts, material],
  )

  return (
    <group>
      {parts.map((part) => (
        <mesh key={part.y} geometry={part.geometry} material={material} position={[0, part.y, 0]} />
      ))}
    </group>
  )
}

function WineGlass(): React.JSX.Element {
  const { stem, base, bowl, material } = useMemo(() => {
    const glass = new MeshPhysicalMaterial({
      color: '#e8d5b0',
      roughness: 0.04,
      transmission: 0.85,
      ior: 1.52,
      thickness: 0.1,
      transparent: true,
      envMapIntensity: 1.2,
    })
    return {
      stem: new CylinderGeometry(0.012, 0.012, STEM_H, 16),
      base: new CylinderGeometry(0.055, 0.055, BASE_H, 24),
      // Wine glass bowl: wide open rim tapering down to a narrow waist
      bowl: new LatheGeometry(
        [
          new Vector2(0.012, 0.00),   // waist (connects to stem)
          new Vector2(0.022, 0.04),
          new Vector2(0.048, 0.10),
          new Vector2(0.074, 0.17),
          new Vector2(0.094, 0.24),
          new Vector2(0.106, 0.30),
          new Vector2(0.110, 0.36),   // widest point
          new Vector2(0.108, 0.40),
          new Vector2(0.102, 0.44),   // rim
        ],
        40,
      ),
      material: glass,
    }
  }, [])

  useEffect(
    () => () => {
      stem.dispose()
      base.dispose()
      bowl.dispose()
      material.dispose()
    },
    [stem, base, bowl, material],
  )

  return (
    <group>
      <mesh geometry={stem} material={material} />
      <mesh geometry={base} material={material} position={[0, -(STEM_H + BASE_H) / 2, 0]} />
      <mesh geometry={bowl} material={material} position={[0, STEM_H / 2, 0]} />
    </group>
  )
}

function Scene({ reduced }: SceneProps): React.JSX.Element {
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const bottle = useRef<Group>(null)
  const glasses = useRef<(Group | null)[]>([])
  const bottleAngle = useRef(0)

  const mobile = size.width < 768
  const bottlePosition: [number, number, number] = mobile
    ? [0, 0.4, 0]
    : [viewport.width * 0.18, 0, 0]

  useFrame(({ clock }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const t = reduced ? 0 : clock.elapsedTime
    if (bottle.current && !reduced) {
      bottleAngle.current += dt * 0.15
      bottle.current.rotation.y = bottleAngle.current
    }

    for (let i = 0; i < GLASSES.length; i++) {
      const glass = glasses.current[i]
      const orbit = GLASSES[i]
      if (!glass || !orbit) continue
      const angle = t * orbit.orbitalSpeed + orbit.phase
      glass.position.x = Math.cos(angle) * orbit.radius
      glass.position.z = Math.sin(angle) * orbit.radius - GLASS_Z
      glass.position.y = GLASS_BASE_Y + Math.sin(t * orbit.floatFreq + orbit.phase) * orbit.floatAmp
      glass.rotation.y = -angle
    }
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <pointLight color="#f2c872" intensity={0.6} position={[0, -2, 3]} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]}>
        <planeGeometry args={[8, 8]} />
        <meshStandardMaterial color="#0a0818" opacity={0.18} transparent />
      </mesh>

      <group ref={bottle} position={bottlePosition} scale={mobile ? 0.7 : 1}>
        <WineBottle />
      </group>

      {GLASSES.map((orbit, i) => (
        <group
          key={orbit.phase}
          ref={(node) => {
            glasses.current[i] = node
          }}
        >
          <WineGlass />
        </group>
      ))}

      <Environment resolution={256} frames={1}>
        {/* Key softbox above, two strip lights, a warm wall bounce from the interior yellow. */}
        <Lightformer form="rect" intensity={2.2} position={[0, 5, 2]} rotation-x={Math.PI / 2} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={1.4} position={[-5, 1, 3]} rotation-y={Math.PI / 2.5} scale={[2, 8, 1]} />
        <Lightformer form="rect" intensity={1.1} position={[5, 0, 2]} rotation-y={-Math.PI / 2.5} scale={[2, 8, 1]} />
        <Lightformer form="circle" color="#f2c872" intensity={0.8} position={[2, -3, 4]} scale={4} />
        <Lightformer form="rect" intensity={1.6} position={[0, 0, 8]} scale={[16, 10, 1]} color="#fdf9f1" />
        <Lightformer form="rect" intensity={6} position={[0, 0.5, 6]} rotation-z={-0.35} scale={[1.1, 14, 1]} />
      </Environment>
    </>
  )
}

/**
 * Hero object: a bordeaux bottle with three glasses orbiting it.
 * Renders nothing when WebGL is unavailable so the shell's poster shows through.
 * Stops rendering while offscreen; reduced motion freezes the orbit.
 */
export default function HeroScene(): React.JSX.Element | null {
  const [webgl] = useState(hasWebGL)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')

  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '80px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [webgl])

  if (!webgl) return null

  const frameloop = reduced ? 'demand' : visible ? 'always' : 'never'

  return (
    <div
      ref={host}
      className="absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden="true"
    >
      <Canvas
        frameloop={frameloop}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 28, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl, invalidate }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMapping = NeutralToneMapping
          if (reduced) invalidate()
          requestAnimationFrame(() => setReady(true))
        }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        <Scene reduced={reduced} />
      </Canvas>
    </div>
  )
}
