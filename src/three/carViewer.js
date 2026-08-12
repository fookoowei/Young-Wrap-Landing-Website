import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
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
  const gltf = await new GLTFLoader().loadAsync(url)
  const object = gltf.scene
  // Normalize: ~4 units long, centered on origin, resting on y=0.
  const box = new THREE.Box3().setFromObject(object)
  const size = box.getSize(new THREE.Vector3())
  const scale = 4 / Math.max(size.x, size.z)
  object.scale.setScalar(scale)
  const scaled = new THREE.Box3().setFromObject(object)
  const center = scaled.getCenter(new THREE.Vector3())
  object.position.x -= center.x
  object.position.z -= center.z
  object.position.y -= scaled.min.y
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
  scene.environmentIntensity = 0.55

  // Branded studio lighting: white key from the front-right, YW-orange rim from behind.
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.6)
  keyLight.position.set(3.5, 5, 2.5)
  keyLight.castShadow = true
  keyLight.shadow.mapSize.set(1024, 1024)
  keyLight.shadow.camera.left = -4
  keyLight.shadow.camera.right = 4
  keyLight.shadow.camera.top = 4
  keyLight.shadow.camera.bottom = -4
  scene.add(keyLight)
  const rimLight = new THREE.DirectionalLight(0xFA9C20, 2.2)
  rimLight.position.set(-4, 2, -4)
  scene.add(rimLight)

  const floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), new THREE.ShadowMaterial({ opacity: 0.4 }))
  floor.rotation.x = -Math.PI / 2
  floor.receiveShadow = true
  scene.add(floor)

  const camera = new THREE.PerspectiveCamera(36, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(4.4, 2.0, 4.7)

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.enablePan = false
  controls.enableZoom = false
  controls.maxPolarAngle = Math.PI / 2.05
  controls.target.set(0, 1.35, 0)
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

  return { applyWrap }
}
