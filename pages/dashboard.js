import React, {Component} from 'react'
import {connect} from 'react-redux';

import dynamic from 'next/dynamic'
import Link from 'next/link'

import initialize from '../../utils/requireAuth';
import * as actions from '../../actions';

class DashboardPage extends Component {
	constructor(props){
		super(props);
	}

	static async getInitialProps({store, isServer, pathname, query, req}){
		initialize({store, isServer, pathname, query, req});
		const { streaming } = store.getState()
		if(streaming.loading){
			await store.dispatch(actions.fetchStreaming());
		}
    }


	componentDidMount(){
	}

	render(){
		const auth = this.props.authentication;
		const streaming = this.props.streaming;
		if(!auth || auth.loading) return null;
		if(!streaming || streaming.loading) return null;
		if(auth && auth.user && !auth.user.can_stream) return <p>You do not have permission to stream</p>;
		return (
			<>
				<div className="w-100 flex flex-row">
					<h2 className="f2 tracked mt0 mb3">Get started with streaming</h2>
					<ol>
						<li>
							<p>First, choose the streaming server closest to you:</p>
							<ul class="list">
								<li><b>London, Oslo:</b> osl1-rtmp.stream.guac.live</li>
								<li><b>London, Europe:</b> lon1-rtmp.stream.guac.live</li>
							</ul>
						</li>
						<li>
							<p>Now, use the following stream key: <b>{streaming.key}</b></p>
						</li>
						<li>
							<p>At last, make sure keyframe interval is set to <b>2</b>.
						</li>
					</ol>
				</div>
			</>
		)
	}
}

export default connect(state => state)(DashboardPage)