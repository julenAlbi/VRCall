import React, { Component } from 'react';

export default class NereButton extends Component {

	render() {
		return <button type="button" onClick={this.props.action}>{this.props.buttonText}</button>;
	}
}