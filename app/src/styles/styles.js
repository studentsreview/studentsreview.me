import { createStyles } from '@material-ui/styles';

export default theme => createStyles({
    card: {
        padding: theme.spacing(3),
        margin: theme.spacing(2),
        width: 600,
        maxWidth: `calc(100vw - ${ theme.spacing(10) }px)`,
        [theme.breakpoints.up('sm')]: {
            maxWidth: `calc(50vw - ${ theme.spacing(10) }px)`
        }
    },
    blockIcon: {
        display: 'block',
        margin: 'auto'
    }
});
