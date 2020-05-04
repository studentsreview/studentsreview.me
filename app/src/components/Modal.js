import React from 'react';
import { Grid } from '@material-ui/core';

import { withStyles } from '@material-ui/styles';

import styles from '../styles/styles';

const Modal = ({ shown, children, classes }) => (
    shown ? <div style={ {
        position: 'fixed',
        zIndex: 1,
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        overflow: 'auto',
        backgroundColor: 'rgba(0, 0, 0, 0.4)'
    } }><Grid container alignItems='center' justify='center' alignContent='center' className={ classes.control } style={ {
        height: '100%'
    } }>
        { children }
    </Grid></div> : null
);

export default withStyles(styles)(Modal);
