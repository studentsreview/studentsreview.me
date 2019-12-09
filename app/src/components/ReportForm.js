import React, { useEffect, useState } from 'react';
import { Button, CircularProgress, FormControlLabel, RadioGroup, Radio } from '@material-ui/core';
import { Check, Close } from '@material-ui/icons'
import { withTheme, withStyles } from '@material-ui/styles';
import { Mutation } from 'react-apollo';

import { getReviewId } from '../utils';
import { CREATE_REPORT } from '../graphql';

import styles from '../styles/styles';
import { trackCustomEvent } from 'gatsby-plugin-google-analytics';

const ReportForm = ({ classes, review, teacher, onClose }) => {
    const [value, setValue] = useState('inappropriate');

    const keyDownHandler = e => {
        if (e.key === 'Escape') {
            if (typeof onClose === 'function') {
                onClose();
            }
        }
    }

    useEffect(() => {
        window.addEventListener('keydown', keyDownHandler);
        return () => window.removeEventListener('keydown', keyDownHandler);
    });

    return (
        <Mutation mutation={ CREATE_REPORT }>
            { (createReport, { data, error, loading }) => {
                if (data) {
                    return (
                        <>
                            <Check className={ classes.blockIcon } htmlColor='green'/>
                            <p style={ {
                                textAlign: 'center',
                                color: 'green'
                            } }>Report submitted successfully!</p>
                        </>
                    );
                } else if (error) {
                    return (
                        <>
                            <Close className={ classes.blockIcon } htmlColor='red'/>
                            <p style={ {
                                textAlign: 'center',
                                color: 'red'
                            } }>Unable to submit report.</p>
                        </>
                    );
                } else if (loading) {
                    return <CircularProgress className={ [classes.blockIcon, classes.control] } size={ 100 }/>;
                } else {
                    return (
                        <>
                            <RadioGroup value={ value } onChange={ e => setValue(e.target.value) }>
                                <FormControlLabel value='inappropriate' control={ <Radio/> } label='Inappropriate / Hateful Content'/>
                                <FormControlLabel value='uninformative' control={ <Radio/> } label='Uninformative / Unconstructive Content'/>
                            </RadioGroup>
                            <Button onClick={ () => {
                                trackCustomEvent({
                                    category: 'Report Form',
                                    action: 'Submit',
                                    label: teacher
                                });
                                createReport({
                                    variables: {
                                        reason: value,
                                        review: getReviewId(review, teacher)
                                    }
                                });
                            } }>Submit</Button>
                        </>
                    );
                }
            } }
        </Mutation>
    );
};

export default withStyles(styles)(withTheme(ReportForm));
