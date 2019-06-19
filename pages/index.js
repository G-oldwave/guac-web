import React, {Component, Fragment} from 'react';

import { ToggleFeature } from '@flopflip/react-redux';

import GuacButton from '../components/GuacButton'

import VideoPlayer from '../components/VideoPlayer'

import {connect} from 'react-redux';

import * as actions from '../actions';

import { Trans } from '@lingui/macro'

import Link from 'next/link';

import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';

const STREAMING_SERVER = 'eu';
class IndexPage extends Component {
	static async getInitialProps({store}){
		// we can dispatch from here too
		//store.dispatch({type: 'SET_FEATURED'});
		const { featured } = store.getState()
		if(featured.loading){
			await store.dispatch(actions.fetchFeatured());
		}
    }

    renderStream = stream => {
		let videoJsOptions = {
			autoplay: true,
			controls: true,
			sources: []
		};

		if(stream.live){
			if(stream.urls){
				let flvUrl = stream.servers[STREAMING_SERVER] + stream.urls.flv;
				if(stream.urls.flv){
					videoJsOptions.sources.push({
						src: typeof window === 'object' && 'WebSocket' in window
							? `${window.location.protocol === 'https:' ? 'wss' : 'ws'}:${flvUrl}`
							: flvUrl,
						type: 'video/x-flv',
						label: STREAMING_SERVER + `(FLV)`
					});
				}
				Object.keys(stream.qualities).forEach((key) => {
					let urlKey = stream.qualities[key];
					videoJsOptions.sources.push({
						src: stream.servers[STREAMING_SERVER] + `/live/${stream.user.name}${urlKey}/index.m3u8`,
						type: 'application/x-mpegURL',
						label: STREAMING_SERVER + `(${key})`
					});
				});
				/*if(stream.urls.hls){
					videoJsOptions.sources.push({
						src: stream.servers[STREAMING_SERVER] + stream.urls.hls,
						type: 'application/x-mpegURL'
					});
				}*/
			}
		}

    	return (
    		<div key={stream.user.id} style={{'height': '960px', 'width': '600px'}}>
    			<Link href={"/c?name=" + stream.user.name} as={"/c/" + stream.user.name}>
    				<a className="link f4 b ma0">
						<Trans><span className="i tracked b">{stream.name}</span> is live</Trans>
					</a>
    			</Link>
				<VideoPlayer { ...videoJsOptions } live={stream.live}></VideoPlayer>
    		</div>
    	);
    }
    
    renderStreams = () => {
    	if(this.props.featured.statusCode == 200 
			&& this.props.featured.data
			&& this.props.featured.data.length > 0){
    		 return this.props.featured.data.map(this.renderStream);
    	}
    	return (
    		<Trans>no streams are online</Trans>
    	);
    }

	render() {
		return (
			<Fragment>
				<div className="site-component-spotlight w-100 center bg-light-green black">
					<h3 className="f4 b ma0 ttu tracked">Live streams</h3>
					<Slider
						autoplay={false}
						dots={true}
						adaptiveHeight={true}
						variableWidth={true}
			      		className="w-100"
					>
					{this.renderStreams()}
					</Slider>
				</div>
				<ToggleFeature
					flag='guacWelcome'
				>
					<section className="ph3 ph5-l pv5">
						<article className="mw8 center-l br2 ba b--transparent">
							<div className="db dt-l dt--fixed-ns w-100">
								<div className="pa3 pa4-l db dtc-l v-mid">
									<div>
										<h2 className="f2 tracked mt0 mb3"><Trans>Welcome to guac.live</Trans></h2>
										<span className="measure lh-copy mv0">
											<Trans>
											<p>
											Hi,<br/>
											Welcome to guac.live &mdash; live streaming platform. We are currently in beta.</p>
											<p>
											While we are in beta, streaming privileges will be given on a invite-only basis.
											<br />
											But, feel free to make an account and participate in the chat and general community!
											</p>
											</Trans>
										</span>
									</div>
								</div>
								<div className="pa3 pa4-l db dtc-l v-mid black">
									<GuacButton color="light-green" url="/auth/login"><Trans>Join</Trans></GuacButton>
								</div>
							</div>
						</article>
					</section>
				</ToggleFeature>
			</Fragment>
		)
	}
}
export default connect(state => state)(IndexPage)