import react, {Component} from 'react';
import * as THREE from 'three';


export default class VRVideo extends Component{
	constructor(props) {
		super(props);
		this.animate = this.animate.bind(this);
	}

	init(){
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color( 0x23a3b4c );
		this.camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );
		// renderer
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize( window.innerWidth, window.innerHeight );
		this.renderer.setPixelRatio( window.devicePixelRatio );
		this.renderer.setClearColor( 0x23a3b4c, 1 );
		document.body.appendChild( this.renderer.domElement );

		// light
		var light = new THREE.DirectionalLight( 0xffffff, 1 );
		light.position.set( 1, 1, 1 );
		this.scene.add( light );

		// add geometry
		const geometry = new THREE.BoxGeometry( 1, 1, 1 );
		const material = new THREE.MeshStandardMaterial( { color: 0xffffff } );
		this.cube = new THREE.Mesh( geometry, material );
		this.scene.add( this.cube );

		this.camera.position.z = 5;
		return this.renderer.domElement;
	}
	
	animate(){
		requestAnimationFrame( this.animate );
		this.cube.rotation.x += 0.01;
		this.cube.rotation.y += 0.01;
		this.renderer.render( this.scene, this.camera );
	}

	componentDidMount() {
		document.querySelector('#Render').appendChild(this.init());
		this.animate();
	}

	render() {
		return <div id="Render" className="App"></div>
	}
};
