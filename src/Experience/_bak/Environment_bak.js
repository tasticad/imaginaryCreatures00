import * as THREE from 'three'
import Experience from '../Experience.js'

export default class Environment {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Setup
        this.resource = this.resources.items.groundModel
        console.log('ENVIRONMENT MODEL: ', this.resource)

        this.setTextures()
        this.setMaterial()
        this.setModel()
    }

    setTextures() {
        this.textures = {}

        this.textures.color = this.resources.items.groundTex
        this.textures.color.colorSpace = THREE.SRGBColorSpace
    }

    setMaterial() {
        this.material = new THREE.MeshLambertMaterial({ // MeshBasicMaterial = no shader & shadows
            color: "#ffffff",
            map: this.textures.color,
            receiveShadow: true,
            transparent: true,
        })

        this.material.onBeforeCompile = (shader) => {

            shader.uniforms.keyLightPos = { value: this.experience.world.lights.keyLight.position }
            shader.uniforms.backLightPos = { value: this.experience.world.lights.backLight.position }
            // NEED TO REPLACE WITH BACKLIGHT FROM PARAMETERS
            shader.uniforms.backLightCol = { value: this.experience.world.lights.backLight.color }

            shader.fragmentShader =
            `
            uniform vec3 keyLightPos;
            uniform vec3 backLightPos;
            uniform vec3 backLightCol;
            ` + shader.fragmentShader;

            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <emissivemap_fragment>',
                `
                #include <emissivemap_fragment>
                vec3 nrm = normalize(vNormal);
        
                // Key mask (already computed)
                vec3 keyDir = normalize(keyLightPos - vViewPosition);
                float keyMask = max(dot(nrm, keyDir), 0.0);
                keyMask = smoothstep(0.25, 0.35, keyMask);
                
                // Base texture color
                vec3 baseColor = diffuseColor.rgb;
                        
                vec3 baseColorDark = baseColor * .5;
                
                vec3 backDir = normalize(backLightPos - vViewPosition);
                float backMask = max(dot(nrm, backDir), 0.0);
                backMask = step(0.33, backMask);
                
                // NEED TO REPLACE WITH BACKLIGHT FROM PARAMETERS
                vec3 backLightCol = vec3(.0, 1.0, 1.0);
                
                // Blending:
                vec3 diffuse = mix(baseColorDark, baseColor, keyMask);
                vec3 finalColor = mix(diffuse, backLightCol, backMask);
                
                vec3 lightMask = vec3(keyMask, backMask, 0.0);
                
                //totalEmissiveRadiance += lightMask.r;
                totalEmissiveRadiance += finalColor;
                `
            );
        };
    }

    setModel() {
        this.model = this.resource.scene
        this.model.scale.set(0.33, 0.33, 0.33)
        this.scene.add( this.model)

        this.model.traverse(child => {
            if (child instanceof THREE.Mesh) {
                console.log(child)
                child.material = this.material
                child.receiveShadow = true
            }
        })
    }

}