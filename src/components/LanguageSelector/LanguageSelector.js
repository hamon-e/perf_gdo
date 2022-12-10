import React,{ useEffect, useState, useContext } from 'react';
import {Grid, Select, InputLabel, MenuItem, FormControl, FormHelperText, FormGroup, Checkbox, FormControlLabel} from '@mui/material'; 
import { useTranslation } from 'react-i18next';
import {Context, useContextObject} from '../Context/Context';
import { ACCESS_TOKEN_NAME } from '../../constants/apiConstants';

function LanguageSelector(props) {
    const {languageStateHook} = useContextObject();
    const [language, setLanguage] = languageStateHook;
    const { t, i18n } = useTranslation('LanguageSelector');
  
    useEffect(() => {
        if (language !== ""){
            console.log("language: ",language)
            try {
                i18n.changeLanguage(language);
            } catch (e){
                console.log('changeLanguage error: ', e)
            }
        } else {
            setLanguage(localStorage.getItem("i18nextLng"))
        }
    }, [language])

    const handleChange = (e) => {
        setLanguage(e.target.value)
    }


    return(
        <FormControl className={props.className} sx={{ m: 1, minWidth: 120 }}>
            <InputLabel id="language-Input-select">{t("Languages")}</InputLabel>
            <Select
            labelId="language-class-select"
            id="language-class-select"
            // defaultValue={language}
            value={language}
            onChange={handleChange}
            label={t("Languages")}
            >
                <MenuItem value={'fr'}>{t("fr")}</MenuItem>
                <MenuItem value={'en'}>{t("en")}</MenuItem>
        </Select>
        </FormControl>
    )
}

export default LanguageSelector;