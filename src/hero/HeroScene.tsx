import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, MathUtils, NeutralToneMapping, type CanvasTexture, type ExtrudeGeometry } from 'three'
import { TILE_ASPECT, paintBrandTile, paintRosetteTile, tileGeometry } from './majolica'

const TILE_W = 3.2
const TILE_H = TILE_W / TILE_ASPECT
const SMALL = 0.95

/** Frame-rate independent exponential approach (same curve as maath's damp). */
function damp(current: number, target: number, lambda: number, dt: number): number {
  return MathUtils.lerp(current, target, 1 - Math.exp(-lambda * dt))
}

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

type Textures = { brand: CanvasTexture; rosettes: CanvasTexture[] }

/** Pointer in -1..1 relative to the window; only tracked for fine hover pointers. */
function usePointer(enabled: boolean): React.RefObject<{ x: number; y: number }> {
  const p = useRef({ x: 0, y: 0 })
  useEffect(() => {
    p.current.x = 0
    p.current.y = 0
    if (!enabled) return
    const onMove = (e: PointerEvent): void => {
      p.current.x = (e.clientX / window.innerWidth) * 2 - 1
      p.current.y = -((e.clientY / window.innerHeight) * 2 - 1)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [enabled])
  return p
}

type Layout = { x: number; y: number; scale: number; mobile: boolean; vw: number; vh: number }

/** Upper centre on phones, centre right on wide screens (text sits bottom-left). */
function useLayout(): Layout {
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  return useMemo(() => {
    const vw = viewport.width
    const vh = viewport.height
    const mobile = size.width < 768
    if (mobile) {
      const scale = Math.min(vw * 0.8 / TILE_W, vh * 0.34 / TILE_H)
      return { x: 0, y: vh * 0.2, scale, mobile, vw, vh }
    }
    const scale = Math.min(1, vw * 0.4 / TILE_W, vh * 0.56 / TILE_H)
    return { x: vw * 0.19, y: vh * 0.07, scale, mobile, vw, vh }
  }, [viewport.width, viewport.height, size.width])
}

type SceneProps = { textures: Textures; reduced: boolean; tilt: boolean }

function Scene({ textures, reduced, tilt }: SceneProps): React.JSX.Element {
  const layout = useLayout()
  const pointer = usePointer(tilt && !layout.mobile)
  const rig = useRef<Group>(null)
  const tile = useRef<Group>(null)
  const smalls = useRef<(Group | null)[]>([])
  const entrance = useRef(reduced ? 1 : 0)

  const brandGeo = useMemo(() => tileGeometry(TILE_W, TILE_H, 0.2, 0.24), [])
  const smallGeo = useMemo(() => tileGeometry(SMALL, SMALL, 0.08, 0.12), [])
  useEffect(() => () => disposeAll([brandGeo, smallGeo]), [brandGeo, smallGeo])

  // Companion tiles drift in depth around the brand tile; fewer on phones.
  const companions = useMemo(() => {
    const { vw, vh, mobile } = layout
    const all = [
      { p: [-vw * 0.12, vh * 0.3, -2.6], r: [0.3, 0.5, 0.35], s: 0.85, phase: 0.0 },
      { p: [vw * 0.44, -vh * 0.18, -1.6], r: [-0.25, -0.6, -0.2], s: 0.75, phase: 2.1 },
      { p: [vw * 0.52, vh * 0.56, -3.6], r: [0.4, -0.3, 0.6], s: 0.7, phase: 4.2 },
    ]
    const phone = [
      { p: [-vw * 0.48, vh * 0.52, -2.4], r: [0.3, 0.55, 0.35], s: 0.55, phase: 0.0 },
      { p: [vw * 0.42, -vh * 0.04, -1.8], r: [-0.3, -0.55, -0.25], s: 0.5, phase: 2.6 },
    ]
    return mobile ? phone : all
  }, [layout])

  useFrame(({ clock, scene }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const t = clock.elapsedTime
    const g = tile.current
    if (!g) return
    if (reduced) {
      g.rotation.set(0.05, -0.2, 0)
      return
    }
    entrance.current = damp(entrance.current, 1, 1.6, dt)
    const e = entrance.current
    const px = pointer.current.x
    const py = pointer.current.y

    // Tilt toward the pointer, with a slow idle sway when nobody is steering.
    const idleX = Math.sin(t * 0.37) * 0.06
    const idleY = Math.sin(t * 0.29 + 1.3) * 0.12
    const tx = 0.05 + idleX - py * 0.2
    const ty = -0.16 + idleY + px * 0.34
    g.rotation.x = damp(g.rotation.x, tx, 3.2, dt)
    g.rotation.y = damp(g.rotation.y, ty - (1 - e) * 0.9, 3.2, dt)
    g.rotation.z = Math.sin(t * 0.21) * 0.025
    g.position.y = Math.sin(t * 0.6) * 0.06 - (1 - e) * 0.5

    if (rig.current) {
      rig.current.position.x = damp(rig.current.position.x, px * 0.08, 2.4, dt)
      rig.current.position.y = damp(rig.current.position.y, py * 0.05, 2.4, dt)
    }

    smalls.current.forEach((m, i) => {
      if (!m) return
      const c = companions[i]
      const depth = -c.p[2] * 0.09
      m.position.x = damp(m.position.x, c.p[0] - px * depth, 2, dt)
      m.position.y = c.p[1] + Math.sin(t * 0.45 + c.phase) * 0.12 - py * depth * 0.6 - (1 - e) * 0.8
      m.rotation.x = c.r[0] + Math.sin(t * 0.3 + c.phase) * 0.15
      m.rotation.y = c.r[1] + Math.cos(t * 0.26 + c.phase) * 0.2
    })

    // Specular sweep: the baked environment swings so the bright strip glides
    // across the glaze quickly, then drifts back slowly; one cycle every 9 s.
    const cycle = (t % 9) / 9
    const go = MathUtils.smootherstep(cycle, 0.08, 0.5)
    const back = MathUtils.smootherstep(cycle, 0.55, 1)
    scene.environmentRotation.y = MathUtils.lerp(-0.85, 0.85, go - back)
  })

  return (
    <>
      <ambientLight intensity={0.35} />
      <group ref={rig}>
        <group position={[layout.x, layout.y, 0]} scale={layout.scale}>
          <group ref={tile}>
            <mesh geometry={brandGeo}>
              <meshPhysicalMaterial
                map={textures.brand}
                roughness={0.3}
                metalness={0}
                clearcoat={1}
                clearcoatRoughness={0.05}
                ior={1.5}
                specularIntensity={0.6}
                envMapIntensity={1}
              />
            </mesh>
          </group>
          <ContactShadows
            position={[0, -TILE_H / 2 - 0.42, 0]}
            scale={[TILE_W * 1.8, 1.6]}
            resolution={256}
            far={1.4}
            blur={2.8}
            opacity={0.55}
            color="#060a24"
            frames={reduced ? 1 : Infinity}
          />
        </group>
        {companions.map((c, i) => (
          <group
            key={i}
            ref={(m) => {
              smalls.current[i] = m
            }}
            position={c.p as [number, number, number]}
            rotation={c.r as [number, number, number]}
            scale={c.s}
          >
            <mesh geometry={smallGeo}>
              <meshPhysicalMaterial
                map={textures.rosettes[i % textures.rosettes.length]}
                roughness={0.32}
                clearcoat={1}
                clearcoatRoughness={0.08}
                envMapIntensity={0.9}
              />
            </mesh>
          </group>
        ))}
      </group>

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

function disposeAll(items: (ExtrudeGeometry | CanvasTexture)[]): void {
  for (const item of items) item.dispose()
}

/**
 * Hero object: the brand's glazed majolica tile in WebGL.
 * Fills its positioned parent; renders nothing when WebGL is unavailable so
 * the shell's poster shows through. Stops rendering while offscreen.
 */
export default function HeroScene(): React.JSX.Element | null {
  const [webgl] = useState(hasWebGL)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const [textures, setTextures] = useState<Textures | null>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!webgl) return
    let cancelled = false
    let made: Textures | null = null
    Promise.all([paintBrandTile(8), paintRosetteTile(8, 11), paintRosetteTile(8, 23), paintRosetteTile(8, 47)])
      .then(([brand, ...rosettes]) => {
        made = { brand, rosettes }
        if (cancelled) disposeAll([brand, ...rosettes])
        else setTextures(made)
      })
      .catch(() => {
        // A canvas or font failure leaves the poster in place, as with no WebGL.
      })
    return () => {
      cancelled = true
      if (made) disposeAll([made.brand, ...made.rosettes])
    }
  }, [webgl])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' })
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
      {textures && (
        <Canvas
          frameloop={frameloop}
          dpr={[1, 1.75]}
          camera={{ position: [0, 0, 9], fov: 30, near: 0.1, far: 40 }}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          onCreated={({ gl }) => {
            gl.setClearColor(0x000000, 0)
            gl.toneMapping = NeutralToneMapping
            requestAnimationFrame(() => setReady(true))
          }}
          style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
        >
          <Scene textures={textures} reduced={reduced} tilt={fine} />
        </Canvas>
      )}
    </div>
  )
}
