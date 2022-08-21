import './App.css';
import VRVideo from './components/VRVideo';
import Emitter from './components/emitter';
import Home from './components/home';
import React, { Component } from 'react';
import {
	BrowserRouter,
	Routes,
	Route,
} from 'react-router-dom';

class App extends Component {

	constructor(props) {
		super(props);
	}

	render() {
		return <div>
			<BrowserRouter>
				<Routes>
					<Route exact path="/" element={<Home />} />
					<Route path="/vr/:callId" element={<VRVideo />} />
					<Route path="/:callId" element={<Emitter />} />
				</Routes>
			</BrowserRouter>
		</div>;
	}
}

export default App;
