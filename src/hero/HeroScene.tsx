import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer } from '@react-three/drei'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CanvasTexture,
  CircleGeometry,
  ExtrudeGeometry,
  Group,
  MathUtils,
  MeshPhysicalMaterial,
  NeutralToneMapping,
  Shape,
  SRGBColorSpace,
  TorusGeometry,
} from 'three'
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js'
import { asset } from '../lib/venue'

const ART_WIDTH = 4
const ART_HEIGHT = 5
const UNIT = ART_WIDTH / 1000
const DISK_Y = (625 - 470) * UNIT

type Artwork = {
  texture: CanvasTexture
  relief: ExtrudeGeometry
  body: ExtrudeGeometry
  face: CircleGeometry
  rim: TorusGeometry
  gold: MeshPhysicalMaterial
  paint: MeshPhysicalMaterial
}

function disposeArtwork(art: Artwork): void {
  art.texture.dispose()
  art.relief.dispose()
  art.body.dispose()
  art.face.dispose()
  art.rim.dispose()
  art.gold.dispose()
  art.paint.dispose()
}

function makeArtwork(svg: string, image: HTMLImageElement): Artwork {
  const source = new DOMParser().parseFromString(svg, 'image/svg+xml')
  const gold = source.querySelector('#gold-relief')
  if (!gold) throw new Error('Logo has no gold relief group')
  gold.setAttribute('fill', '#d8ad55')
  const reliefSvg = `<svg xmlns="http://www.w3.org/2000/svg">${gold.outerHTML}</svg>`
  const shapes = new SVGLoader().parse(reliefSvg).paths.flatMap((path) => SVGLoader.createShapes(path))
  if (!shapes.length) throw new Error('Logo relief has no closed shapes')
  const canvas = document.createElement('canvas')
  canvas.width = 1024
  canvas.height = 1280
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Logo painting canvas is unavailable')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.anisotropy = 4
  // Original closed contours, including letter counters, become real beveled gold.
  const relief = new ExtrudeGeometry(shapes, {
    depth: 9,
    bevelEnabled: true,
    bevelSize: 0.8,
    bevelThickness: 0.8,
    bevelSegments: 2,
    curveSegments: 2,
    steps: 1,
  })
  relief.translate(-500, -625, 0)
  const disk = new Shape()
  disk.absarc(0, 0, 1.65, 0, Math.PI * 2, false)
  const body = new ExtrudeGeometry(disk, {
    depth: 0.10,
    bevelEnabled: true,
    bevelSize: 0.03,
    bevelThickness: 0.025,
    bevelSegments: 4,
    curveSegments: 96,
    steps: 1,
  })
  const face = new CircleGeometry(408 * UNIT, 128)
  const points = face.getAttribute('position')
  const uv = face.getAttribute('uv')
  // The texture contains the full logo, not just the disk: map circle vertices
  // into its 1000×1250 artwork coordinates so relief and painting line up.
  for (let i = 0; i < points.count; i++) {
    uv.setXY(i, (500 + points.getX(i) / UNIT) / 1000, 1 - (470 - points.getY(i) / UNIT) / 1250)
  }
  uv.needsUpdate = true
  return {
    texture, relief, body, face, rim: new TorusGeometry(1.664, 0.015, 12, 128),
    gold: new MeshPhysicalMaterial({ color: '#e6bc67', metalness: 0.95, roughness: 0.31, envMapIntensity: 1.3 }),
    paint: new MeshPhysicalMaterial({ map: texture, roughness: 0.72, metalness: 0, clearcoat: 0.18, clearcoatRoughness: 0.5 }),
  }
}

function hasWebGL(): boolean {
  try {
    const probe = document.createElement('canvas')
    const context = probe.getContext('webgl2')
    if (!context) return false
    context.getExtension('WEBGL_lose_context')?.loseContext()
    return true
  } catch {
    return false
  }
}

function useMedia(query: string): boolean {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const media = window.matchMedia(query)
    const change = (): void => setMatch(media.matches)
    change()
    media.addEventListener('change', change)
    return () => media.removeEventListener('change', change)
  }, [query])
  return match
}

/** Frame-rate independent exponential smoothing for decorative pointer tilt. */
function damp(current: number, target: number, dt: number): number {
  return MathUtils.lerp(current, target, 1 - Math.exp(-3.2 * dt))
}

function Scene({ art, reduced, fine, onRendered, onContextLost }: {
  art: Artwork
  reduced: boolean
  fine: boolean
  onRendered: () => void
  onContextLost: () => void
}): React.JSX.Element {
  const { viewport, size, gl } = useThree()
  const logo = useRef<Group>(null)
  const pointer = useRef({ x: 0, y: 0 })
  const mobile = size.width < 768
  const pixels = mobile
    ? Math.min(size.width * 0.6, 280, window.innerHeight * 0.304)
    : Math.min(size.width * 0.32, 520, window.innerHeight * 0.6)
  const scale = pixels / size.width * viewport.width / ART_WIDTH
  const centerX = mobile ? 0 : viewport.width * (0.42 - pixels / size.width / 2)
  const centerY = mobile
    ? viewport.height * (0.37 - pixels * (ART_HEIGHT / ART_WIDTH) / size.height / 2)
    : 0

  useEffect(() => {
    pointer.current.x = 0
    pointer.current.y = 0
    if (!fine || mobile || reduced) return
    const move = (event: PointerEvent): void => {
      pointer.current.x = event.clientX / window.innerWidth * 2 - 1
      pointer.current.y = -(event.clientY / window.innerHeight * 2 - 1)
    }
    window.addEventListener('pointermove', move, { passive: true })
    return () => window.removeEventListener('pointermove', move)
  }, [fine, mobile, reduced])

  useEffect(() => {
    const canvas = gl.domElement
    canvas.addEventListener('webglcontextlost', onContextLost)
    return () => canvas.removeEventListener('webglcontextlost', onContextLost)
  }, [gl, onContextLost])

  useFrame(({ clock }, rawDelta) => {
    const group = logo.current
    if (!group || reduced) return
    const dt = Math.min(rawDelta, 0.05)
    const time = clock.elapsedTime
    group.rotation.x = damp(group.rotation.x, Math.sin(time * 0.31) * 0.025 - pointer.current.y * 0.07, dt)
    group.rotation.y = damp(group.rotation.y, -0.07 + Math.sin(time * 0.23) * 0.045 + pointer.current.x * 0.13, dt)
    group.position.y = Math.sin(time * 0.42) * 0.022
  })

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[-4, 5, 6]} intensity={0.85} castShadow
        shadow-mapSize={[1024, 1024]} shadow-camera-left={-4} shadow-camera-right={4}
        shadow-camera-top={4} shadow-camera-bottom={-4} shadow-normalBias={0.002} shadow-bias={-0.0001} />
      <group position={[centerX, centerY, 0]} scale={scale} dispose={null}>
        <group ref={logo} rotation={[0, -0.07, 0]}>
          <mesh geometry={art.body} material={art.gold} position={[0, DISK_Y, -0.125]} />
          <mesh geometry={art.face} material={art.paint} position={[0, DISK_Y, 0.005]} receiveShadow />
          <mesh geometry={art.rim} material={art.gold} position={[0, DISK_Y, 0.008]} />
          <mesh geometry={art.relief} material={art.gold} scale={[UNIT, -UNIT, UNIT]} castShadow
            position={[0, 0, 0.018]} onAfterRender={onRendered} />
        </group>
      </group>
      <Environment resolution={128} frames={1}>
        <Lightformer form="rect" intensity={2.5} position={[-3, 4, 5]} scale={[5, 6, 1]} color="#fff7df" />
        <Lightformer form="rect" intensity={1.8} position={[4, 1, 4]} scale={[2, 6, 1]} color="#ffffff" />
        <Lightformer form="rect" intensity={1.2} position={[0, -4, 3]} scale={[7, 2, 1]} color="#e5b77c" />
        <Lightformer form="rect" intensity={1.1} position={[0, 0, 8]} scale={[12, 10, 1]} color="#fff9e9" />
      </Environment>
    </>
  )
}

/** Single gold business-logo medallion; the SVG poster covers unsupported or failed WebGL. */
export default function HeroScene(): React.JSX.Element | null {
  const [enabled, setEnabled] = useState(hasWebGL)
  const reduced = useMedia('(prefers-reduced-motion: reduce)')
  const fine = useMedia('(hover: hover) and (pointer: fine)')
  const [art, setArt] = useState<Artwork | null>(null)
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const [tabVisible, setTabVisible] = useState(() => !document.hidden)
  const host = useRef<HTMLDivElement>(null)
  const activeArt = useRef<Artwork | null>(null)
  const rendered = useRef(false)

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    let made: Artwork | null = null
    let objectUrl: string | null = null
    const controller = new AbortController()
    rendered.current = false
    // Activity preserves state but disposes the old WebGL generation. Reset it
    // before loading fresh resources so resumed canvases never reuse disposed art.
    setReady(false)
    setArt(null)
    void (async () => {
      try {
        const response = await fetch(asset('hero-logo.svg'), { signal: controller.signal })
        if (!response.ok) throw new Error('Logo artwork could not be loaded')
        const svg = await response.text()
        const blob = new Blob([svg], { type: 'image/svg+xml' })
        if (cancelled) return
        const image = new Image()
        objectUrl = URL.createObjectURL(blob)
        image.src = objectUrl
        await image.decode()
        if (cancelled) return
        made = makeArtwork(svg, image)
        activeArt.current = made
        setArt(made)
      } catch (error) {
        if (!cancelled) {
          console.warn('3D logo unavailable; retaining static artwork.', error)
          setEnabled(false)
        }
      } finally {
        if (objectUrl) URL.revokeObjectURL(objectUrl)
      }
    })()
    return () => {
      cancelled = true
      controller.abort()
      activeArt.current = null
      rendered.current = false
      if (made) disposeArtwork(made)
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [enabled])

  useEffect(() => {
    const element = host.current
    if (!element) return
    const observer = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), { rootMargin: '80px' })
    const visibility = (): void => setTabVisible(!document.hidden)
    visibility()
    observer.observe(element)
    document.addEventListener('visibilitychange', visibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', visibility)
    }
  }, [enabled])

  const markRendered = useCallback((): void => {
    if (!art || activeArt.current !== art || rendered.current) return
    rendered.current = true
    queueMicrotask(() => {
      if (activeArt.current === art && host.current) setReady(true)
    })
  }, [art])

  const contextLost = useCallback((): void => {
    rendered.current = false
    setReady(false)
    setEnabled(false)
  }, [])

  if (!enabled) return null
  const frameloop = !visible || !tabVisible ? 'never' : reduced ? 'demand' : 'always'
  return (
    <div ref={host} data-logo-ready={ready ? 'true' : 'false'} aria-hidden="true"
      className="pointer-events-none absolute inset-0 transition-opacity duration-700 ease-out"
      style={{ opacity: ready ? 1 : 0 }}>
      {art && <Canvas shadows frameloop={frameloop} dpr={[1, 1.75]}
        camera={{ position: [0, 0, 9], fov: 30, near: 0.1, far: 40 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'low-power' }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 0)
          gl.toneMapping = NeutralToneMapping
        }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <Scene art={art} reduced={reduced} fine={fine} onRendered={markRendered} onContextLost={contextLost} />
      </Canvas>}
    </div>
  )
}
