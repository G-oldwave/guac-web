import React, {Component, Fragment} from 'react'

import Link from 'next/link'

import Chat from '../components/Chat'

import GuacButton from '../components/GuacButton'

import VideoPlayer from '../components/VideoPlayer'

import {connect} from 'react-redux';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as actions from '../actions';

import log from '../utils/log';

const STREAMING_SERVER = 'eu';
class ChannelPage extends Component {
	static async getInitialProps({store, isServer, pathname, query, req}){
		const { channel } = store.getState()
		log('info', 'Channel', query.name);
		if(channel.loading){
			await store.dispatch(actions.fetchChannel(query.name));
		}
    }

    renderStream = stream => {
		let videoJsOptions = {
			autoplay: true,
			controls: true,
			sources: [],
			streamInfo: {
				username: stream.user.name
			}
		};

		if(stream.live){
			if(stream.urls){
				// Prefer FLV if available, it has lower latency
				if(stream.urls.flv){
					videoJsOptions.sources.push({
						src: stream.servers[STREAMING_SERVER] + stream.urls.flv,
						type: 'video/x-flv',
						label: STREAMING_SERVER + `(FLV)`
					});
				}
				// Only HLS has quality options
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
    		<Fragment key={stream.user.id}>
				<div className="site-component-channel__player">
					<VideoPlayer { ...videoJsOptions } live={stream.live}></VideoPlayer>
				</div>
				<div className="site-component-channel__info dib w-100 bg-light-green">
					<h2 className='f2 tracked ma0 dib'>
					{stream.user.name}
					{stream.live ? <span className="ph2 bg-red f6 tc inline-flex white mh3">LIVE</span> : ''}
					</h2>
					{stream.live && this.props.channel.viewers !== null
						? <div className="inline-flex align-items-center ph2 red f6">
							<span className="">
								<FontAwesomeIcon icon='user' />
							</span>
							&nbsp;
							{this.props.channel.viewers}
						</div>
						: ''
					}

					{stream.isFollowed && <GuacButton color="white">Unfollow</GuacButton>}
					{!stream.isFollowed && <GuacButton color="white">Follow</GuacButton>}
					<GuacButton color="green">Subscribe</GuacButton>
					<div>
						<span className="b f4">{stream.title}
						<br />
						playing <Link href={'/category/' + stream.category_id}><a>{stream.category_name}</a></Link>
						</span>
					</div>
				</div>
    		</Fragment>
    	);
    }

	render() {
		const {
			channel,
			site
		} = this.props;
		if(channel.loading) return (<p>Loading...</p>);
		//if(channel.error) throw channel.error;
		if(!channel.data) return (<p>Channel not found</p>);

		let followed = site.myFollowed && site.myFollowed.find((u) => {
			return u && u.to_id === channel.data.user.id;
		});

		let isFollowed = followed && followed.to_id === channel.data.user.id;
		channel.data.isFollowed = isFollowed;

		return (
			<div className="w-100 min-vh-100 flex flex-nowrap black">
				<div className="site-component-channel w-70 w-100-ns h-100 flex flex-column flex-grow-1 overflow-hidden relative">
				{this.renderStream(channel.data)}
				</div>
				<aside className="site-component-chat w-30 h-100 flex flex-column flex-grow-1 flex-shrink-1 flex-nowrap w-100-ns">
					<Chat channel={channel.data.name} />
				</aside>
			</div>
		)
	}
}
export default connect(state => state)(ChannelPage)