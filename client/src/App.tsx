// import './App.css';
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  createHttpLink,
} from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { Outlet } from 'react-router-dom';
import './css/main.css';

import Header from './components/Header';
// import Footer from './components/Footer';

const httpLink = createHttpLink({
  uri: '/graphql',
});

// Construct request middleware that will attach the JWT token to every request as an `authorization` header
const authLink = setContext((_, { headers }) => {
  // get the authentication token from local storage if it exists
  const token = localStorage.getItem('id_token');
  // return the headers to the context so httpLink can read them
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
});

httpLink // For render
authLink

const client = new ApolloClient({
  uri: '/graphql',
  cache: new InMemoryCache(),
  headers: {
    authorization: localStorage.getItem('id_token') || '',
  },
});

function App() {
  return (
    <ApolloProvider client={client}>
      <div className='background'>
      <div className="flex-column justify-flex-start min-100-vh">
        <Header />
        <div className="container">
          <Outlet />
        </div>

      </div>
      </div>
    </ApolloProvider>
  );
}

export default App;
