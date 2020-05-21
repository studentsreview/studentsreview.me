import React from 'react';
import AppHeader from './AppHeader';
import InfoBanner from './InfoBanner';

import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import blueGrey from '@material-ui/core/colors/blueGrey';
import amber from '@material-ui/core/colors/amber';
import { white } from '@material-ui/core/colors/common';

import { InMemoryCache } from 'apollo-cache-inmemory';
import ApolloClient from 'apollo-boost';
import { ApolloProvider } from 'react-apollo';

import fetch from 'isomorphic-fetch';
import smoothscroll from 'smoothscroll-polyfill';
import { GoogleReCaptcha, GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'

if (typeof window !== 'undefined') {
    smoothscroll.polyfill();
    require('mermaid').initialize({
        startOnLoad: true
    });
}

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
        fontFamily: 'Montserrat, Helvetica, sans-serif'
    },
    spacing: 5,
    palette: {
        primary: {
            light: blueGrey[400],
            main: blueGrey[500],
            dark: blueGrey[600],
            contrastText: white
        },
        secondary: {
            light: amber[100],
            main: amber[800],
            dark: amber[900],
            contrastText: white
        }
    }
});

const cache = new InMemoryCache();

const client = new ApolloClient({
    uri: process.env.GRAPHQL_URI,
    fetch,
    cache,
    request: operation => {
        const token = localStorage.getItem('recaptchaToken')
        operation.setContext({
            headers: {
                authorization: token ? token : ''
            }
        })
    }
});

const Layout = ({ children }) => (
    <GoogleReCaptchaProvider reCaptchaKey={ process.env.RECAPTCHA_KEY }>
        <GoogleReCaptcha onVerify={ token => localStorage.setItem('recaptchaToken', token) }/>
        <ApolloProvider client={ client }>
            <MuiThemeProvider theme={ theme }>
                <AppHeader/>
                <InfoBanner/>
                { children }
            </MuiThemeProvider>
        </ApolloProvider>
    </GoogleReCaptchaProvider>
);

export default Layout;
