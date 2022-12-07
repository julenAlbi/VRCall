import React, { Component } from 'react';
import {
	Scene, Color, PerspectiveCamera, WebGLRenderer,
	DirectionalLight, VideoTexture, PlaneGeometry, MeshLambertMaterial,
	Mesh, Object3D
} from 'three';
import StreamReceiver from '../peerConnection/streamReceiver';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';


const sizes = {
	width: window.innerWidth,
	height: window.innerHeight
};

class VRVideoIntern extends Component {
	constructor(props) {
		super(props);
		this.animate = this.animate.bind(this);
		this.startVR = this.startVR.bind(this);
		this.initCall = this.startReceiving.bind(this);
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

		this.dolly = new Object3D();
		this.dolly.add(this.camera);
		this.scene.add(this.dolly);

		this.camera.position.z = 5;
		return this.renderer.domElement;
	}

	addVideoPlane() {
		// add plane
		const video = document.querySelector('#video');
		video.addEventListener('loadedmetadata', () => {
			console.log('video.width', video.videoWidth);
			console.log('video.height', video.videoHeight);
			const texture = new VideoTexture(video);
			const height = 7;
			const width = video.videoWidth * height / video.videoHeight;
			const geometry = new PlaneGeometry(width, height);
			const parameters = { color: 0xffffff, map: texture };
			const material = new MeshLambertMaterial(parameters);
			this.planeMesh = new Mesh(geometry, material);
			this.scene.add(this.planeMesh);
		}, false);
	}

	animate() {
		requestAnimationFrame(this.animate);
		this.renderer.render(this.scene, this.camera);
	}

	componentDidMount() {
		// XXX: Weird behaviour: The video streaming is not displayed unless error dialog is shown at the beginning and closed
		// before the timeout code is executed ¯\_(ツ)_/¯, thats why I add a button to start the video call
		// setTimeout(() => {
		// 	this.startRecei1ving();
		// 	document.querySelector('#Render').appendChild(this.init());
		// 	this.animate();
		// 	this.startVR();
		// }, 5000);
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

	startReceiving() {
		const video = document.querySelector('#video');
		const remoteStream = new MediaStream();
		video.srcObject = remoteStream;
		this.streamReceiver = new StreamReceiver(this.props.callId);
		this.streamReceiver.pc.ontrack = (event) => {
			console.log('ontrack :>> ', event);
			event.streams[0].getTracks().forEach((track) => {
				console.log('gehitzen');
				remoteStream.addTrack(track);
			});
			this.addVideoPlane();
		};
		this.streamReceiver.init();
	}

	buttonClicked() {
		console.log('Clicked');
		this.startReceiving();
		document.querySelector('#Render').appendChild(this.init());
		this.animate();
		this.startVR();
	}

	render() {
		return (<><button onClick={() => this.buttonClicked()}>Enter Room</button><div id="Render" className="App">
			<video id="video" autoPlay playsInline> </video>
		</div></>);
	}
};


VRVideoIntern.propTypes = {
	callId: PropTypes.string.isRequired,
};


function VRVideo(props) {
	const { callId } = useParams();
	return <VRVideoIntern {...props} callId={callId} />;
}

export default VRVideo;

// Convert degrees to radians
function degToRad(degrees) {
	return degrees * Math.PI / 180;
}
