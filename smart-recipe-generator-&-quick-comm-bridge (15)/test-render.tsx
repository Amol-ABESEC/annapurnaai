import React from 'react';
import { renderToString } from 'react-dom/server';
import App from './src/App';
try {
  console.log(renderToString(<App />));
} catch (e) {
  console.error("ERROR CAUGHT:");
  console.error(e);
}
