import React,{ useEffect, useState } from 'react';
import { withRouter } from 'react-router-dom';
import { Stack } from '@mui/material'
import { useTranslation } from 'react-i18next';

function CustomNoResultsOverlay(props) {
    const { t, i18n } = useTranslation('DataGrid');
    
    return (
        <Stack height="100%" alignItems="center" justifyContent="center">
            {t('NoResults')}
        </Stack>
    )   
}
    
export default withRouter(CustomNoResultsOverlay);
    