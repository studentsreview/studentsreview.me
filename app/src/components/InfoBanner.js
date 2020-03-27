import React from 'react';

import { Paper, Typography } from '@material-ui/core';

import { useTheme } from '@material-ui/styles';

const InfoBanner = () => {
    const theme = useTheme();

    return (
        <Paper style={ { margin: theme.spacing(2), padding: theme.spacing(2), background: theme.palette.secondary.main } }>
            <Typography variant='body1' align='center'>The Fall 2020 Announcer is not expected to come out until 4/24.</Typography>
        </Paper>
    );
}

export default InfoBanner;
