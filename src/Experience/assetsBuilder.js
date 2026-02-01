import Creature from './World/Creature.js'
import Environment from './World/Environment.js'

export default class AssetsBuilder {
    constructor() {
        this.creatures = []
        this.environment = []

        this.setCreature()
        this.setEnvironment()
    }

    setCreature() {
        this.creatures.push(
            new Creature({
                model: 'foxModel',
                colTexture: 'foxColorTex',
                shdTexture: 'foxShaderTex'
            })
        )
    }

    setEnvironment() {
        // Ground:
        this.environment.push(
            new Environment({
                model: 'groundModel',
                texture: 'groundTex'
            })
        )
        // Plants:
        this.environment.push(
            new Environment({
                model: 'plantsModel',
                texture: 'plantsTex'
            })
        )
        // Background:
        this.environment.push(
            new Environment({
                model: 'backgroundModel',
                texture: 'backgroundTex'
            })
        )
    }
}