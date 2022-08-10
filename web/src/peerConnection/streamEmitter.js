/**
 * The WebRTC peer connection class.
 * The descriptions are stored in the firebase database.
 */

const servers = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
		},
	],
	iceCandidatePoolSize: 10,
};

export default class StreamEmitter {

	constructor(storageManager) {
		this.storageManager = storageManager;
		this.pc = new RTCPeerConnection(servers);
		this.stream = null;
	}

	init() {
		this.stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });

		// Push tracks from local stream to peer connection
		this.stream.getTracks().forEach((track) => {
			this.pc.addTrack(track, localStream);
		});

		// Pull tracks from remote stream, add to video stream
		// this.pc.ontrack = (event) => {
		// 	event.streams[0].getTracks().forEach((track) => {
		// 		remoteStream.addTrack(track);
		// 	});
		// };
		webcamVideo.srcObject = localStream;
		// remoteVideo.srcObject = remoteStream;
		// Reference Firestore collections for signaling
		const [callDoc, tofferCandidates, answerCandidates] = this.storageManager.getDocs();

		callInput.value = callDoc.id;

		// Get candidates for caller, save to db
		pc.onicecandidate = (event) => {
			event.candidate && offerCandidates.add(event.candidate.toJSON());
		};
		// Create offer
		const offerDescription = await pc.createOffer();
		await pc.setLocalDescription(offerDescription);

		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type,
		};

		await callDoc.set({ offer });

		// Listen for remote answer
		callDoc.onSnapshot((snapshot) => {
			const data = snapshot.data();
			if (!pc.currentRemoteDescription && data?.answer) {
				const answerDescription = new RTCSessionDescription(data.answer);
				pc.setRemoteDescription(answerDescription);
			}
		});

		// When answered, add candidate to peer connection
		answerCandidates.onSnapshot((snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					pc.addIceCandidate(candidate);
				}
			});
		});

	}
};
