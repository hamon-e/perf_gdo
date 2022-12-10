import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { ACCESS_TOKEN_NAME, API_BASE_URL } from '../../constants/apiConstants';
import axios from 'axios';
import './ResetPassword.css';

import logo_login from '../LoginForm/trayvisor_logo_login.png';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Snackbar from '@mui/material/Snackbar';
import { useTranslation } from 'react-i18next';
import {Context, useContextObject} from '../Context/Context';

function ResetPassword(props) {
    const { t, i18n } = useTranslation('ResetPassword');
    const {languageStateHook, headerTitleHook} = useContextObject();
    const [headerTitle, setHeaderTitle] = headerTitleHook;

    const [input, setInput] = useState(''); // '' is the initial state value
    const [inputConfirm, setInputConfirm] = useState(''); // '' is the initial state value
    const [text, setText] = useState(''); // '' is the initial state value
    const [message, setMessage] = useState(''); // '' is the initial state value
    const [open, setOpen] = useState(''); // '' is the initial state value

    useEffect(() => {
        setHeaderTitle("Reset-Password")
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const handleClose = (event, reason) => {
        if (reason === 'clickaway') {
        return;
        }

        setOpen(false);
    };

    function handleSubmitClick() {
        console.log(input.length)
        if (input != inputConfirm) {
            setText(t('Password-No-Match'))
        } else if (input.length < 8) {
            setText(t('Password-Too-Short'))
        } else {
            const qs = require('qs');
            const token = qs.parse(props.location.search, { ignoreQueryPrefix: true }).token

            const config = {
                                headers: {
                                    "Accept": "application/json, text/plain, */*",
                                    "Content-Type": "application/json",
                                    'Authorization': "bearer " + token
                                }
                            }
            const payload={
                password:input,
            }
            axios.post(API_BASE_URL+'/reset_password/', payload, config)
            .then(function (response) {
                if(response.status === 200){
                    setOpen(true)
                    setMessage(t("Success"));
                    props.history.push('/login');
                }
            })
            .catch(function (error) {
                setMessage(t("Invalid-Token"));
                setOpen(true)
            });    
        }
    }

    return(

    <div className="card col-12 col-lg-4 login-card mt-2 hv-center">
            <div className="image_banner_login">
                <img src={logo_login} alt="Trayvisor"></img>
            </div>

                <label>{t("Reset-Password")}</label>
  <Box component="form" sx={{ '& .MuiTextField-root': { m: 1, width: '25ch' }, }} noValidate autoComplete="off" >
        <TextField required id="outlined-password-input"  label={t("Password")} type="password" value={input} onInput={e => setInput(e.target.value)}/>

        <TextField required id="outlined-password-input"   helperText={text} error={text} label={t("Confirm-Password")} type="password" value={inputConfirm} onInput={e => setInputConfirm(e.target.value)} />

      <Button variant="outlined" onClick={handleSubmitClick} >{t("Confirm")}</Button>
  </Box>
     <Snackbar
        open={open}
        autoHideDuration={6000}
        message={message}
        onClick={handleClose}
      />
  </div>  
  );
}


export default withRouter(ResetPassword);
