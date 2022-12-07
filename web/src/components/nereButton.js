import React, { Component } from 'react';
import PropTypes from 'prop-types';


export default class NereButton extends Component {

	render() {
		return <button type="button" onClick={this.props.action}>{this.props.buttonText}</button>;
	}
}

NereButton.propTypes = {
	buttonText: PropTypes.string.isRequired,
	action: PropTypes.func.isRequired
};
