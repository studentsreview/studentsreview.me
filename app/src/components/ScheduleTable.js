import React, { createElement } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';

const ScheduleTable = ({ blocks, component }) => (
    <Table>
        <TableBody>
            {
                blocks
                    .map((block, idx) => <TableRow key={ idx }>
                        <TableCell>Period { block }</TableCell>
                        <TableCell>
                            { createElement(component, { block }) }
                        </TableCell>
                    </TableRow>)
            }
        </TableBody>
    </Table>
);

export default ScheduleTable;
