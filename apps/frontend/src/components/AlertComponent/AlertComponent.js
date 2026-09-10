import React from 'react';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

export default function AlertComponent({ errorMessage, hideError }) {
  const close = (_, reason) => {
    if (reason !== 'clickaway') hideError(null);
  };

  return (
    <Snackbar
      open={Boolean(errorMessage)}
      autoHideDuration={6000}
      onClose={close}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
    >
      <Alert onClose={close} severity="error" variant="filled" sx={{ width: '100%' }}>
        {errorMessage}
      </Alert>
    </Snackbar>
  );
}
