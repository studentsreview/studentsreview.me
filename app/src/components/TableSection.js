import React, { useState } from 'react'
import { IconButton, TableCell, TableRow } from '@material-ui/core';
import { ArrowRight, ArrowDropDown } from '@material-ui/icons';

const TableSection = ({ children, colSpan, header, initialExpanded=false }) => {
    const [expanded, setExpanded] = useState(initialExpanded);

    return (
        <>
            <TableRow>
                <TableCell onClick={ () => setExpanded(!expanded) } colSpan={ colSpan } style={ { textAlign: 'center' } }>
                    <IconButton size='small'>
                        { expanded ? <ArrowDropDown/> : <ArrowRight/> }
                    </IconButton>{ header }
                </TableCell>
            </TableRow>
            { expanded ? children : null }
        </>
    )
};

export default TableSection;
