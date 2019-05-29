import { createStyles } from '@material-ui/core';

export default theme => createStyles({
    card: {
        padding: 15,
        margin: 15,
        marginBottom: 0,
        width: 600,
        maxWidth: 'calc(100vw - 30px)',
        [theme.breakpoints.up('sm')]: {
            maxWidth: 'calc(50vw - 30px)'
        }
    },
    blockIcon: {
        display: 'block',
        margin: 'auto'
    }
});
