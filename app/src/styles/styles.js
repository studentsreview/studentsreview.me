import { createStyles } from '@material-ui/core';

export default theme => createStyles({
    card: {
        padding: 15,
        margin: 5,
        width: 600,
        maxWidth: 'calc(100vw - 25px)',
        [theme.breakpoints.up('sm')]: {
            maxWidth: 'calc(50vw - 25px)'
        }
    },
    blockIcon: {
        display: 'block',
        margin: 'auto'
    }
});
