import * as THREE from 'three'
import EventEmitter from './EventEmitter.js'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader.js'
import {DRACOLoader} from 'three/examples/jsm/loaders/DRACOLoader.js'

export default class Resources extends EventEmitter {
    constructor(sources) {
        super()

        // Options
        this.sources = sources

        // Setup
        this.items = {}
        this.toLoad = sources.length
        this.loaded = 0

        this.setLoaders()
        this.startLoading()
    }

    setLoaders() {
        this.loaders = {}
        // this.loaders.dracoLoader = new DRACOLoader()
        this.loaders.gltfLoader = new GLTFLoader()
        this.loaders.textureLoader = new THREE.TextureLoader()
    }

    startLoading() {
        this.sources.forEach((source) => {
            if(source.type === 'gltfModel') {
                this.loaders.gltfLoader.load(source.path, (file) => {

                    this.sourceLoaded(source, file)
                })
            }
            else if(source.type === 'texture') {
                this.loaders.textureLoader.load(source.path, (file) => {

                    this.sourceLoaded(source, file)
                })
            }
        })
    }

    sourceLoaded(source, file) {
        this.items[ source.name ] = file

        this.loaded++

        if(this.loaded === this.toLoad) {
            // console.log('Resources loaded')
            this.trigger('ready')
        }
    }
}