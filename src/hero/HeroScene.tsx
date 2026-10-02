import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Lightformer } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Group, MathUtils, NeutralToneMapping, type CanvasTexture, type ExtrudeGeometry } from 'three'
import { gsap } from '../components/motion'
import { TILE_ASPECT, paintBrandTile, tileGeometry } from './majolica'

const TILE_W = 3.2
const TILE_H = TILE_W / TILE_ASPECT

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

type Textures = { brand: CanvasTexture }

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
      const scale = Math.min((vw * 0.8) / TILE_W, (vh * 0.34) / TILE_H)
      return { x: 0, y: vh * 0.2, scale, mobile, vw, vh }
    }
    const scale = Math.min(1, (vw * 0.4) / TILE_W, (vh * 0.56) / TILE_H)
    return { x: vw * 0.19, y: vh * 0.07, scale, mobile, vw, vh }
  }, [viewport.width, viewport.height, size.width])
}

type SceneProps = {
  textures: Textures
  reduced: boolean
  tilt: boolean
  glassRef: { current: Group | null }
  glassScrollY: { current: number }
}

function Scene({
  textures,
  reduced,
  tilt,
  glassRef,
  glassScrollY,
}: SceneProps): React.JSX.Element {
  const layout = useLayout()
  const pointer = usePointer(tilt && !layout.mobile)
  const rig = useRef<Group>(null)
  const tile = useRef<Group>(null)
  const entrance = useRef(reduced ? 1 : 0)

  const brandGeo = useMemo(() => tileGeometry(TILE_W, TILE_H, 0.2, 0.24), [])
  useEffect(() => () => disposeAll([brandGeo]), [brandGeo])

  useFrame(({ clock, scene }, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20)
    const t = clock.elapsedTime
    const g = tile.current
    if (!g) return

    if (reduced) {
      g.rotation.set(0.05, -0.2, 0)
    } else {
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
    }

    // Bottle removed: it sat in front of the headline at every camera fit.
    // Glass: gentle float with period ~9 s, plus parallax offset from scroll.
    if (glassRef.current) {
      glassRef.current.position.y =
        -0.9 + Math.sin(t * ((Math.PI * 2) / 9)) * 0.06 + glassScrollY.current
    }

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
          {/* Brand tile recedes slightly as a backdrop; scale 0.88 and softer shadow. */}
          <group ref={tile} scale={0.88}>
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
            opacity={0.35}
            color="#060a24"
            frames={reduced ? 1 : Infinity}
          />
        </group>

        {/* Wine glass: stem + base + bowl, warm translucent material. */}
        <group ref={glassRef} position={[1.9, -0.9, -0.8]}>
          {/* stem */}
          <mesh>
            <cylinderGeometry args={[0.015, 0.015, 0.35, 12]} />
            <meshPhysicalMaterial
              color="#e8d5b0"
              roughness={0.05}
              transmission={0.8}
              ior={1.5}
              transparent
            />
          </mesh>
          {/* base — below stem bottom */}
          <mesh position={[0, -0.185, 0]}>
            <cylinderGeometry args={[0.07, 0.08, 0.02, 16]} />
            <meshPhysicalMaterial
              color="#e8d5b0"
              roughness={0.05}
              transmission={0.8}
              ior={1.5}
              transparent
            />
          </mesh>
          {/* bowl — sphere squashed taller via Y scale, above stem top */}
          <mesh position={[0, 0.28, 0]} scale={[1, 1.3, 1]}>
            <sphereGeometry args={[0.12, 16, 12]} />
            <meshPhysicalMaterial
              color="#e8d5b0"
              roughness={0.05}
              transmission={0.8}
              ior={1.5}
              transparent
            />
          </mesh>
        </group>
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
 * Hero object: the brand's glazed majolica tile in WebGL, now with decorative
 * wine bottle and glass companions. Renders nothing when WebGL is unavailable
 * so the shell's poster shows through. Stops rendering while offscreen.
 */
export default function HeroScene(): React.JSX.Element | null {
  const [webgl] = useState(hasWebGL)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const [textures, setTextures] = useState<Textures | null>(null)
  const [visible, setVisible] = useState(true)
  const [ready, setReady] = useState(false)
  const host = useRef<HTMLDivElement>(null)

  // Refs passed into the R3F scene so GSAP (DOM side) can write position offsets
  // that useFrame reads each tick.
  const glassRef = useRef<Group>(null)
  const glassScrollY = useRef(0)

  useEffect(() => {
    if (!webgl) return
    let cancelled = false
    let made: Textures | null = null
    paintBrandTile(8)
      .then((brand) => {
        made = { brand }
        if (cancelled) disposeAll([brand])
        else setTextures(made)
      })
      .catch(() => {
        // A canvas or font failure leaves the poster in place, as with no WebGL.
      })
    return () => {
      cancelled = true
      if (made) disposeAll([made.brand])
    }
  }, [webgl])

  useEffect(() => {
    const el = host.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      rootMargin: '80px',
    })
    io.observe(el)
    return () => io.disconnect()
  }, [webgl])

  // Parallax: as the hero scrolls away, the bottle drifts up (+0.4 Y) and the
  // glass drifts down (-0.3 Y) in Three.js world units via useFrame.
  useEffect(() => {
    if (reduced) return
    const el = host.current
    if (!el) return
    const gProxy = { y: 0 }
    const gTween = gsap.to(gProxy, {
      y: -0.3,
      ease: 'none',
      onUpdate: () => {
        glassScrollY.current = gProxy.y
      },
      scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
    })
    return () => {
      gTween.scrollTrigger?.kill()
      gTween.kill()
      glassScrollY.current = 0
    }
  }, [reduced])

  if (!webgl) return null

  const frameloop = reduced ? 'demand' : visible ? 'always' : 'never'

  return (
    <div
      ref={host}
      className="absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: ready ? 1 : 0 }}
      aria-hidden="true"
    >
      {/* Parallax anchor: invisible, gives ScrollTrigger a DOM node to measure against. */}
      <div data-parallax-hero className="absolute inset-0 pointer-events-none" />
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
          <Scene
            textures={textures}
            reduced={reduced}
            tilt={fine}
            glassRef={glassRef}
            glassScrollY={glassScrollY}
          />
        </Canvas>
      )}
    </div>
  )
}
