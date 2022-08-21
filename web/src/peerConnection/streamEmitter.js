/**
 * The descriptions are stored in the firebase database.
 */
import { getRoomId } from '../utils';
import StorageManager from '../storageManager';


const servers = {
	iceServers: [
		{
			urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
		},
	],
	iceCandidatePoolSize: 10,
};

export default class StreamEmitter {

	constructor(callId) {
		this.pc = new RTCPeerConnection(servers);
		this.stream = null;
		this.callId = callId;
	}

	async init(stream) {
		this.stream = stream;

		// Push tracks from local stream to peer connection
		this.stream.getTracks().forEach((track) => {
			this.pc.addTrack(track, this.stream);
		});

		// Reference Firestore collections for signaling
		const [callDoc, offerCandidates, answerCandidates] = StorageManager.getDocs(this.callId);

		// Get candidates for caller, save to db
		this.pc.onicecandidate = (event) => {
			console.log('Ice candidate: ', event.candidate);
			event.candidate && offerCandidates.add(event.candidate.toJSON());
		};
		// Create offer
		const offerDescription = await this.pc.createOffer();
		await this.pc.setLocalDescription(offerDescription);

		const offer = {
			sdp: offerDescription.sdp,
			type: offerDescription.type
		};

		await callDoc.update({ offer });

		// Listen for remote answer
		callDoc.onSnapshot((snapshot) => {
			const data = snapshot.data();
			if (!this.pc.currentRemoteDescription && data?.answer) {
				const answerDescription = new RTCSessionDescription(data.answer);
				this.pc.setRemoteDescription(answerDescription);
			}
		});

		// When answered, add candidate to peer connection
		answerCandidates.onSnapshot((snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type === 'added') {
					const candidate = new RTCIceCandidate(change.doc.data());
					this.pc.addIceCandidate(candidate);
				}
			});
		});
	}
};
