import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor({ model, texture }) {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Setup
        this.modResource = this.resources.items[model]
        this.texResource = this.resources.items[texture]

        this.setTextures()
        this.setMaterial()
        this.setModel()
    }

    setTextures() {
        this.textures = {}

        this.textures.color = this.texResource
        this.textures.color.colorSpace = THREE.SRGBColorSpace
    }

    setMaterial() {
        // Check if texture is transparent
        // const src = this.textures.color.source?.data?.src || ''
        // const isTransparent = src.toLowerCase().endsWith('.png')

        this.material = new THREE.MeshBasicMaterial({ // MeshBasicMaterial = no shader & shadows
            color: "#ffffff",
            map: this.textures.color,
            alphaTest: 0.5
        })
    }

    setModel() {
        this.model = this.modResource.scene
        this.model.scale.set(0.33, 0.33, 0.33)
        this.scene.add( this.model)

        this.model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                child.material = this.material
                child.receiveShadow = true
            }
        })
    }

}