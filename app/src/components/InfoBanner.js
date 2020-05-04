import React from 'react';

import { Paper, Typography } from '@material-ui/core';
import { OutboundLink } from 'gatsby-plugin-google-analytics';

import { useTheme } from '@material-ui/styles';

const InfoBanner = () => {
    const theme = useTheme();

    return (
        <Paper style={ { margin: theme.spacing(2), padding: theme.spacing(2), background: theme.palette.secondary.main } }>
            <OutboundLink href='https://arena.lowellhs.com' target='_blank' rel='noopener noreferrer'>
                <Typography variant='body1' align='center'>Click to visit Arena Rolodex!</Typography>
            </OutboundLink>
        </Paper>
    );
}

export default InfoBanner;
