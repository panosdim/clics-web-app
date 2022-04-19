export type clicsCodesType = {
    ian: string;
    activity: string;
    object: string;
};

export type clicsCodesDescType = clicsCodesType & {
    description: string;
}

export type clicsCodesValidType = {
    ian: boolean;
    activity: boolean;
    object: boolean;
};

export type dbResults = clicsEntity[];

export type clicsEntity = {
    week: string;
    object: string;
    activity: string;
    ian: string;
    _id: string;
    owner_id: string;
    days: selectedDaysType;
};

export type selectedDaysType = {
    monday: boolean;
    tuesday: boolean;
    wednesday: boolean;
    thursday: boolean;
    friday: boolean;
};