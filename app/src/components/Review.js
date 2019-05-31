import React, { Fragment, useEffect, useState, useRef } from 'react';
import { ClickAwayListener, IconButton, Paper, MenuItem, Popper, withStyles } from '@material-ui/core';
import { MoreVert } from '@material-ui/icons';
import StarRatings from 'react-star-ratings';
import { isIOS } from 'react-device-detect';

import sha256 from 'sha256';
import moment from 'moment';

import styles from '../styles/styles';

const Review = ({ classes, review }) => {
    const anchorEl = useRef(null);
    const [open, setOpen] = useState(false);
    const [initialized, setInitialized] = useState(false);

    useEffect(() => {
        if (!initialized && window.location.hash.substr(1) === sha256(review.timestamp.toString().concat(review.text)).substr(0, 10)) {
            anchorEl.current.scrollIntoView();
            setInitialized(true);
        }
    });

    return (
        <p className={ classes.card } style={ {
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
                        padding: 5,
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
                review.version === 0 ? <Fragment>
                    <StarRatings
                        rating={ review.rating }
                        starRatedColor='gold'
                        starHoverColor='gold'
                        numberOfStars={ 5 }
                        starDimension={ 12.5 }
                        starSpacing={ 1.25 }
                    />
                    <span style={ {
                        marginLeft: 2.5,
                        fontSize: 12.5
                    } }>{ moment(review.timestamp).format('MMM Do YYYY') }</span>
                </Fragment> : <span style={ {
                    fontSize: 12.5
                } }>Restored from ratemyteachers.com</span>
            }
            <br/>
            {
                review.text.replace(/Submitted by a student$/, '').replace(/Submitted by a Parent$/, '')
            }
        </p>
    );
}

export default withStyles(styles)(Review);
