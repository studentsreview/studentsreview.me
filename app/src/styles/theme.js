import { createMuiTheme } from '@material-ui/core';
import red from '@material-ui/core/colors/red';
import { white } from '@material-ui/core/colors/common';

export default createMuiTheme({
    typography: {
        useNextVariants: true,
        fontFamily: 'Fira Mono, Helvetica, sans-serif'
    },
    palette: {
        primary: {
            light: red[700],
            main: red[800],
            dark: red[900],
            contrastText: white
        }
    }
});
