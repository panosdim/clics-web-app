import AddIcon from '@mui/icons-material/Add';
import { Fab, Grid } from '@mui/material';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { clicsEntity } from '../model';
import { ClicsCalendar } from './calendar';
import { EntryForm } from './entryForm';
import { WeekTable } from './weekTable';

type ClicsProps = {
    user: Realm.User;
};
export function Clics({ user }: ClicsProps) {
    const [selectedWeek, setSelectedWeek] = useState(new Date());
    const [selectedItem, setSelectedItem] = useState<clicsEntity | undefined>();
    const [refresh, setRefresh] = useState(false);
    const [isEntryModalOpen, setIsEntryModalOpen] = useState(false);

    const createNewClics = () => {
        setSelectedItem(undefined);
        setIsEntryModalOpen(true);
    };

    const onSelectedWeekChanged = (selectedWeek: Date) => {
        setSelectedWeek(selectedWeek);
        setSelectedItem(undefined);
    };

    const onSelectedRowChanged = (item: clicsEntity | undefined) => {
        setSelectedItem(item);
        setIsEntryModalOpen(true);
    };

    const onClose = () => {
        setRefresh(!refresh);
        setSelectedItem(undefined);
        setIsEntryModalOpen(false);
    };

    return (
        <>
            <Fab
                sx={{ position: 'absolute', bottom: 16, right: 16 }}
                variant='extended'
                color='primary'
                onClick={createNewClics}
                aria-label='New Entry'
            >
                <AddIcon sx={{ mr: 1 }} />
                New Entry
            </Fab>
            <Grid
                sx={{
                    width: '100%',
                    padding: 2,
                }}
                container
                spacing={3}
                justifyContent='space-around'
            >
                <Grid item xs={4}>
                    <ClicsCalendar selectedWeek={selectedWeek} onSelectionChange={onSelectedWeekChanged} />
                </Grid>
                <Grid item xs={8}>
                    <WeekTable
                        user={user}
                        selectedWeek={selectedWeek}
                        refresh={refresh}
                        onSelectionChange={onSelectedRowChanged}
                    />
                </Grid>
            </Grid>
            <EntryForm
                open={isEntryModalOpen}
                user={user}
                selectedWeek={selectedWeek}
                clicsItem={selectedItem}
                onClose={onClose}
            />
        </>
    );
}
