import React, { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';

import { callApi } from 'services/api';

import { Trans } from '@lingui/macro';

function FollowersList(props){
	const dispatch = useDispatch();
    const channel = useSelector(state => state.channel);
    const [loading, setLoading] = useState(true);
    const [followers, setFollowers] = useState([]);
    const [pagination, setPagination] = useState({});

    var users = [];

    const fetchFollowers = async (name, page = 1) => {
        await callApi(`/channel/follows/${name}?page=${page}`)
        .then(response => response.json())
        .then((res) => {
            if(res.data){
                res.data.forEach((user, i) => {
                    users.push({
                        ...user
                    });

                    if(i == res.data.length - 1){
                        setPagination(res.pagination);
                        setFollowers(users);
                        setLoading(false);
                    }
                });
                if(res.data.length === 0){
                    setLoading(false);
                }
            }
        })
        .catch((err) => {
            console.error(err);
        });
    }

	useEffect(() => {
		if(channel && channel.data && channel.data.name) fetchFollowers(channel.data.name);
		//
	}, []);

	return loading
            ?
            (<span>Loading...</span>)
            :
            (<div className="flex flex-column bb b--gray pb4">
                <span className="f5 b tracked mt0 mb3"><Trans>Followers:</Trans></span>
                <span className="f6 b tracked mt0 mb3 gray"><Trans>Page</Trans> {pagination.currentPage} <Trans>of</Trans> {pagination.lastPage}</span>
                <ul className="pa0 ma0 list">
                    {
                        followers &&
                        followers.map((u) => {
                            return (
                                <li key={`users_${u.username}`} className="flex flex-grow-1">{u.username}</li>
                            );
                        })
                    }
                </ul>
            </div>);
}
export default FollowersList;