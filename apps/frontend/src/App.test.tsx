import { render, screen } from '@testing-library/react';

import App from './App';
import { ContextProvider } from './components/Context/Context';
import './i18n';

test('renders the application shell', () => {
  render(
    <ContextProvider>
      <App />
    </ContextProvider>,
  );

  expect(screen.getByRole('main')).toBeInTheDocument();
});
