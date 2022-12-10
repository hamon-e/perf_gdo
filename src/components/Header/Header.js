import React,{ useEffect, useState } from 'react';

import { withRouter } from 'react-router-dom';

import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';

import {useContextObject} from '../../components/Context/Context';

import axios from 'axios'

function Header(props) {

  const {showBarHook, connectedStateHook, userHook, errorMessageHook, languageStateHook, headerTitleHook } = useContextObject();
  const [connected, setConnected] = connectedStateHook;
  const [user, setUser] = userHook;
  const [showBar, setShowBar] = showBarHook;

    useEffect(() => {
        async function get_token() {
            if (ACCESS_TOKEN_NAME !== null) {
                try {
                    const response = await axios.get(API_BASE_URL+'/me/', { headers: { 'Authorization': "Bearer "+localStorage.getItem(ACCESS_TOKEN_NAME) }})
                    setConnected(true);
                    setUser(response.data)
                    setShowBar(true)
                    if (props.location.pathname === '/login' || props.location.pathname === '/' || props.location.pathname === '/accueil') {
                        props.history.push('/inscriptions')
                    }
                } catch (error) {
                    if (props.location.pathname !== '/login') {
                        setConnected(false);
                        setShowBar(false)
                        props.history.push('/accueil')
                    }
                } 
            } else {
                setShowBar(false)
                if (props.location.pathname !== '/accueil') {
                    props.history.push('/accueil')
                }
                setConnected(false);
            }

        }
        get_token()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return null

}

export default withRouter(Header);
