import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'

function supportsWebGL() {
  try {
    const canvas = document.createElement('canvas')
    return !!(canvas.getContext('webgl2') || canvas.getContext('webgl'))
  } catch {
    return false
  }
}

// Simple stylized car so the page works even without a downloaded model.
function buildFallbackCar() {
  const group = new THREE.Group()
  const bodyMat = new THREE.MeshPhysicalMaterial({ color: 0x0b0b0d })
  const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.7, 1.6), bodyMat)
  body.position.y = 0.55
  const cabin = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.55, 1.4), bodyMat)
  cabin.position.set(-0.2, 1.15, 0)
  group.add(body, cabin)
  const wheelMat = new THREE.MeshStandardMaterial({ color: 0x15161a, roughness: 0.8 })
  const wheelGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.3, 24)
  for (const [x, z] of [[1.25, 0.8], [1.25, -0.8], [-1.25, 0.8], [-1.25, -0.8]]) {
    const wheel = new THREE.Mesh(wheelGeo, wheelMat)
    wheel.rotation.x = Math.PI / 2
    wheel.position.set(x, 0.38, z)
    group.add(wheel)
  }
  return { object: group, bodyMeshes: [body, cabin] }
}

// The paint shell is whichever mesh has the most vertices once glass, lights,
// wheels and trim materials are excluded; meshes sharing its material join it.
const NON_PAINT = /window|glass|head|tail|light|wheel|tyre|tire|chrome|trim|black|grey|gray/i

function findBodyMeshes(root) {
  const meshes = []
  root.traverse((o) => { if (o.isMesh) meshes.push(o) })
  const explicit = meshes.filter((m) => /body|paint/i.test(m.material?.name || ''))
  if (explicit.length) return explicit
  const candidates = meshes.filter((m) => !NON_PAINT.test(m.material?.name || m.name))
  const pool = candidates.length ? candidates : meshes
  let best = pool[0]
  for (const m of pool) {
    const count = m.geometry?.attributes?.position?.count ?? 0
    const bestCount = best.geometry?.attributes?.position?.count ?? 0
    if (count > bestCount) best = m
  }
  if (!best) return []
  const paintMaterial = best.material
  return meshes.filter((m) => m.material === paintMaterial)
}

async function loadCar() {
  const url = `${import.meta.env.BASE_URL}models/car.glb`
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const gltf = await loader.loadAsync(url)
  const object = gltf.scene
  // Normalize: ~4 units long, centered on origin, resting on y=0. The stage
  // dressing (contact shadow, camera framing) assumes the car's length runs
  // along Z, so rotate models that are authored X-long.
  let box = new THREE.Box3().setFromObject(object)
  let size = box.getSize(new THREE.Vector3())
  if (size.x > size.z) {
    object.rotation.y = Math.PI / 2
    object.updateMatrixWorld(true)
    box = new THREE.Box3().setFromObject(object)
    size = box.getSize(new THREE.Vector3())
  }
  const scale = 4 / Math.max(size.x, size.z)
  object.scale.setScalar(scale)
  const scaled = new THREE.Box3().setFromObject(object)
  const center = scaled.getCenter(new THREE.Vector3())
  object.position.x -= center.x
  object.position.z -= center.z
  // Rest the car on y=0 using a low vertex-density percentile: bounding boxes
  // can contain phantom outlier vertices (compression artifacts) far below the
  // real tread line, which would leave the car hovering above the floor.
  object.updateMatrixWorld(true)
  const v = new THREE.Vector3()
  const ys = []
  object.traverse((o) => {
    if (!o.isMesh) return
    const pos = o.geometry.attributes.position
    const step = Math.max(1, Math.floor(pos.count / 20000))
    for (let i = 0; i < pos.count; i += step) {
      ys.push(v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld).y)
    }
  })
  ys.sort((a, b) => a - b)
  const ground = ys.length ? ys[Math.floor(0.001 * (ys.length - 1))] : scaled.min.y
  object.position.y -= ground + 0.01
  return { object, bodyMeshes: findBodyMeshes(object) }
}

export async function createCarViewer(container) {
  if (!supportsWebGL()) {
    container.classList.add('viewer-fallback')
    return null
  }

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  container.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  const pmrem = new THREE.PMREMGenerator(renderer)
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
  pmrem.dispose()
  scene.environmentIntensity = 0.55

  // Branded studio lighting: white key from the front-right, YW-orange rim from behind.
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
  keyLight.position.set(2.0, 6, 1.6)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.left = -4
  keyLight.shadow.camera.right = 4
  keyLight.shadow.camera.top = 4
  keyLight.shadow.camera.bottom = -4
  scene.add(keyLight)
  // amber rim: a focused spot aimed at the body so it kisses the car without
  // washing the floor gold (light.layers can't scope per-object — three.js
  // only tests light layers against the camera)
  const rimLight = new THREE.SpotLight(0xFA9C20, 45, 12, 0.3, 0.6, 2)
  rimLight.position.set(-4.5, 2.8, -4.5)
  rimLight.target.position.set(0, 0.85, 0)
  scene.add(rimLight, rimLight.target)

  // visible studio ground: wide dark floor + turntable stage with an amber rim;
  // linear fog fades the floor edge into the page background
  scene.fog = new THREE.Fog(0x0a0a0b, 9, 17)

  const floorMat = new THREE.MeshStandardMaterial({ color: 0x08080a, roughness: 0.7, metalness: 0.2 })
  floorMat.envMapIntensity = 0.14
  const floor = new THREE.Mesh(new THREE.CircleGeometry(14, 64), floorMat)
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const stageMat = new THREE.MeshStandardMaterial({ color: 0x101014, roughness: 0.35, metalness: 0.5 })
  stageMat.envMapIntensity = 0.35
  const stage = new THREE.Mesh(new THREE.CylinderGeometry(2.75, 2.75, 0.07, 64), stageMat)
  stage.position.y = -0.033 // top face flush with the wheels
  stage.receiveShadow = true
  scene.add(stage)

  const rim = new THREE.Mesh(
    new THREE.RingGeometry(2.7, 2.75, 64),
    new THREE.MeshBasicMaterial({ color: 0xFA9C20, transparent: true, opacity: 0.55, side: THREE.DoubleSide })
  )
  rim.rotation.x = -Math.PI / 2
  rim.position.y = 0.005
  scene.add(rim)

  const shadowCatcher = new THREE.Mesh(new THREE.CircleGeometry(8, 48), new THREE.ShadowMaterial({ opacity: 0.35 }))
  shadowCatcher.rotation.x = -Math.PI / 2
  shadowCatcher.position.y = 0.006
  shadowCatcher.receiveShadow = true
  scene.add(shadowCatcher)

  // soft contact shadow under the car footprint — glues the car to the ground
  const aoCanvas = document.createElement('canvas')
  aoCanvas.width = aoCanvas.height = 256
  const aoCtx = aoCanvas.getContext('2d')
  const aoGrad = aoCtx.createRadialGradient(128, 128, 40, 128, 128, 126)
  aoGrad.addColorStop(0, 'rgba(0,0,0,0.9)')
  aoGrad.addColorStop(0.7, 'rgba(0,0,0,0.5)')
  aoGrad.addColorStop(1, 'rgba(0,0,0,0)')
  aoCtx.fillStyle = aoGrad
  aoCtx.fillRect(0, 0, 256, 256)
  const contactShadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1.75, 4.15), // car length runs along Z
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(aoCanvas), transparent: true, depthWrite: false })
  )
  contactShadow.rotation.x = -Math.PI / 2
  contactShadow.position.y = 0.009
  scene.add(contactShadow)

  const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(4.4, 1.45, 4.7)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableZoom = true
  controls.minDistance = 3.4
  controls.maxDistance = 9
  controls.zoomSpeed = 0.7
  controls.maxPolarAngle = Math.PI / 2.05
  controls.target.set(0, 0.58, 0)
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.1
  let idleTimer
  controls.addEventListener('start', () => { controls.autoRotate = false; clearTimeout(idleTimer) })
  controls.addEventListener('end', () => { idleTimer = setTimeout(() => { controls.autoRotate = true }, 3000) })

  let car
  try {
    car = await loadCar()
  } catch {
    car = buildFallbackCar()
  }
  car.object.traverse((o) => { if (o.isMesh) o.castShadow = true })
  scene.add(car.object)

  const bodyMaterial = new THREE.MeshPhysicalMaterial({ color: 0xFA9C20, roughness: 0.12, clearcoat: 1.0, clearcoatRoughness: 0.04 })
  for (const mesh of car.bodyMeshes) mesh.material = bodyMaterial

  function applyWrap(params) {
    bodyMaterial.color.set(params.color)
    bodyMaterial.roughness = params.roughness
    bodyMaterial.metalness = params.metalness
    bodyMaterial.clearcoat = params.clearcoat
    bodyMaterial.clearcoatRoughness = params.clearcoatRoughness
    bodyMaterial.iridescence = params.iridescence ?? 0
    bodyMaterial.iridescenceIOR = params.iridescenceIOR ?? 1.3
    bodyMaterial.needsUpdate = true
  }

  new ResizeObserver(() => {
    const { clientWidth: w, clientHeight: h } = container
    if (!w || !h) return
    renderer.setSize(w, h)
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }).observe(container)

  renderer.setAnimationLoop(() => {
    controls.update()
    renderer.render(scene, camera)
  })

  if (new URLSearchParams(location.search).has('debug3d')) window.__scene3d = { scene, car, camera, controls, THREE }

  return { applyWrap }
}
