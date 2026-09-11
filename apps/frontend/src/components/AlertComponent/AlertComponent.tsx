import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import type { SnackbarCloseReason } from '@mui/material/Snackbar';
import type { SyntheticEvent } from 'react';

interface AlertComponentProps {
  errorMessage: string | null;
  hideError: (message: null) => void;
}

export default function AlertComponent({ errorMessage, hideError }: AlertComponentProps) {
  const close = (_event?: SyntheticEvent | Event, reason?: SnackbarCloseReason) => {
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
