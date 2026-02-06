import * as THREE from 'three'
import Experience from './Experience.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { BokehPass } from 'three/examples/jsm/postprocessing/BokehPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'
import { GammaCorrectionShader } from 'three/examples/jsm/shaders/GammaCorrectionShader.js'
import { SMAAPass } from 'three/examples/jsm/postprocessing/SMAAPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'

export default class Renderer {
    constructor() {
        this.experience = new Experience()
        this.canvas = this.experience.canvas
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.camera = this.experience.camera

        this.setInstance()
        this.setPostProcessing()
        this.setDebug()
    }

    setInstance() {
        this.instance = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            }
        )

        this.instance.shadowMap.enabled = true
        this.instance.shadowMap.type = THREE.PCFSoftShadowMap
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)
    }

    setPostProcessing() {
        // Render target
        this.renderTarget = new THREE.WebGLRenderTarget(
            this.sizes.width,
            this.sizes.height,
            {
                samples: this.instance.getPixelRatio() === 1 ? 2 : 0,
            })

        // Effect Composer
        this.effectComposer = new EffectComposer(this.instance, this.renderTarget)
        this.effectComposer.setPixelRatio(this.sizes.pixelRatio)
        this.effectComposer.setSize(this.sizes.width, this.sizes.height)

        // Render pass
        const renderPass = new RenderPass(this.scene, this.camera.instance)
        this.effectComposer.addPass(renderPass)

        // Bokeh pass
        this.bokehPass = new BokehPass(this.scene, this.camera.instance, {
            focus: 5.75,
            aperture: 0.00043,
            maxblur: 0.8
        })
        this.effectComposer.addPass(this.bokehPass)

        // Bloom pass
        this.bloomPass = new UnrealBloomPass(new THREE.Vector2(this.sizes.width, this.sizes.height),
            .3,
            1,
            .6)
        this.effectComposer.addPass(this.bloomPass)

        // Gamma correction pass
        const gammaCorrectionPass = new ShaderPass(GammaCorrectionShader)
        this.effectComposer.addPass(gammaCorrectionPass)

        // SMAA pass
        if (this.instance.getPixelRatio() === 1 && !this.instance.capabilities.isWebGL2) {
            const smaaPass = new SMAAPass(this.renderTarget)
            this.effectComposer.addPass(smaaPass)
        }
    }

    setDebug() {
        if (this.experience.debug.active) {
            // Debug bokehPass
            const debugDof = this.experience.debug.ui.addFolder('Depth of Field')
            debugDof.add(this.bokehPass.uniforms.focus, 'value', 4, 8.5).name('Focus')
            debugDof.add(this.bokehPass.uniforms.aperture, 'value', 0.00033, 0.00066).name('Aperture')
            debugDof.add(this.bokehPass.uniforms.maxblur, 'value', 0, 2, 0.0001).name('Max Blur')

            // Debug bloomPass
            const debugBloom = this.experience.debug.ui.addFolder('Bloom')
            debugBloom.add(this.bloomPass, 'strength', 0, 5).name('Strength')
            debugBloom.add(this.bloomPass, 'radius', 0, 1.5).name('Radius')
            debugBloom.add(this.bloomPass, 'threshold', 0, 1).name('Threshold')
        }
    }

    resize() {
        this.instance.setSize(this.sizes.width, this.sizes.height)
        this.instance.setPixelRatio(this.sizes.pixelRatio)

        this.effectComposer.setSize(this.sizes.width, this.sizes.height)
        this.effectComposer.setPixelRatio(this.sizes.pixelRatio)
    }

    update() {
        // this.instance.render(this.scene, this.camera.instance)
        this.effectComposer.render()

    }
}