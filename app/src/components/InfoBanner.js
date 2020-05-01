import React from 'react';

import { Paper, Typography } from '@material-ui/core';

import { useTheme } from '@material-ui/styles';

const InfoBanner = () => {
    const theme = useTheme();

    return (
        <Paper style={ { margin: theme.spacing(2), padding: theme.spacing(2), background: theme.palette.secondary.main } }>
            <Typography variant='body1' align='center'>Updated with the 2020-2021 Announcer. Arena Rolodex will be updated soon!</Typography>
        </Paper>
    );
}

export default InfoBanner;
