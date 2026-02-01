import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Creature {
    constructor({ model, colTexture, shdTexture }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources
        this.time = this.experience.time
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Creature')
        }

        // Setup
        this.modResource = this.resources.items[model]
        this.colTexResource = this.resources.items[colTexture]
        this.shdTexResource = this.resources.items[shdTexture]

        this.setTextures()
        this.setBaseMaterial()
        this.setOutlineMaterial()
        this.setModel()
        this.setAnimation()
    }

    setTextures() {
        this.textures = {}

        // this.textures.color = this.resources.items.foxColorTex
        this.textures.color = this.colTexResource
        this.textures.color.colorSpace = THREE.SRGBColorSpace
        this.textures.shadeMaskTex = this.shdTexResource
    } ;

    setBaseMaterial() {
        this.baseMat = new THREE.MeshStandardMaterial({
            color: "#ffffff",
            defines: { USE_UV: '' },
            map: this.textures.color,
        })

        this.baseMat.userData.shadowStepMin = 0.26

        this.baseMat.onBeforeCompile = (shader) => {

            shader.uniforms.keyLightPos = { value: this.experience.world.lights.keyLight.position }
            shader.uniforms.backLightPos = { value: this.experience.world.lights.backLight.position }
            shader.uniforms.backLightCol = { value: this.experience.world.lights.backLight.color }
            shader.uniforms.shadowStepMin = { value: this.baseMat.userData.shadowStepMin }
            shader.uniforms.maskTex = { value: this.textures.shadeMaskTex };

            this.baseMat.userData.shader = shader

            shader.fragmentShader =
                `
            uniform vec3 keyLightPos;
            uniform vec3 backLightPos;
            uniform vec3 backLightCol;
            uniform float shadowStepMin;
            uniform sampler2D maskTex;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                `
                #include <emissivemap_fragment>
                vec3 nrm = normalize(vNormal);
        
                // Key mask (already computed)
                vec3 keyDir = normalize(keyLightPos - vViewPosition);
                float keyMask = max(dot(nrm, keyDir), 0.0);
                float ssMin = shadowStepMin;
                float ssMax = ssMin + 0.1;
                keyMask = smoothstep(ssMin, ssMax, keyMask);
                
                // Base texture color
                vec3 baseColor = diffuseColor.rgb;
                        
                vec3 baseColorDark = baseColor * .5;
                
                vec3 backDir = normalize(backLightPos - vViewPosition);
                float backMask = max(dot(nrm, backDir), 0.0);
                backMask = step(0.33, backMask);
                
                // Blending:
                vec3 diffuse = mix(baseColorDark, baseColor, keyMask);
                vec3 finalColor = mix(diffuse, backLightCol, backMask);
                //vec3 finalColor = mix(diffuse, , backMask);
                
                vec4 texMask = texture2D(maskTex, vUv);
                keyMask *= texMask.r;
                
                vec3 lightMask = vec3(keyMask, backMask, 0.0);
                
                //totalEmissiveRadiance += lightMask.r;
                totalEmissiveRadiance += finalColor;
                `
            )
        }

        if (this.experience.world.lights.debug.active) {
            this.experience.world.lights.debugFolder
                .add(this.baseMat.userData, 'shadowStepMin', 0.0, 1.0, 0.001)
                .name('Shadow Step min')
        }
    }

    setOutlineMaterial() {
        this.outlineMat = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.BackSide,
            // skinning: true,
            vertexColors: true
        })

        this.outlineMat.userData.outlineThickness = 0.055

        this.outlineMat.onBeforeCompile = (shader) => {

            shader.uniforms.outlineThickness = {
                value: this.outlineMat.userData.outlineThickness
            }

            this.outlineMat.userData.shader = shader

            shader.vertexShader =
                `
            uniform float outlineThickness;
            ` + shader.vertexShader;

            shader.vertexShader = shader.vertexShader.replace(
                '#include <begin_vertex>',
                `
                #include <begin_vertex>
                transformed += normalize(objectNormal) * outlineThickness * color.r;
                `
            )
        }

        // Debug
        if (this.debug.active) {
            this.debugFolder
                .add(this.outlineMat.userData, 'outlineThickness', 0, 0.11, 0.001)
                .name('Outline Thickness')
        }
    }

    setModel() {
        this.model = this.modResource.scene
        this.model.scale.set(0.33, 0.33, 0.33)
        this.scene.add(this.model)

        this.model.traverse(child => {
            if (child.isSkinnedMesh && !child.userData.isOutline) {

                // Base material
                child.material = this.baseMat

                // Outline mesh
                const outlineMesh = new THREE.SkinnedMesh(
                    child.geometry,
                    this.outlineMat
                )

                // Avoid infinite recursion
                outlineMesh.userData.isOutline = true

                // Bind same skeleton
                outlineMesh.bind(child.skeleton, child.bindMatrix)

                outlineMesh.frustumCulled = false
                outlineMesh.renderOrder = -1
                child.renderOrder = 0

                child.add(outlineMesh)
            }
        })
    }

    setAnimation() {
        this.animation = {}
        this.animation.mixer = new THREE.AnimationMixer(this.model)

        this.animation.actions = {}

        this.animation.actions.idle = this.animation.mixer.clipAction(this.modResource.animations[0])
        // this.animation.actions.bowCheck = this.animation.mixer.clipAction(this.modResource.animations[1])

        this.animation.actions.current = this.animation.actions.idle
        this.animation.actions.current.play()

        // Setup animation blending
        this.animation.play = (name) => {
            const newAction = this.animation.actions[name]
            const oldAction = this.animation.actions.current

            newAction.reset()
            newAction.play()
            newAction.crossFadeFrom(oldAction, .5, true)

            this.animation.actions.current = newAction
        }

        // Debug
        if (this.debug.active) {
            const debugObject = {
                playIdle: () => this.animation.play('idle'),
                playBowCheck: () => this.animation.play('idle')
            }
            this.debugFolder.add(debugObject, 'playIdle')
            this.debugFolder.add(debugObject, 'playBowCheck')
        }
    }

    update() {
        // Update animation
        this.animation.mixer.update(this.time.delta * 0.001)

        // Update baseMat's shadow step min
        if (this.baseMat.userData.shader) {
            this.baseMat.userData.shader.uniforms.shadowStepMin.value =
                this.baseMat.userData.shadowStepMin
        }

        // Update outline thickness
        if (this.outlineMat.userData.shader) {
            this.outlineMat.userData.shader.uniforms.outlineThickness.value =
                this.outlineMat.userData.outlineThickness
        }
    }
}