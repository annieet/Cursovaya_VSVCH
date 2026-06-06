import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { CssBaseline, GlobalStyles, ThemeProvider } from '@mui/material';
import App from './App.jsx';
import { store } from './store/index.js';
import { theme } from './theme.js';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles
            styles={{
              html: {
                maxWidth: '100vw',
                overflowX: 'hidden',
              },
              body: {
                maxWidth: '100vw',
                overflowX: 'hidden',
              },
              '#root': {
                width: '100%',
                maxWidth: '100vw',
                overflowX: 'hidden',
                minHeight: '100%',
              },
            }}
          />
          <App />
        </ThemeProvider>
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
