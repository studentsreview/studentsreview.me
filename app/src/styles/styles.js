import { createStyles } from '@material-ui/core';

export default theme => createStyles({
    card: {
        padding: 15,
        margin: 20,
        width: 600,
        maxWidth: 'calc(100vw - 40px)',
        [theme.breakpoints.up('md')]: {
            maxWidth: 'calc(50vw - 40px)'
        }
    }
});
