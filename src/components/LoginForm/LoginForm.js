import React, {useState, useEffect} from 'react';
import axios from 'axios';
import {API_BASE_URL, ACCESS_TOKEN_NAME, RESTAURANT_ID} from '../../constants/apiConstants';
import { withRouter, Redirect } from "react-router-dom";
import "./LoginForm.css";
import logo_login from './trayvisor_logo_login.png';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector/LanguageSelector';
import {Context, useContextObject} from '../Context/Context';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';

import TextField from '@mui/material/TextField';
const qs = require('qs');

function LoginForm(props) {
    const { t, i18n } = useTranslation('Login');
    const {connectedStateHook, errorMessageHook, showBarHook} = useContextObject();
    const [connected, setConnected] = connectedStateHook;
    const [errorMessage, updateErrorMessage] = errorMessageHook;
  const [showBar, setShowBar] = showBarHook;

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

    setShowBar(false)

    function handleEmail(event) {
        setEmail(event.target.value)
    }

    function handlePassword(event) {
        setPassword(event.target.value)
    }

    async function handleSubmit() {
        const payload={
            username: email,
            password: password,
        }

        try {
        const response = await axios.post(API_BASE_URL+'/token', qs.stringify(payload))
            localStorage.setItem(ACCESS_TOKEN_NAME,response.data.access_token);
            props.history.push('/inscriptions')
        } catch (e) {
            console.log(e.message)
            updateErrorMessage(e.message)
        }
    }

    return(
        <div>
            {(connected) && <Redirect to='/inscriptions' />}
            <Box display="grid"   display="flex" justifyContent="center" alignItems="center" minHeight="90vh">
                <Card sx={{ minWidth: 275 }}>
                    <CardContent>

                        <Box display="grid" gridTemplateColumns="repeat(12, 1fr)" gap={4}>
                            <Box gridColumn="span 12"   justifyContent="center" display="flex" alignItems="center" >
                                <img src="https://gdo.axyomes.com/origine/logo.png" alt="Trayvisor"></img>
                            </Box>

                            <Box justifyContent="center" display="flex" alignItems="center" gridColumn="span 12" component="form" sx={{ }} noValidate autoComplete="off" >
                                <TextField id="email" label="Email" value={email} onChange={handleEmail}/>
                            </Box>
                            <Box justifyContent="center" display="flex" alignItems="center" gridColumn="span 12" component="form" sx={{ }} noValidate autoComplete="off" >

                                <TextField id="password" label="Password" value={password} onChange={handlePassword}/>
                            </Box>
                        </Box>
                    </CardContent>

                    <CardActions>
                        <Button size="small" onClick={handleSubmit}>Login</Button>
                    </CardActions>
                </Card>
            </Box>
        </div>
    )
}

export default withRouter(LoginForm);
