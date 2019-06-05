import { createStyles } from '@material-ui/styles';

export default theme => createStyles({
    card: {
        padding: theme.spacing(3),
        margin: theme.spacing(2),
        width: `calc(100vw - ${ theme.spacing(15) }px)`,
        [theme.breakpoints.up('sm')]: {
            width: `calc(50vw - ${ theme.spacing(15) }px)`
        }
    },
    majorCard: {
        padding: theme.spacing(3),
        margin: theme.spacing(2),
        width: `calc(100vw - ${ theme.spacing(15) }px)`,
        [theme.breakpoints.up('sm')]: {
            width: `calc(60vw - ${ theme.spacing(15) }px)`
        }
    },
    minorCard: {
        padding: theme.spacing(3),
        margin: theme.spacing(2),
        width: `calc(100vw - ${ theme.spacing(15) }px)`,
        [theme.breakpoints.up('sm')]: {
            width: `calc(40vw - ${ theme.spacing(15) }px)`
        }
    },
    blockIcon: {
        display: 'block',
        margin: 'auto'
    },
    scalingText: {
        fontSize: '1.8vw',
        [theme.breakpoints.up('sm')]: {
            fontSize: '0.9vw'
        }
    }
});
