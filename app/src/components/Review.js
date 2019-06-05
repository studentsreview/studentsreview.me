import React, { Fragment, useEffect, useState, useRef } from 'react';
import { ClickAwayListener, IconButton, Paper, MenuItem, Popper, Typography, withStyles } from '@material-ui/core';
import { withTheme } from '@material-ui/styles';
import { MoreVert } from '@material-ui/icons';
import StarRatings from 'react-star-ratings';
import { isIOS } from 'react-device-detect';

import sha256 from 'sha256';
import moment from 'moment';

import styles from '../styles/styles';

const Review = ({ classes, review, theme }) => {
    const anchorEl = useRef(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        if (window.location.hash.substr(1) === sha256(review.timestamp.toString().concat(review.text)).substr(0, 10)) {
            anchorEl.current.scrollIntoView();
        }
    }, []);

    return (
        <div className={ classes.majorCard } style={ {
            wordWrap: 'break-word',
            background: window.location.hash.substr(1) === sha256(review.timestamp.toString().concat(review.text)).substr(0, 10) ? 'rgba(0, 0, 0, 0.14)' : 'inherit'
        } }>

            <IconButton style={ {
                float: 'right'
            } }
                buttonRef={ anchorEl }
                onClick={ () => setOpen(!open) }
            >
                <MoreVert fontSize='small'/>
            </IconButton>
            <Popper
                anchorEl={ anchorEl.current }
                open={ open }
                onBlur={ () => setOpen(false) }
            >
                <ClickAwayListener onClickAway={ () => setOpen(false) }>
                    <Paper style={ {
                        padding: theme.spacing(1),
                        width: 200
                    } } onClick={ e => {
                        const textField = document.createElement('textarea');
                        e.target.appendChild(textField);
                        textField.innerText = `${ window.location.origin }${ window.location.pathname }#${ sha256(review.timestamp.toString().concat(review.text)).substr(0, 10) }`;
                        if (isIOS) {
                            const range = document.createRange();
                            range.selectNodeContents(textField);
                            const selection = window.getSelection();
                            selection.removeAllRanges();
                            selection.addRange(range);
                            textField.setSelectionRange(0, 999999);
                        } else {
                            textField.select();
                        }
                        document.execCommand('copy');
                        textField.remove();
                        setOpen(false);
                    } }>
                        <MenuItem>
                            Copy Link
                        </MenuItem>
                    </Paper>
                </ClickAwayListener>
            </Popper>
            {
                new Date(review.timestamp).toString() !== new Date('0001-01-01T00:00:00.000Z').toString() ? <Fragment>
                    <StarRatings
                        rating={ review.rating }
                        starRatedColor='gold'
                        starHoverColor='gold'
                        numberOfStars={ 5 }
                        starDimension={ theme.spacing(2.5) }
                        starSpacing={ theme.spacing(0.25) }
                    />
                    <Typography variant='caption' style={ {
                        marginLeft: theme.spacing(0.5)
                    } }>{ moment(review.timestamp).format('MMM Do YYYY') }</Typography>
                </Fragment> : <Typography variant='caption'>Restored from ratemyteachers.com</Typography>
            }
            <Typography variant='body1'>
                { review.text.replace(/Submitted by a student$/, '').replace(/Submitted by a Parent$/, '') }
            </Typography>
        </div>
    );
}

export default withStyles(styles)(withTheme(Review));
