import React from 'react';
import AppHeader from './AppHeader';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import { white } from '@material-ui/core/colors/common';

import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import fetch from 'isomorphic-fetch';
import smoothscroll from 'smoothscroll-polyfill';

typeof window !== 'undefined' && smoothscroll.polyfill();

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
        fontFamily: 'Montserrat, Helvetica, sans-serif'
    },
    spacing: 5,
    palette: {
        primary: {
            light: red[700],
            main: red[800],
            dark: red[900],
            contrastText: white
        }
    }
});

const cache = new InMemoryCache();

const client = new ApolloClient({
    uri: process.env.GRAPHQL_URI,
    fetch,
    cache
});

const Layout = ({ children }) => (
    <ApolloProvider client={ client }>
        <MuiThemeProvider theme={ theme }>
            <AppHeader/>
            { children }
        </MuiThemeProvider>
    </ApolloProvider>
);

export default Layout;
