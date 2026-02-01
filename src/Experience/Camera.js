import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import Experience from './Experience.js'
import Time from './Utils/Time.js'
// import gsap from "gsap"

export default class Camera {
    constructor() {
        this.experience = new Experience()
        this.sizes = this.experience.sizes
        this.scene = this.experience.scene
        this.canvas = this.experience.canvas

        this.time = new Time()
        this.elapsedTime = 0

        this.time.on('tick', () => {
            this.elapsedTime = this.time.elapsed * 0.001
        })

        this.setInstance()
        this.setOrbitControls()
        this.setAutoOrbit()
    }

    setInstance() {
        this.instance = new THREE.PerspectiveCamera(
            50,
            this.sizes.width / this.sizes.height,
            0.1,
            100
        )
        this.instance.position.set(0, 1.5, 4.5)
        this.scene.add(this.instance)
    }

    setOrbitControls() {
        this.controls = new OrbitControls(this.instance, this.canvas)
        this.controls.target.set(0, 1, 0);
        this.controls.enableDamping = true

        this.controls.minAzimuthAngle = -Math.PI * 0.30;
        this.controls.maxAzimuthAngle =  Math.PI * 0.30;
        this.controls.minPolarAngle = Math.PI * 0.25; // Angle from above
        this.controls.maxPolarAngle = Math.PI * 0.53; // Angle from below

        this.controls.update()
    }

    setAutoOrbit() {
        const offset = this.instance.position.clone().sub(this.controls.target)

        this.baseSpherical = new THREE.Spherical().setFromVector3(offset)
        this.baseRadius = this.baseSpherical.radius

        this.autoOrbit = {
            amplitude: Math.PI * 0.25,
            speed: 0.5,
            returnSpeed: 0.04
        }

        this.userInteracting = false

        this.controls.addEventListener('start', () => {
            this.userInteracting = true
        })

        this.controls.addEventListener('end', () => {
            this.userInteracting = false
        })
    }

    resize() {
        this.instance.aspect = this.sizes.width / this.sizes.height
        this.instance.updateProjectionMatrix()
    }

    update() {
        if (!this.userInteracting) {

            const offset = this.instance.position.clone().sub(this.controls.target)
            const spherical = new THREE.Spherical().setFromVector3(offset)

            const oscillation =
                Math.sin(this.elapsedTime * this.autoOrbit.speed) *
                this.autoOrbit.amplitude

            const targetTheta = this.baseSpherical.theta + oscillation
            const targetPhi   = this.baseSpherical.phi

            spherical.theta = THREE.MathUtils.lerp(
                spherical.theta,
                targetTheta,
                this.autoOrbit.returnSpeed
            )

            spherical.phi = THREE.MathUtils.lerp(
                spherical.phi,
                targetPhi,
                this.autoOrbit.returnSpeed
            )

            spherical.phi = THREE.MathUtils.clamp(
                spherical.phi,
                this.controls.minPolarAngle,
                this.controls.maxPolarAngle
            )

            spherical.radius = this.baseRadius

            const newPos = new THREE.Vector3().setFromSpherical(spherical)
            this.instance.position.copy(this.controls.target).add(newPos)
        }

        this.controls.update()
    }
}