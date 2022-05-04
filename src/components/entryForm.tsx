import CloseIcon from '@mui/icons-material/Close';
import {
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControl,
    FormControlLabel,
    FormGroup,
    FormHelperText,
    IconButton,
    LinearProgress,
    Stack,
    TextField,
} from '@mui/material';
import { getISOWeek, getYear } from 'date-fns';
import { useSnackbar } from 'notistack';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import * as Realm from 'realm-web';
import { clicsCodesDescType, clicsEntity, dbResults, EntryFormType } from '../model';
import { knownCodes } from '../utils';

const CLUSTER_NAME = process.env.REACT_APP_CLUSTER_NAME || '';
const DATABASE_NAME = process.env.REACT_APP_DATABASE_NAME || '';
const COLLECTION_NAME = process.env.REACT_APP_COLLECTION_NAME || '';

const {
    BSON: { ObjectId },
} = Realm;

interface Props {
    user: Realm.User;
    open: boolean;
    selectedWeek: Date;
    clicsItem: clicsEntity | undefined;
    onClose: () => void;
}

export function EntryForm(props: Props) {
    const { open, user, selectedWeek, clicsItem, onClose } = props;
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [allDays, setAllDays] = useState(false);
    const { enqueueSnackbar } = useSnackbar();

    const mongo = user.mongoClient(CLUSTER_NAME);
    const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

    const {
        control,
        formState: { errors },
        setValue,
        getValues,
        reset,
        watch,
        setError,
        clearErrors,
        handleSubmit,
    } = useForm<EntryFormType>();

    React.useEffect(() => {
        if (open) {
            reset();
            if (clicsItem) {
                setValue('ian', clicsItem.ian);
                setValue('activity', clicsItem.activity);
                setValue('object', clicsItem.object);
                setValue('monday', clicsItem.days.monday);
                setValue('tuesday', clicsItem.days.tuesday);
                setValue('wednesday', clicsItem.days.wednesday);
                setValue('thursday', clicsItem.days.thursday);
                setValue('friday', clicsItem.days.friday);
                setAllDays(Object.values(clicsItem.days).reduce((prev, current) => prev && current));
            } else {
                setValue('ian', '');
                setValue('activity', '');
                setValue('object', '');
                setAllDays(false);
                setValue('monday', false);
                setValue('tuesday', false);
                setValue('wednesday', false);
                setValue('thursday', false);
                setValue('friday', false);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [open]);

    const onSubmit = (data: EntryFormType) => {
        let objectToStore: Partial<clicsEntity> = {};
        const week: string = String(getISOWeek(selectedWeek)) + String(getYear(selectedWeek));

        // Check if we have conflict in selected days
        items.find({ week: week }, { limit: 1000 }).then((docs: dbResults) => {
            const results = clicsItem ? docs.filter((item) => item._id.toString() !== clicsItem._id.toString()) : docs;
            const conflict: boolean = results.some((item) => {
                let result: boolean = false;
                Object.entries(item.days).forEach(([key, value]) => {
                    if (value) {
                        if (data[key as keyof EntryFormType]) {
                            result = true;
                            return;
                        }
                    }
                });
                return result;
            });

            if (conflict) {
                setError('daysConflict', {
                    type: 'custom',
                    message: 'There is a conflict in selected days with previous entries.',
                });
                return;
            } else {
                setIsSubmitting(true);
                // Check if we add a new object or update an existing
                if (clicsItem) {
                    objectToStore = {
                        week: week,
                        ian: data.ian,
                        activity: data.activity,
                        object: data.object,
                        days: {
                            monday: data.monday,
                            tuesday: data.tuesday,
                            wednesday: data.wednesday,
                            thursday: data.thursday,
                            friday: data.friday,
                        },
                    };

                    items
                        .updateOne({ _id: new ObjectId(clicsItem._id) }, { $set: objectToStore })
                        .then(() => {
                            setIsSubmitting(false);
                            enqueueSnackbar('Entry edited successfully.', { variant: 'success' });
                            onClose();
                        })
                        .catch((err) => {
                            setIsSubmitting(false);
                            enqueueSnackbar('Error editing entry.', { variant: 'error' });
                            console.error(`Failed to update item: ${err}`);
                        });
                } else {
                    objectToStore = {
                        week: week,
                        ian: data.ian,
                        activity: data.activity,
                        object: data.object,
                        days: {
                            monday: data.monday,
                            tuesday: data.tuesday,
                            wednesday: data.wednesday,
                            thursday: data.thursday,
                            friday: data.friday,
                        },
                        owner_id: user.id,
                    };

                    items
                        .insertOne(objectToStore)
                        .then(() => {
                            setIsSubmitting(false);
                            enqueueSnackbar('New entry added successfully.', { variant: 'success' });
                            onClose();
                        })
                        .catch((err) => {
                            setIsSubmitting(false);
                            enqueueSnackbar('Error adding new entry.', { variant: 'error' });
                            console.error(`Failed to insert item: ${err}`);
                        });
                }
            }
        });
    };

    const deleteEntry = () => {
        if (clicsItem) {
            setIsSubmitting(true);
            items.deleteOne({ _id: new ObjectId(clicsItem._id) }).then(() => {
                setIsSubmitting(false);
                enqueueSnackbar('New entry deleted successfully.', { variant: 'success' });
                onClose();
            });
        }
    };

    const validateDays = (): boolean => {
        const days = getValues(['monday', 'tuesday', 'wednesday', 'thursday', 'friday']);
        return days.reduce((prev, current) => prev || current);
    };

    const handleAllDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === 'all') {
            setAllDays(e.target.checked);
            if (e.target.checked) {
                setValue('monday', true);
                setValue('tuesday', true);
                setValue('wednesday', true);
                setValue('thursday', true);
                setValue('friday', true);
            } else {
                setValue('monday', false);
                setValue('tuesday', false);
                setValue('wednesday', false);
                setValue('thursday', false);
                setValue('friday', false);
            }
        }
    };

    const handleChipClick = (code: clicsCodesDescType) => {
        setValue('ian', code.ian);
        setValue('activity', code.activity);
        setValue('object', code.object);
    };

    React.useEffect(() => {
        const subscription = watch((data, { name, type }) =>
            setAllDays(!!data.monday && !!data.tuesday && !!data.wednesday && !!data.thursday && !!data.friday),
        );
        return () => subscription.unsubscribe();
    }, [watch]);

    return (
        <Dialog
            fullWidth
            maxWidth={'sm'}
            onClose={(_event, reason) => {
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
            <DialogContent dividers>
                <Stack direction='row' spacing={2}>
                    {knownCodes.map((code) => (
                        <Chip key={code.activity} label={code.description} onClick={() => handleChipClick(code)} />
                    ))}
                </Stack>
                <form id='entry-form' onSubmit={handleSubmit(onSubmit)} noValidate autoComplete='off'>
                    <Controller
                        name='ian'
                        control={control}
                        rules={{
                            pattern: {
                                value: /[0-9]{2}-[0-9]{3}/,
                                message: 'Please provide a valid ian',
                            },
                            required: 'This field is required',
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='ian'
                                autoComplete='off'
                                label='IAN'
                                required
                                fullWidth
                                variant='outlined'
                                size='small'
                                error={!!errors.ian}
                                helperText={errors?.ian?.message}
                                margin='dense'
                            />
                        )}
                    />

                    <Controller
                        name='activity'
                        control={control}
                        rules={{
                            pattern: {
                                value: /[0-9]{4}/,
                                message: 'Please provide a valid activity',
                            },
                            required: 'This field is required',
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='activity'
                                label='Activity'
                                fullWidth
                                variant='outlined'
                                size='small'
                                error={!!errors.activity}
                                helperText={errors?.activity?.message}
                                margin='dense'
                                required
                            />
                        )}
                    />

                    <Controller
                        name='object'
                        control={control}
                        rules={{
                            pattern: {
                                value: /[0-9]{4}/,
                                message: 'Please provide a valid object',
                            },
                            required: 'This field is required',
                        }}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                id='object'
                                label='Object'
                                fullWidth
                                variant='outlined'
                                size='small'
                                error={!!errors.object}
                                helperText={errors?.object?.message}
                                margin='dense'
                                required
                            />
                        )}
                    />

                    <FormControl required error={!!errors.monday}>
                        <FormGroup
                            sx={{
                                display: 'flex',
                                flexDirection: 'row',
                                flexWrap: 'nowrap',
                                alignItems: 'flex-end',
                            }}
                        >
                            <FormControlLabel
                                control={<Checkbox checked={allDays} value='all' onChange={handleAllDaysChange} />}
                                label='All'
                                labelPlacement='top'
                            />

                            <Controller
                                name='monday'
                                control={control}
                                rules={{
                                    validate: validateDays,
                                }}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                value='monday'
                                            />
                                        }
                                        label='Monday'
                                        labelPlacement='top'
                                    />
                                )}
                            />

                            <Controller
                                name='tuesday'
                                control={control}
                                rules={{
                                    validate: validateDays,
                                }}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                value='tuesday'
                                            />
                                        }
                                        label='Tuesday'
                                        labelPlacement='top'
                                    />
                                )}
                            />

                            <Controller
                                name='wednesday'
                                control={control}
                                rules={{
                                    validate: validateDays,
                                }}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                value='wednesday'
                                            />
                                        }
                                        label='Wednesday'
                                        labelPlacement='top'
                                    />
                                )}
                            />

                            <Controller
                                name='thursday'
                                control={control}
                                rules={{
                                    validate: validateDays,
                                }}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                value='thursday'
                                            />
                                        }
                                        label='Thursday'
                                        labelPlacement='top'
                                    />
                                )}
                            />

                            <Controller
                                name='friday'
                                control={control}
                                rules={{
                                    validate: validateDays,
                                }}
                                render={({ field }) => (
                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                {...field}
                                                checked={field.value}
                                                onChange={(e) => field.onChange(e.target.checked)}
                                                value='friday'
                                            />
                                        }
                                        label='Friday'
                                        labelPlacement='top'
                                    />
                                )}
                            />
                        </FormGroup>
                        <FormHelperText hidden={!errors.monday}>Please select a day</FormHelperText>
                        <FormHelperText error={true} hidden={!errors.daysConflict}>
                            {errors.daysConflict?.message}
                        </FormHelperText>
                    </FormControl>

                    {isSubmitting && <LinearProgress />}
                </form>
            </DialogContent>

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
                            form='entry-form'
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={isSubmitting}
                        >
                            Update
                        </Button>
                    ) : (
                        <Button
                            form='entry-form'
                            variant='contained'
                            color='primary'
                            type='submit'
                            disabled={isSubmitting}
                            onClick={() => clearErrors()}
                        >
                            Create
                        </Button>
                    )}
                </Box>
            </DialogActions>
        </Dialog>
    );
}
