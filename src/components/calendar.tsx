import { styled, TextField } from '@mui/material';
import { red } from '@mui/material/colors';
import { LocalizationProvider, PickersDay, PickersDayProps, StaticDatePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { endOfWeek, getYear, isEqual, isSameDay, isWithinInterval, startOfWeek } from 'date-fns';
import enLocale from 'date-fns/locale/en-US';
import React, { useState } from 'react';
import { getHolidays } from '../utils';

const cloneDate = (date: Date | null) => {
    return date ? new Date(date.getTime()) : new Date();
};
type ClicsCalendarProps = {
    selectedWeek: Date | null;
    onSelectionChange: (week: Date) => void;
};

type CustomPickerDayProps = PickersDayProps<Date> & {
    dayIsBetween: boolean;
    isFirstDay: boolean;
    isLastDay: boolean;
    isHoliday: boolean;
};

const CustomPickersDay = styled(PickersDay, {
    shouldForwardProp: (prop) =>
        prop !== 'dayIsBetween' && prop !== 'isFirstDay' && prop !== 'isLastDay' && prop !== 'isHoliday',
})<CustomPickerDayProps>(({ theme, dayIsBetween, isFirstDay, isLastDay, isHoliday }) => ({
    ...(dayIsBetween && {
        borderRadius: 0,
        backgroundColor: theme.palette.primary.main,
        color: theme.palette.common.white,
        '&:hover, &:focus': {
            backgroundColor: theme.palette.primary.dark,
        },
    }),
    ...(isFirstDay && {
        borderTopLeftRadius: '50%',
        borderBottomLeftRadius: '50%',
    }),
    ...(isLastDay && {
        borderTopRightRadius: '50%',
        borderBottomRightRadius: '50%',
    }),
    ...(isHoliday && {
        '&&': {
            color: red[500],
        },
    }),
})) as React.ComponentType<CustomPickerDayProps>;

export const ClicsCalendar = (props: ClicsCalendarProps) => {
    const { selectedWeek, onSelectionChange } = props;
    const [selectedDate, handleDateChange] = useState(selectedWeek);

    const handleWeekChange = (date: Date | null) => {
        onSelectionChange(startOfWeek(cloneDate(date), { weekStartsOn: 1 }));
        handleDateChange(startOfWeek(cloneDate(date), { weekStartsOn: 1 }));
    };

    if (enLocale.options) {
        enLocale.options.weekStartsOn = 1;
    }

    const renderWeekPickerDay = (
        date: Date,
        selectedDates: Array<Date | null>,
        pickersDayProps: PickersDayProps<Date>,
    ) => {
        if (!selectedDate) {
            return <PickersDay {...pickersDayProps} />;
        }

        const start = startOfWeek(selectedDate, { weekStartsOn: 1 });
        const end = endOfWeek(selectedDate, { weekStartsOn: 1 });

        const holidays = getHolidays(getYear(date));

        const dayIsBetween = isWithinInterval(date, { start, end });
        const isFirstDay = isSameDay(date, start);
        const isLastDay = isSameDay(date, end);
        const isHoliday = holidays.some((holiday) => isEqual(holiday, date));

        return (
            <CustomPickersDay
                {...pickersDayProps}
                disableMargin
                dayIsBetween={dayIsBetween}
                isFirstDay={isFirstDay}
                isLastDay={isLastDay}
                isHoliday={isHoliday}
            />
        );
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDateFns} locale={enLocale}>
            <StaticDatePicker
                displayStaticWrapperAs='desktop'
                label='Week picker'
                value={selectedDate}
                onChange={handleWeekChange}
                renderDay={renderWeekPickerDay}
                renderInput={(params) => <TextField {...params} />}
                inputFormat="'Week of' MMM d"
                showDaysOutsideCurrentMonth={true}
            />
        </LocalizationProvider>
    );
};
