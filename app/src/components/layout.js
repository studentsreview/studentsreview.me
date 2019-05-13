import React, { Fragment } from 'react';
import { Link } from 'gatsby';
import { AppBar, Grid, Toolbar } from '@material-ui/core';

import '../styles/layout.css';

const Layout = ({ children, gridStyle }) => <Fragment>
    <AppBar position='static'>
        <Toolbar>
            <Link to='/' style={ { color: 'white' } }>Students Review Me</Link>
        </Toolbar>
    </AppBar>
    <Grid container direction='column' justify='center' alignItems='center' style={ gridStyle }>
        { children }
    </Grid>
</Fragment>;

export default Layout;
