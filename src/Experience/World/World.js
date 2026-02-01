import Experience from '../Experience.js'
import Lights from './Lights.js'
import AssetsBuilder from "../assetsBuilder.js"

export default class World {
    constructor() {
        this.experience = new Experience()
        this.scene = this.experience.scene
        this.resources = this.experience.resources

        // Wait for resources to be loaded
        this.resources.on('ready', () => {
            // Setup
            this.lights = new Lights()
            const build = new AssetsBuilder() // avoid call Assets() multiple times
            this.creature = build.creatures[0]
            this.environment = build.environment
        })
    }

    update() {
        if(this.lights) this.lights.update()
        if(this.creature) this.creature.update()
    }
}