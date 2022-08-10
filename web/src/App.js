import logo from './logo.svg';
import './App.css';
import VRVideo from './components/VRVideo';
import NereButton from './components/nereButton';
import React, { Component } from 'react';

class App extends Component {

	state = {
		emitting: false,
	};

	constructor(props) {
		super(props);
		this.startEmitting = this.startEmitting.bind(this);
	}


	startEmitting() {

		this.setState({ emitting: true });
	}

	render() {
		if (this.state.emitting) {
			return <VRVideo />;
		} else {
			return (
				<div id="Render" className="App">
					<NereButton buttonText='Start emitting' action={this.startEmitting}></NereButton>
					<NereButton buttonText='Join' action={this.startEmitting}></NereButton>
				</div>
			);
		}
	}
}

export default App;
