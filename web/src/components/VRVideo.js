import React, { Component } from 'react';
import { Scene, Color, PerspectiveCamera, WebGLRenderer,
	DirectionalLight, VideoTexture, PlaneGeometry, MeshLambertMaterial,
	Mesh, Object3D } from 'three';


const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

export default class VRVideo extends Component {
	constructor(props) {
		super(props);
		this.animate = this.animate.bind(this);
		this.startVR = this.startVR.bind(this);
		this.initCall = this.initCall.bind(this);
	}

	init() {
		this.scene = new Scene();
		this.scene.background = new Color(0x23a3b4c);
		this.camera = new PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 1000);
		// renderer
		this.renderer = new WebGLRenderer({ antialias: true });
		this.renderer.setSize(sizes.width, sizes.height);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setClearColor(0x23a3b4c, 1);
		document.body.appendChild(this.renderer.domElement);

		// light
		var light = new DirectionalLight(0xffffff, 1);
		light.position.set(1, 1, 1);
		this.scene.add(light);

		// add plane
		const video = document.querySelector('#video');
		const texture = new VideoTexture(video);
		const geometry = new PlaneGeometry(sizes.width / 100, sizes.height / 100);
		// const geometry = new PlaneGeometry( 1, 1 );
		// const geometry = new BoxGeometry(1, 1, 1)
		const parameters = { color: 0xffffff, map: texture };
		// const parameters = { color: 0xffffff};
		const material = new MeshLambertMaterial(parameters);
		this.planeMesh = new Mesh(geometry, material);
		this.scene.add(this.planeMesh);
		// Add box
		// const geometry = new BoxGeometry( 1, 1, 1 );
		// const material = new MeshLambertMaterial( { color: 0xffffff } );
		// const mesh = new Mesh(geometry, material);
		// this.scene.add(mesh);

		this.dolly = new Object3D();
		this.dolly.add(this.camera);
		this.scene.add(this.dolly);

		this.camera.position.z = 5;
		return this.renderer.domElement;
	}

	animate() {
		requestAnimationFrame(this.animate);
		this.renderer.render(this.scene, this.camera);
	}

	componentDidMount() {
		document.querySelector('#Render').appendChild(this.init());
		this.animate();
		this.initCall();
		this.startVR();
	}

	static getDerivedStateFromError(error) {
		// Update state so the next render will show the fallback UI.
		console.log('error :>> ', error);
		return { hasError: true };
	}

	componentDidCatch(error, errorInfo) {
		// You can also log the error to an error reporting service
		console.log('error :>> ', error);
		console.log('errorInfo :>> ', errorInfo);
		// logErrorToMyService(error, errorInfo);
	}

	startVR() {
		this.renderer.xr.enabled = true;
		const sessionInit = { optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'] };
		navigator.xr.requestSession('immersive-vr', sessionInit).then((session) => {
			this.renderer.xr.setSession(session);
			// let distance =  (sizes.width / 100) / Math.tan(renderer.xr.getCamera(camera).fov / 2);
			let distance = (sizes.height / 200) / Math.tan(degToRad(this.renderer.xr.getCamera(this.camera).fov / 2));
			this.dolly.position.z = distance;
		});
		const VRAnimation = () => {
			this.renderer.render(this.scene, this.camera);
		};
		this.renderer.setAnimationLoop(VRAnimation);
	}

	initCall() {
		const video = document.querySelector('#video');
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
			console.log('Received local stream');
			video.srcObject = stream;
		}).catch(e => console.log(e.name + ': ' + e.message));
	}

	render() {
		return <div id="Render" className="App">
			<video id="video" autoPlay playsInline> </video>
		</div>;
	}
};


// Convert degrees to radians
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
