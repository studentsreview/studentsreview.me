import React from 'react';
import { createMuiTheme, MuiThemeProvider } from '@material-ui/core';
import AppHeader from './AppHeader';

import red from '@material-ui/core/colors/red';
import { white } from '@material-ui/core/colors/common';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
        fontFamily: 'Proxima Nova, Helvetica, sans-serif'
    },
    palette: {
        primary: {
            light: red[700],
            main: red[800],
            dark: red[900],
            contrastText: white
        }
    }
});


const Layout = ({ children }) => (
    <MuiThemeProvider theme={ theme }>
        <AppHeader/>
        { children }
    </MuiThemeProvider>
)

export default Layout;
