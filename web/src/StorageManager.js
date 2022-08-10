import firebase from 'firebase/app';
import 'firebase/firestore';


const firebaseConfig = {
	apiKey: "AIzaSyDp_zvLDyMNtH3mjl0H9QGzI6Mk7XBfF-0",
	authDomain: "webrtc-25c29.firebaseapp.com",
	projectId: "webrtc-25c29",
	storageBucket: "webrtc-25c29.appspot.com",
	messagingSenderId: "369440168503",
	appId: "1:369440168503:web:1983a4c35bb72c89747db2"
};


export default class StorageManager {
	constructor(params) {
		if (!firebase.apps.length) {
			firebase.initializeApp(firebaseConfig);
		}
		this.firestore = firebase.firestore();
	}

	getDocs(){
		const callDoc = firestore.collection('calls').doc();
		const offerCandidates = callDoc.collection('offerCandidates');
		const answerCandidates = callDoc.collection('answerCandidates');
		return [callDoc, offerCandidates, answerCandidates];
	}
};
