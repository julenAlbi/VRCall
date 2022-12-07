import React, { Component } from 'react';
import StreamEmitter from '../peerConnection/streamEmitter';
import { useParams } from 'react-router-dom';
import PropTypes from 'prop-types';


class EmitterIntern extends Component {
	constructor(props) {
		super(props);
		this.initCall = this.initCall.bind(this);
		this.streamEmitter = new StreamEmitter(props.callId);
	}

	componentDidMount() {
		this.initCall();
	}

	initCall() {
		const video = document.querySelector('#videoEmitter');
		navigator.mediaDevices.getUserMedia({ audio: true, video: true }).then(stream => {
			console.log('Received local stream');
			video.srcObject = stream;
			this.streamEmitter.init(stream);
		}).catch(e => console.log(e.name + ': ' + e.message));
	}

	render() {
		return <video id="videoEmitter" autoPlay playsInline></video>;
	}
}


EmitterIntern.propTypes = {
	callId: PropTypes.string.isRequired
};


function Emitter(props) {
	const { callId } = useParams();
	return <EmitterIntern {...props} callId={callId} />;
}

export default Emitter;
