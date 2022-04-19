import CloseIcon from '@mui/icons-material/Close';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton } from '@mui/material';
import React, { useState } from 'react';
import { clicsEntity } from '../model';

interface Props {
    open: boolean;
    selectedWeek: Date;
    clicsItem: clicsEntity | undefined;
    onClose: () => void;
}

export function EntryForm(props: Props) {
    const { open, selectedWeek, clicsItem, onClose } = props;
    const [isSubmitting, setIsSubmitting] = useState(false);

    const deleteEntry = () => {};

    return (
        <Dialog
            fullWidth
            maxWidth={'xs'}
            onClose={(event, reason) => {
                if (reason !== 'backdropClick') {
                    onClose();
                }
            }}
            open={open}
        >
            <DialogTitle>
                {clicsItem ? 'Edit Entry' : 'New Entry'}
                <IconButton
                    aria-label='close'
                    onClick={() => onClose()}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent dividers></DialogContent>

            <DialogActions>
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: clicsItem ? 'space-between' : 'flex-end',
                        width: '100%',
                    }}
                >
                    {clicsItem && (
                        <Button variant='outlined' color='error' onClick={deleteEntry}>
                            Delete
                        </Button>
                    )}

                    {clicsItem ? (
                        <Button
                            form='customer-form'
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={isSubmitting}
                        >
                            Update
                        </Button>
                    ) : (
                        <Button
                            form='customer-form'
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={isSubmitting}
                        >
                            Create
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}
