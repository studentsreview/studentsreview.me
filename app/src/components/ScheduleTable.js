import React, { createElement } from 'react';
import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';

const ScheduleTable = ({ blocks, children }) => (
    <Table>
        <TableBody>
            {
                blocks
                    .map((block, idx) => <TableRow key={ idx }>
                        <TableCell>Period { block }</TableCell>
                        <TableCell>
                            { createElement(children, { block }) }
                        </TableCell>
                    </TableRow>)
            }
        </TableBody>
    </Table>
);

export default ScheduleTable;
