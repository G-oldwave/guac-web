import React, { useState, useRef } from 'react';

import { useClickAway } from 'react-use';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

function ViewerList(props){
	const [isOpen, setIsOpen] = useState(false);

	const ref = useRef(null);
	useClickAway(ref, () => {
	  setIsOpen(false);
	});
  
	const handleToggleClick = () => {
		setIsOpen(!isOpen);
	};

	const users = [...props.users].map((args) => {
		let user = args[1];
		return user;
	});

	const staff = users.filter((u) => {
		return u && u.type && u.type === 'staff';
	});
	const mods = users.filter((u) => {
		return u && u.type &&  u.type !== 'staff' && u.type === 'moderator';
	});
	const usrs = users.filter((u) => {
		return u && !u.anon && u.type !== 'staff' && u.type !== 'moderator';
	});

	return (
		<div ref={ref} className="chat-viewerlist inline-flex items-center justify-center mr2">
			<a
				href="#"
				onClick={(e) => {
					e && e.preventDefault();
					handleToggleClick();
				}}
				className="link color-inherit ph2 br2 bg-animate hover-bg-dark-gray outline-none"
				title="Users in chat"
			>
			<FontAwesomeIcon icon='user' fixedWidth />
			</a>
			<div className="absolute top-2 right-2 fr pv2 ph2 h-100 w5 z-max">
				{isOpen &&
					<div className={`pa2 ba b--gray br2 ${props.darkMode ? 'bg-near-black' : 'bg-white'} ${props.darkMode ? 'near-white' : 'near-black'}`}>
						{
							staff
							&&
							staff.length > 0
							&&
							<div className="db bb b--gray pb4">
								<span className="f5 b tracked mt0 mb3">Staff in chat:</span>
								<ul className="pa0 ma0 list">
									{
										staff &&
										staff.map((u) => {
											return (
												<li key={`staff_${u.name}`} className="flex flex-grow-1" style={{color: `#${u.color}`}}>{u.name}</li>
											);
										})
									}
								</ul>
							</div>
						}
						{
							mods
							&&
							mods.length > 0
							&&
							<div className="db bb b--gray pb4">
								<span className="f5 b tracked mt0 mb3">Moderators in chat:</span>
								<ul className="pa0 ma0 list">
									{
										mods &&
										mods.map((u) => {
											return (
												<li key={`mods_${u.name}`} className="flex flex-grow-1" style={{color: `#${u.color}`}}>{u.name}</li>
											);
										})
									}
								</ul>
							</div>
						}
						{
							usrs
							&&
							usrs.length > 0
							&&
							<div className="db bb b--gray pb4">
								<span className="f5 b tracked mt0 mb3">Users in chat:</span>
								<ul className="pa0 ma0 list">
									{
										usrs &&
										usrs.map((u) => {
											return (
												<li key={`user_${u.name}`} className="flex flex-grow-1" style={{color: `#${u.color}`}}>{u.name}</li>
											);
										})
									}
								</ul>
							</div>
						}
					</div>
				}
			</div>
		</div>
	);
}
  
export default ViewerList;