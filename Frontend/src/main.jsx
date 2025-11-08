import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; 
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './redux/store';
import App from './App.jsx'; 

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <StrictMode>
      <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
          <BrowserRouter>
            <App /> 
          </BrowserRouter>
          <ToastContainer position="top-right" autoClose={3000} />
        </PersistGate>
      </Provider>
    </StrictMode>
  );
}