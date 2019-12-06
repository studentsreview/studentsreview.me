import React, { useState } from 'react';
import { Grid, Button, TextField, Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/styles';

import styles from '../../styles/styles';

const StudentVueLoginForm = ({ classes, onLogin }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [error, setError] = useState(null);

    return (
        <form className={ classes.control } noValidate autoComplete='off' onSubmit={ e => {
            e.preventDefault();
            fetch(`${ process.env.GRAPHQL_URI }/portal/schedule`, {
                method: 'POST',
                body: JSON.stringify({ username, password }),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(res => {
                    if (res.status === 200) {
                        res.json().then(onLogin);
                    } else {
                        res.json().then(json => {
                            setError(json.message);
                        });
                    }
                })
                .catch(err => setError(err));
        } }>
            <Grid container direction='column' alignItems='flex-start'>
                <Typography className={ classes.root } variant='h6'>
                    Log in to StudentVue to Import Your Current Classes
                </Typography>
                <TextField
                    className={ classes.root }
                    label='Username'
                    variant='outlined'
                    value={ username }
                    onChange={ e => setUsername(e.target.value) }
                />
                <TextField
                    className={ classes.root }
                    label='Password'
                    type='password'
                    variant='outlined'
                    value={ password }
                    onChange={ e => setPassword(e.target.value) }
                />
                { error ? <Typography className={ classes.root } variant='body1' style={ { fontSize: 12, color: 'red' } }>{ error }</Typography> : null }
                <Button
                    className={ classes.root }
                    type='submit'
                    variant='contained'
                    color='primary'
                >Login</Button>
            </Grid>
        </form>
    );
}

export default withStyles(styles)(StudentVueLoginForm);
