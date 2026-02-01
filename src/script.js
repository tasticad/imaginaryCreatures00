import Experience from './Experience/Experience.js'

const experience = new Experience(document.querySelector("canvas.webgl"));



// import * as THREE from 'three'
// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
// import GUI from 'lil-gui'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
// import { DRACOLoader} from "three/examples/jsm/loaders/DRACOLoader.js";
//
// /**
//  * Base
//  */
// // Debug
// const gui = new GUI({
//     width: 300,
//     title: 'Debug UI',
//     closeFolders: true,
// })
// gui.close()
// // gui.hide()
//
// const backLightColor = new THREE.Color(0x74e1c7);
//
// const parameters = {
//     backLightColor: '#74e1c7'
// }
//
// gui
//     .addColor(parameters, 'backLightColor')
//     .onChange(() => {
//         backLightColor.set(parameters.backLightColor)
//     })
//
// // Canvas
// const canvas = document.querySelector('canvas.webgl')
//
// // Scene
// const scene = new THREE.Scene()
// scene.background = new THREE.Color('#191919')
//
// /**
//  * Lights
//  */
// const keyLight = new THREE.Object3D();
// keyLight.position.set(2, 15, 10);
// scene.add(keyLight);
//
// const backLight = new THREE.Object3D();
// backLight.position.set(-10, 5, -5);
// scene.add(backLight);
//
// /**
//  * Textures
//  */
// const textureLoader = new THREE.TextureLoader()
//
// const shadeMaskTex = textureLoader.load('./textures/fox_shadeMask.png')
// shadeMaskTex.wrapS = shadeMaskTex.wrapT = THREE.RepeatWrapping;
// shadeMaskTex.colorSpace = THREE.LinearSRGBColorSpace;
//
// const foxColorTex = textureLoader.load('./textures/fox_col.png')
// foxColorTex.wrapS = foxColorTex.wrapT = THREE.RepeatWrapping;
// foxColorTex.colorSpace = THREE.SRGBColorSpace
//
// const foxLineTex = textureLoader.load('./textures/fox_line.png')
// foxLineTex.wrapS = foxLineTex.wrapT = THREE.RepeatWrapping;
// foxLineTex.colorSpace = THREE.LinearSRGBColorSpace
//
// /**
//  * Materials
//  */
// const baseMat = new THREE.MeshStandardMaterial({
//     color: "#ffffff",
//     defines: { USE_UV: '' },
//     map: foxColorTex,
// })
//
// const outlineMat = baseMat.clone();
// outlineMat.skinning = true;
// outlineMat.side = THREE.BackSide;
// outlineMat.depthWrite = false;
// outlineMat.depthTest = true;
// outlineMat.vertexColors = true;
// outlineMat.color.set(0x000000); // black outline
//
// outlineMat.userData.outlineThickness = 0.066;
//
// gui.add(outlineMat.userData, 'outlineThickness')
//     .min(0)
//     .max(0.2)
//     .step(0.001)
//     .name('Outline Thickness')
//
// outlineMat.onBeforeCompile = (shader) => {
//
//     shader.uniforms.outlineThickness = { value: outlineMat.userData.outlineThickness };
//
//     outlineMat.userData.shader = shader
//
//     shader.vertexShader =
//         `
//         uniform float outlineThickness;
//         ` + shader.vertexShader;
//
//     shader.vertexShader = shader.vertexShader.replace(
//         '#include <begin_vertex>',
//         `
//         #include <begin_vertex>
//         transformed += normalize(objectNormal) * outlineThickness * color.r;
//         `
//     );
// };
//
// baseMat.onBeforeCompile = (shader) => {
//
//     shader.uniforms.keyLightPos = { value: keyLight.position };
//     shader.uniforms.backLightPos = { value: backLight.position };
//     shader.uniforms.backLightCol = { value: backLightColor };
//     shader.uniforms.maskTex = { value: shadeMaskTex };
//     shader.uniforms.lineTex = { value: foxLineTex };
//
//     shader.fragmentShader =
//         `
//         uniform vec3 keyLightPos;
//         uniform vec3 backLightPos;
//         uniform vec3 backLightCol;
//         uniform sampler2D maskTex;
//         uniform sampler2D lineTex;
//         ` + shader.fragmentShader;
//
//     shader.fragmentShader = shader.fragmentShader.replace(
//         '#include <emissivemap_fragment>',
//         `
//         #include <emissivemap_fragment>
//         vec3 nrm = normalize(vNormal);
//
//         // Key mask (already computed)
//         vec3 keyDir = normalize(keyLightPos - vViewPosition);
//         float keyMask = max(dot(nrm, keyDir), 0.0);
//         keyMask = smoothstep(0.25, 0.35, keyMask);
//
//         // Base texture color
//         vec3 baseColor = diffuseColor.rgb;
//
//         vec4 line = texture2D(lineTex, vUv);
//         baseColor *= line.r;
//
//         vec3 baseColorDark = baseColor * .5;
//
//         vec3 backDir = normalize(backLightPos - vViewPosition);
//         float backMask = max(dot(nrm, backDir), 0.0);
//         backMask = step(0.33, backMask);
//
//         // Blending:
//         vec3 diffuse = mix(baseColorDark, baseColor, keyMask);
//         vec3 finalColor = mix(diffuse, backLightCol, backMask);
//
//         vec4 texMask = texture2D(maskTex, vUv);
//         keyMask *= texMask.r;
//
//         vec3 lightMask = vec3(keyMask, backMask, 0.0);
//
//         //totalEmissiveRadiance += lightMask.r;
//         totalEmissiveRadiance += finalColor;
//         `
//     );
// };
//
// /**
//  * Models
//  */
// const dracoLoader = new DRACOLoader()
// dracoLoader.setDecoderPath('/draco')
//
// const gltfLoader = new GLTFLoader()
// gltfLoader.setDRACOLoader(dracoLoader)
//
// let mixer = null
// let charaModel = null
//
// gltfLoader.load(
//     './models/FoxHunter/glTF_2/FoxHunter.gltf',
//     (gltf) => {
//         // console.log(gltf)
//
//         mixer = new THREE.AnimationMixer(gltf.scene)
//         mixer.clipAction(gltf.animations[0]).play()
//
//         gltf.scene.scale.set(0.33, 0.33, 0.33)
//         scene.add(gltf.scene)
//
//         scene.traverse((child) => {
//             //const charaModel = child.getObjectByName("Hunter")
//             if (child.name === "Hunter" && child instanceof THREE.SkinnedMesh) {
//                 charaModel = child
//
//                 charaModel.castShadow = true
//                 charaModel.material = baseMat
//
//                 console.log('Fox model assigned:', charaModel)
//
//                 // -------- OUTLINE SETUP --------
//
//                 const outlineMesh = new THREE.SkinnedMesh(
//                     charaModel.geometry,
//                     outlineMat
//                 );
//
//                 // Share skeleton
//                 outlineMesh.bind(charaModel.skeleton, charaModel.bindMatrix);
//
//                 outlineMesh.skeleton = charaModel.skeleton;
//                 outlineMesh.bindMatrix.copy(charaModel.bindMatrix);
//                 outlineMesh.bindMatrixInverse.copy(charaModel.bindMatrixInverse);
//
//                 outlineMesh.renderOrder = 0;
//                 charaModel.renderOrder = 1;
//
//                 scene.add(outlineMesh);
//
//                 console.log('Outline created ✔');
//             }
//         })
//
//     },
//     undefined,
//     (error) => console.error(error)
// )
//
// /**
//  * Background
//  */
//
//
// /**
//  * Sizes
//  */
// const sizes = {
//     width: window.innerWidth,
//     height: window.innerHeight
// }
//
// window.addEventListener('resize', () =>
// {
//     // Update sizes
//     sizes.width = window.innerWidth
//     sizes.height = window.innerHeight
//
//     // Update camera
//     camera.aspect = sizes.width / sizes.height
//     camera.updateProjectionMatrix()
//
//     // Update renderer
//     renderer.setSize(sizes.width, sizes.height)
//     renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
// })
//
// /**
//  * Camera
//  */
// // Base camera
// const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
// camera.position.set(0, 1.5, 3)
// scene.add(camera)
//
// // Controls
// const controls = new OrbitControls(camera, canvas)
// controls.target.set(0, 1, 0)
// controls.enableDamping = true
//
// controls.minAzimuthAngle = -Math.PI * 0.30;
// controls.maxAzimuthAngle =  Math.PI * 0.30;
// controls.minPolarAngle = Math.PI * 0.35;
// controls.maxPolarAngle = Math.PI * 0.6;
//
// controls.update();
//
// const baseOffset = camera.position.clone().sub(controls.target);
// const baseRadius = baseOffset.length();
//
// const baseSpherical = new THREE.Spherical().setFromVector3(baseOffset);
// // baseSpherical.theta  -> azimuth
// // baseSpherical.phi    -> polar
//
// controls.saveState();
//
// const autoOrbit = {
//     amplitude: Math.PI * 0.25,
//     speed: .5,
//     returnSpeed: 0.04
// };
//
// let userInteracting = false;
//
// controls.addEventListener('start', () => {
//     userInteracting = true;
// });
// controls.addEventListener('end', () => {
//     userInteracting = false;
// });
//
// /**
//  * Renderer
//  */
// const renderer = new THREE.WebGLRenderer({
//     canvas: canvas
// })
// renderer.shadowMap.enabled = true
// renderer.shadowMap.type = THREE.PCFSoftShadowMap
// renderer.setSize(sizes.width, sizes.height)
// renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
//
// /**
//  * Animate
//  */
// const clock = new THREE.Clock()
// let previousTime = 0
//
// const tick = () => {
//     const elapsedTime = clock.getElapsedTime()
//     const deltaTime = elapsedTime - previousTime
//     previousTime = elapsedTime
//
//     // Update mixer
//     if (mixer) {
//         mixer.update(deltaTime)
//     }
//
//     // Update outline thickness
//     if (outlineMat.userData.shader) {
//         outlineMat.userData.shader.uniforms.outlineThickness.value =
//             outlineMat.userData.outlineThickness;
//     }
//
//     // Camera anim (ping-pong + easing)
//     const offset = camera.position.clone().sub(controls.target);
//     const spherical = new THREE.Spherical().setFromVector3(offset);
//
//     if (!userInteracting) {
//
//         // Gentle left/right motion
//         const oscillation =
//             Math.sin(elapsedTime * autoOrbit.speed) * autoOrbit.amplitude;
//
//         const targetTheta = baseSpherical.theta + oscillation;
//         const targetPhi   = baseSpherical.phi;
//
//         // Ease BOTH angles
//         spherical.theta = THREE.MathUtils.lerp(
//             spherical.theta,
//             targetTheta,
//             autoOrbit.returnSpeed
//         );
//
//         spherical.phi = THREE.MathUtils.lerp(
//             spherical.phi,
//             targetPhi,
//             autoOrbit.returnSpeed
//         );
//
//         // Clamp for safety
//         spherical.phi = THREE.MathUtils.clamp(
//             spherical.phi,
//             controls.minPolarAngle,
//             controls.maxPolarAngle
//         );
//
//         spherical.radius = baseRadius;
//
//         // Apply back to camera
//         const newPos = new THREE.Vector3().setFromSpherical(spherical);
//         camera.position.copy(controls.target).add(newPos);
//     }
//
//     // Update controls
//     controls.update()
//
//     // Render
//     renderer.render(scene, camera)
//
//     // Call tick again on the next frame
//     window.requestAnimationFrame(tick)
// }
//
// tick()