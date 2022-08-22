/**
 * The descriptions are stored in the firebase database.
 */
import StorageManager from '../storageManager';


const servers = {
	 iceServers: [
		 {
			 urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'],
		 },
	 ],
	 iceCandidatePoolSize: 10,
};

export default class StreamReceiver {

	 constructor(callId) {
		 this.pc = new RTCPeerConnection(servers);
		 this.stream = null;
		 this.callId = callId;
	 }

	 async init() {
		// Reference Firestore collections for signaling
		const [callDoc, offerCandidates, answerCandidates] = StorageManager.getDocs(this.callId);

		this.pc.onicecandidate = (event) => {
			console.log('onicecandidate');
			event.candidate && answerCandidates.add(event.candidate.toJSON());
		};

		const callData = (await callDoc.get()).data();

		const offerDescription = callData.offer;
		await this.pc.setRemoteDescription(new RTCSessionDescription(offerDescription));

		const answerDescription = await this.pc.createAnswer();
		await this.pc.setLocalDescription(answerDescription);

		const answer = {
		  type: answerDescription.type,
		  sdp: answerDescription.sdp,
		};

		await callDoc.update({ answer });

		offerCandidates.onSnapshot((snapshot) => {
			snapshot.docChanges().forEach((change) => {
				if (change.type === 'added') {
					let data = change.doc.data();
					console.log('adding ice candidate');
					this.pc.addIceCandidate(new RTCIceCandidate(data));
				}
			});
		});
	 }
};
