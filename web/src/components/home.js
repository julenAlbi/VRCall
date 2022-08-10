import React, { Component } from 'react'
import NereButton from './nereButton';
import { useNavigate } from "react-router-dom";


class HomeIntern extends Component {

	constructor(props) {
		super(props);
		this.startEmitting = this.startEmitting.bind(this);
	}

	startEmitting() {
		// const callId = document.getElementById('callId').value;
		// window.location.href = '/vr/' + callId;
		this.props.navigate('/vr/' + '321321');
	}

	render() {
		return (
			<div id="Render" className="App">
				<NereButton buttonText='Start emitting' action={this.startEmitting}></NereButton>
				<NereButton buttonText='Join' action={this.startEmitting}></NereButton>
				<input type='text' id='callId' name='callId' placeholder='Call Id'></input>
			</div>
		)
	}
}

function Home(props) {
    let navigate = useNavigate();
    return <HomeIntern {...props} navigate={navigate} />
}

export default Home;
