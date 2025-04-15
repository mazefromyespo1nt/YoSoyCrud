import 'bootstrap/dist/css/bootstrap.min.css'; // Importa Bootstrap CSS
import 'admin-lte/dist/css/adminlte.min.css'; // Importa AdminLTE CSS
import '@fortawesome/fontawesome-free/css/all.min.css'; // Importa Font Awesome CSS
import $ from 'jquery'; // Importa jQuery
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Importa Bootstrap JS
import 'admin-lte/dist/js/adminlte.min.js'; // Importa AdminLTE JS
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

reportWebVitals();
