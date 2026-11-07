import { StrictMode } from 'react'
import { ApolloProvider } from "@apollo/client/react";
import { createRoot } from 'react-dom/client'
import { UserProvider } from './context/UserContext.tsx';
import './index.css'
import client from "./graphql/client.js"
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ApolloProvider client={client}>
      <UserProvider>
    <App />
      </UserProvider>
    </ApolloProvider>
  </StrictMode>,
)
