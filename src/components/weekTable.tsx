import DoneIcon from '@mui/icons-material/Done';
import { CircularProgress, Paper, Table, TableBody, TableCell, TableHead, TableRow } from '@mui/material';
import { getISOWeek, getYear } from 'date-fns';
import React, { useState } from 'react';
import * as Realm from 'realm-web';
import { clicsEntity, dbResults } from '../model';
import { findDescription } from '../utils';

const CLUSTER_NAME = process.env.REACT_APP_CLUSTER_NAME || '';
const DATABASE_NAME = process.env.REACT_APP_DATABASE_NAME || '';
const COLLECTION_NAME = process.env.REACT_APP_COLLECTION_NAME || '';
type WeekTableProps = {
    user: Realm.User;
    selectedWeek: Date;
    onSelectionChange: (item: clicsEntity | undefined) => void;
    refresh: boolean;
};

export const WeekTable = ({ user, selectedWeek, onSelectionChange, refresh }: WeekTableProps) => {
    const [clicsState, setClicsState] = useState<dbResults | undefined>();
    const [selectedRow, setSelectedRow] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const week: string = String(getISOWeek(selectedWeek)) + String(getYear(selectedWeek));

    React.useEffect(() => {
        setSelectedRow('');
        setIsLoading(true);

        const mongo = user.mongoClient(CLUSTER_NAME);
        const items = mongo.db(DATABASE_NAME).collection(COLLECTION_NAME);

        items.find({ week: week }, { limit: 1000 }).then((docs: dbResults) => {
            setIsLoading(false);
            setClicsState(docs);
        });

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedWeek, refresh]);

    const handleClick = (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, id: string) => {
        setSelectedRow(id);
        clicsState && onSelectionChange(clicsState.find((item) => item._id.toString() === id));
    };

    return (
        <Paper sx={{ maxWidth: 'max-content' }}>
            <Table sx={{ whiteSpace: 'nowrap' }}>
                <TableHead>
                    <TableRow>
                        <TableCell>IAN</TableCell>
                        <TableCell>Activity</TableCell>
                        <TableCell>Object</TableCell>
                        <TableCell>Description</TableCell>
                        <TableCell align='center'>Monday</TableCell>
                        <TableCell align='center'>Tuesday</TableCell>
                        <TableCell align='center'>Wednesday</TableCell>
                        <TableCell align='center'>Thursday</TableCell>
                        <TableCell align='center'>Friday</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {isLoading ? (
                        <TableRow key='loading'>
                            <TableCell colSpan={9} align='center'>
                                <CircularProgress />
                            </TableCell>
                        </TableRow>
                    ) : (
                        clicsState &&
                        clicsState.map((row) => {
                            const isSelected = selectedRow === row._id.toString();
                            return (
                                <TableRow
                                    sx={{ cursor: 'pointer' }}
                                    hover
                                    selected={isSelected}
                                    onClick={(e) => handleClick(e, row._id.toString())}
                                    key={row._id.toString()}
                                >
                                    <TableCell>{row.ian}</TableCell>
                                    <TableCell>{row.activity}</TableCell>
                                    <TableCell>{row.object}</TableCell>
                                    <TableCell>{findDescription(row.ian, row.activity, row.object)}</TableCell>
                                    <TableCell align='center'>{row.days.monday ? <DoneIcon /> : ''}</TableCell>
                                    <TableCell align='center'>{row.days.tuesday ? <DoneIcon /> : ''}</TableCell>
                                    <TableCell align='center'>{row.days.wednesday ? <DoneIcon /> : ''}</TableCell>
                                    <TableCell align='center'>{row.days.thursday ? <DoneIcon /> : ''}</TableCell>
                                    <TableCell align='center'>{row.days.friday ? <DoneIcon /> : ''}</TableCell>
                                </TableRow>
                            );
                        })
                    )}
                </TableBody>
            </Table>
        </Paper>
    );
};
