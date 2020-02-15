import React, { useState } from 'react'
import { IconButton, TableCell, TableRow } from '@material-ui/core';
import { Maximize, Minimize } from '@material-ui/icons';

const TableSection = ({ children, colSpan, header, initialExpanded=true }) => {
    const [expanded, setExpanded] = useState(initialExpanded);

    return (
        <>
            <TableRow>
                <TableCell colSpan={ colSpan } style={ { textAlign: 'center' } }>
                    <IconButton onClick={ () => setExpanded(!expanded) } size='small'>
                        { expanded ? <Minimize/> : <Maximize/> }
                    </IconButton>{ header }
                </TableCell>
            </TableRow>
            { expanded ? children : null }
        </>
    )
};

export default TableSection;
