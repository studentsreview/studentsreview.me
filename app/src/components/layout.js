import React from 'react';
import { AppBar, Grid, Toolbar } from '@material-ui/core';
import { Link } from 'gatsby';

import { MuiThemeProvider, createMuiTheme } from '@material-ui/core/styles'
import blue from '@material-ui/core/colors/blue';
import { white } from '@material-ui/core/colors/common';

import '../styles/layout.css';

const theme = createMuiTheme({
    typography: {
        useNextVariants: true,
    },
    palette: {
        type: 'light',
        primary: blue,
        secondary: white
    }
});

const Layout = ({ children, gridStyle, direction, justify, alignItems }) => <MuiThemeProvider theme={ theme }>
    <AppBar position='static'>
        <Toolbar>
            <Link to='/' style={ { color: 'white' } }>Students Review Me</Link>
        </Toolbar>
    </AppBar>
    <Grid container direction={ direction || 'column' } justify={ justify || 'center' } alignItems={ alignItems || 'center' } style={ gridStyle }>
        { children }
    </Grid>
</MuiThemeProvider>;

export default Layout;
