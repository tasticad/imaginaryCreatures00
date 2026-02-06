import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Lights {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.debug = this.experience.debug

        // Debug
        if (this.debug.active) {
            this.debugFolder = this.debug.ui.addFolder('Lights')
            this.debugFolder.open()
        }

        this.setKeyLight()
        this.setBackLight()
    }

    setKeyLight() {
        this.keyLight = new THREE.Object3D();
        this.keyLight.position.set(2, 15, 10)
        this.scene.add(this.keyLight)
    }

    setBackLight() {
        this.backLight = new THREE.Object3D();
        this.backLight.position.set(-10, 5, -5)
        this.backLight.color = new THREE.Color('#66e1ea')
        this.scene.add(this.backLight)

        // Debug
        if (this.debug.active) {
            this.debugFolder.addColor(this.backLight, 'color').name('Back Light color').listen()
                .onChange(() => { this.backLight.color.set(this.backLight.color) })
        }
    }

    update() {
        // Update shader's shadow step min
        // if (this.experience.world.creature.baseMat.userData.shader) {
        //     this.experience.world.creature.baseMat.userData.shader.uniforms.shadowStepMin.value =
        //         this.backLight.userData.shadowStepMin
        // }
    }
}