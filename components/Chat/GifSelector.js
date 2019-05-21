import React from 'react';
import PropTypes from 'prop-types';

import GiphySelect from 'react-giphy-select';
import 'react-giphy-select/lib/styles.css';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

class GifSelector extends React.PureComponent {
	state = {
		isOpen: false
	};

	static propTypes = {
		/**
		 * Callback to be called on icon select
		 */
		onEntrySelect: PropTypes.func.isRequired
	};
  
	constructor(props){
		super(props);
		this.state = {
		};
		this.handleToggleClick = this.handleToggleClick.bind(this);
	}
	
	/**
	 * Handles open/close state
	 */
	handleToggleClick() {
		this.setState({
			isOpen: !this.state.isOpen
		});
	};

	render() {
		const { isOpen, emotes } = this.state;
		return (
			<div className="chat-input__buttons__gif inline-flex items-center justify-center mr2">
				<FontAwesomeIcon icon='video' onClick={this.handleToggleClick} />
				<span className="absolute right-0 fr bottom-2 pv5">
					{isOpen &&
                        <GiphySelect
                        	theme={{
                        		select: `pa1 ba b--gray br2 bg-white near-black`
                        	}}
							requestKey={process.env.GIPHY_API_KEY}
							onEntrySelect={this.props.onEntrySelect}
                        />
					}
				</span>
			</div>
		);
	}
}
export default GifSelector;