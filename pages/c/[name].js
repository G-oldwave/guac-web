import React, {Component, Fragment, useEffect, useState} from 'react'

import Link from 'next/link'

import NextHead from 'next/head'

import dynamic from 'next/dynamic'

import { Trans } from '@lingui/macro'

import { useDispatch } from 'react-redux'

import prettyMilliseconds from 'pretty-ms';

import Chat from '../../components/Chat'

import GuacButton from '../../components/GuacButton'

let VideoPlayer = dynamic(
	() => /* webpackChunkName: 'VideoPlayer' */import('../../components/VideoPlayer'),
	{
		ssr: false,
		loading: () => <div className="w-100 h-100 bg-black white content-box" style={{'paddingTop': '56.25%'}} />
	}
);

import {connect} from 'react-redux';

import io from 'socket.io-client';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import * as actions from '../../actions';

import log from '../../utils/log';
import ReplaysList from '../../components/Replays/ReplaysList';
import EditStreamPanel from '../../components/EditStreamPanel';

import { useFeatureToggle } from '@flopflip/react-broadcast';

import { ToggleFeature } from '@flopflip/react-redux';

import { kFormatter } from '../../utils';

const STREAMING_SERVER = 'eu';
const VIEWER_API_URL = process.env.VIEWER_API_URL;
function ChannelPage(props){
	const [tab, setTab] = useState(0);
	const [showModal, setShowModal] = useState(false);
	const dispatch = useDispatch();
	useEffect(() => {
		const { channel } = props;
		let channelAPISocket, didCancel = false;
		
		if(!didCancel){
			channelAPISocket = io(`${VIEWER_API_URL}/channel`);
			channelAPISocket.on('connect', () => {
				if (!channel || !channel.data || !channel.data.name) return;
				channelAPISocket.emit('join', {
					name: channel.data.name
				});
			});
			channelAPISocket.on('disconnect', () => {
				if (!channel || !channel.data || !channel.data.name) return;
				channelAPISocket.emit('leave', {
					name: channel.data.name
				});
			});
			channelAPISocket.on('reload', () => {
				window.location.reload();
			});
			channelAPISocket.on('redirect', (url) => {
				window.location = url;
			});
			channelAPISocket.on('live', (liveBoolean) => {
				console.log(`socket sent live: ${liveBoolean}`);
				setTimeout(async () => {
					try{
						dispatch(actions.fetchChannel(channel.data.name));
					}catch(e){}
				}, 3000);
			});
		}
		return function cleanup(){
			didCancel = true;
			if(channelAPISocket){
				channelAPISocket.emit('disconnect');
				channelAPISocket.removeAllListeners();
				channelAPISocket.off('connect');
				channelAPISocket.off('disconnect');
				channelAPISocket.disconnect();
			}
		};
	}, []);
	
	const editStream = async e => {
		const { authentication, channel } = props;
		if(!channel || !channel.data || !channel.data.user) return;
		setShowModal(!showModal);
		e.preventDefault();
	}

	const follow = async e => {
		const { authentication, channel } = props;
		if(!channel || !channel.data || !channel.data.user) return;
		dispatch(actions.followChannel(authentication.token, channel.data.user.id));
	}

    const renderStream = () => {
		const {
			authentication,
			channel
		} = props;
		let stream = channel.data;

		let videoJsOptions = { 
			autoplay: true,
			controls: true,
			sources: [],
			streamInfo: {
				username: stream.user.name,
				isChannel: true
			}
		};

		if(stream.live){
			if(stream.urls){
				// Prefer FLV if available, it has lower latency
				let flvUrl = stream.servers[STREAMING_SERVER] + stream.urls.flv;
				if(stream.urls.flv){
					videoJsOptions.sources.push({
						src: typeof window === 'object' && 'WebSocket' in window
							? `wss:${flvUrl}`
							: flvUrl,
						type: 'video/x-flv',
						label: STREAMING_SERVER + `(FLV)`
					});
				}
				// Only HLS has quality options
				Object.keys(stream.qualities).forEach((key) => {
					let urlKey = stream.qualities[key];
					videoJsOptions.sources.push({
						src: stream.servers[STREAMING_SERVER] + `/live/${stream.user.name}/index${urlKey}.m3u8`,
						type: 'application/x-mpegURL',
						label: STREAMING_SERVER + `(${key})`
					});
				});
			}
		}
		let now = new Date().getTime();
		let liveAt = stream && stream.liveAt ? new Date(stream.liveAt) : 0;
    	return (
    		<Fragment key={stream.user.id}>
				<div className="site-component-channel__player">
					<VideoPlayer { ...videoJsOptions } live={stream.live}></VideoPlayer>
				</div>
				<div 
					className="site-component-channel__info dib w-100 bg-black-50"
					onMouseEnter={(e) => {
						if(e && e.target) e.target.classList.add('active');
					}}
					onMouseLeave={(e) => {
						if(e && e.target) e.target.classList.remove('active');
					}}
				>
					<h2 className='f2 tracked ma0 dib primary'>
					{stream.user.name}
					{stream.type == 'PARTNER' &&  
						<FontAwesomeIcon icon='check-circle' fixedWidth className="f3" />
					}
					{stream.live ? <span className="ph2 bg-red f6 tc inline-flex white mh3">LIVE</span> : ''}
					</h2>
					<div className="inline-flex items-center pr2 red f6">
					{stream.live
						?
							<>
							{typeof props.channel.viewers !== 'undefined' &&  
								<span className="">
									<FontAwesomeIcon icon='user' />
									&nbsp;
									{props.channel.viewers.toString()}
								</span>
							}
							</>
						: ''
					}
					</div>
					<div className="inline-flex items-center pr2 primary f6">
					{stream.live
						?
							<>
							{stream.liveAt !== null &&  
								<span className="">
									<FontAwesomeIcon icon='clock' />
									&nbsp;
									{	
										prettyMilliseconds(now - liveAt, {
											unitCount: 3,
											formatSubMilliseconds: false,
											separateMilliseconds: false,
											secondsDecimalDigits: 0
										})
									}
								</span>
							}
							</>
						: ''
					}
					</div>
					{!authentication.token && <span className="f5 primary ml1 mr2"><Trans>Followers</Trans> · {kFormatter(stream.followers)}</span>}
					{stream.isFollowed && authentication.token && !stream.isMe && <GuacButton color="white" onClick={follow}><Trans>Following</Trans> ({kFormatter(stream.followers)})</GuacButton>}
					{!stream.isFollowed && authentication.token && !stream.isMe && <GuacButton color="white" onClick={follow}><Trans>Follow</Trans> ({kFormatter(stream.followers)})</GuacButton>}
					<ToggleFeature flag="subscribeButton">
						{stream.type == 'PARTNER' && <GuacButton color="green"><Trans>Subscribe</Trans></GuacButton>}
					</ToggleFeature>
					{isMe && 
						<GuacButton color="dark-gray" title="Edit stream" onClick={editStream}>
						<FontAwesomeIcon icon="edit" fixedWidth className="white" />
						<span className="white"><Trans>Edit</Trans></span>
						</GuacButton>
					}
					<div>
						<span className="b f4 primary">
							{stream.title}
							<br />
							<Trans>playing</Trans>&nbsp;
							<Link href="/category/[id]" as={`/category/${stream.category_id}`}><a className="primary">{stream.category_name}</a></Link>
						</span>
					</div>
				</div>
				{showModal && <div className="db pa2 bg-black-50 primary"><EditStreamPanel /></div>}
				<div className="site-component-profile__tabs flex items-center bb b--gray" style={{height:'48px'}}>
					<a 
						href="#"
						onClick={() => {setTab(0);return true;}}
						className={
							`flex items-center site-component-profile__tab ttu mr4 h-100 no-underline pointer ${tab == 0 ? 'primary' : 'gray'} hover-primary`
						}
					>
						<Trans>ABOUT</Trans>
					</a>
					<a 
						href="#"
						onClick={() => {setTab(1);return true;}}
						className={
							`flex items-center site-component-profile__tab ttu mr4 h-100 no-underline pointer ${tab == 1 ? 'primary' : 'gray'} hover-primary`
						}
					>
						<Trans>REPLAYS</Trans>
					</a>
				</div>
				{
					tab == 0 &&
					<div className="site-component-panels flex flex-wrap justify-center w-100">
						{
							stream
							&&
							stream.panels
							&&
							stream.panels.map((panel, i) => {
								return (
									<div key={`panel_${panel.id}_${i}`} className="site-component-panels__panel db w-100 w-third-ns mr1 mb1 word-wrap">
										<span className="f2 primary tracked">{panel.title}</span>
										<div className="mt1 primary">{panel.description}</div>
									</div>
								);
							})
						}
					</div>
				}
				{
					tab == 1 &&
					<div className="site-component-replays flex flex-wrap justify-center w-100 primary">
						<ReplaysList />
					</div>
				}
    		</Fragment>
    	);
	}
	
	function renderBan(){
		const {
			channel
		} = props;
		let stream = channel.data;
		return (
			<Fragment key={stream.user.id}>
				<div className="site-component-banned flex flex-column flex-wrap w-100">
					<h3 className="f3 red ma0"><Trans>User has been banned</Trans></h3>
					<img src="https://cdn.frankerfacez.com/emoticon/269642/4" class="db w4" />
					<p className="primary">
						{stream.user.name}&nbsp;<Trans>has been banned from the site.</Trans>
					</p>
				</div>
			</Fragment>
		);
	}

	const {
		channel,
		site,
		authentication
	} = props;

	if(channel.loading) return (<Trans>Loading...</Trans>);
	if(!channel.data) return (<Trans>Channel not found</Trans>);
	if(channel.error) throw channel.error;

	const meta = [
		{name: 'og:title', hid: 'og:title', content: `${channel.data.name} &middot; guac.live`},
		{name: 'og:description', hid: 'og:description', content: (channel.data.name || '').substring(0, 200)},
		{name: 'og:image', hid: 'og:image', content: '//guac.live/img/header-logo.png'},
		{name: 'author', content: channel.data.name},
		{name: 'description', hid: 'description', content: (channel.data.name || '').substring(0, 200)},
		{name: 'profile:username', content: channel.data.name},
		{name: 'twitter:card', content: 'summary_large_image'},
		{name: 'twitter:site', content: '@GuacLive'},
		{name: 'twitter:title', content: (channel.data.title || '').substring(0, 70)},
		{name: 'twitter:description', content: (channel.data.name || '').substring(0, 200)},
		{name: 'twitter:image', content: '//guac.live/img/header-logo.png'},  
	];
	// Add meta noindex, nofollow if channel is private
	if(channel.data && channel.data.private){
		meta.push({
			name: 'robots',
			content: 'noindex, nofollow, noarchive'
		})
	}

	let followed = site.myFollowed && site.myFollowed.find((u) => {
		return u && u.to_id === channel.data.user.id;
	});

	let isFollowed;
	channel.isFollowing = followed && followed.to_id === channel.data.user.id;
	let isMe = authentication.user && authentication.user.id && channel.data.user.id === authentication.user.id;
	isFollowed = channel.data.isFollowed = channel.isFollowing;
	channel.data.isMe = isMe;

	return (
		<Fragment>
			<NextHead>
				<title>{channel.data.name} &middot; guac.live</title>
				{ meta && meta.map((m) => {
					return (
						<meta name={m.name} content={m.content} key={m.name} />
					)
				})}
			</NextHead>
			<div className="w-100 min-vh-100 flex flex-nowrap black">			
				<div className="site-component-channel w-100 w-70-ns h-100 flex flex-column flex-grow-1 overflow-hidden relative">
						{
						channel 
						&&
						channel.data
						&&
						channel.data.user
						&&
						channel.data.user.banned
						?
						renderBan()
						:
						renderStream()
					}
				</div>
				<aside className="site-component-chat w-100 w-30-ns h-100 flex-l dn flex-column flex-grow-1 flex-shrink-1 flex-nowrap">
					{
						channel
						&&
						channel.data
						&&
						channel.data.user
						&&
						channel.data.user.banned
						?
						null
						:
						(<Chat channel={channel.data.name} />)
					}
				</aside>
			</div>
		</Fragment>
	)
}
ChannelPage.getInitialProps = async function getInitialProps({store, isServer, pathname, query, req}){
	const { channel, site } = store.getState()
	log('info', 'Channel', query.name);
	//if(channel.loading){
		await store.dispatch(actions.fetchChannel(query.name));
	//}
	return {...(Component.getInitialProps ? await Component.getInitialProps(ctx) : {})};
};

export default connect(state => state)(ChannelPage)