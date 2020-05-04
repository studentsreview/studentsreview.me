import React, { useState } from 'react';
import { Typography } from '@material-ui/core';

import { useTheme } from '@material-ui/styles';

const CollapsibleText = ({ text, truncateLength = 500, typographyProps }) => {
    const [expanded, setExpanded] = useState(false);

    const theme = useTheme();

    return (
        <Typography variant='body1' { ...typographyProps }>
            { expanded ? text : text.slice(0, truncateLength + 1) }{ !expanded && text.length > truncateLength ? '…' : null }
            { text.length > truncateLength ? <p
                onClick={ () => setExpanded(!expanded) }
                style={ { margin: 0, color: theme.palette.secondary.dark, cursor: 'pointer' } }>
                { expanded ? 'Collapse' : 'Expand' }
            </p> : null }
        </Typography>
    )
};

export default CollapsibleText;
