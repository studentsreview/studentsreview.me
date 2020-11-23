import React from 'react';
import { Container, Typography } from '@material-ui/core';

import '../styles/layout.css';

const NotFoundPage = () => <Container style={ {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minHeight: '100%',
    textAlign: 'center',
} }>
    <div style={{ flexGrow: 1 }} />
    <img style={{ width: "300px" }} src='/relaxing-walk.svg' alt='Walk' />
    <Typography style={{ marginTop: "25px", fontFamily: "Montserrat" }} variant="h4">
        Redesign In Progess...
    </Typography>
    <Typography style={{ marginTop: "15px", fontFamily: "Montserrat" }} variant="subtitle1">
        Stay Safe!
    </Typography>
    <div style={{ flexGrow: 2 }} />
</Container>;

export default NotFoundPage;
