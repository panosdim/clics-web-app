import * as React from 'react';
import * as Realm from 'realm-web';
import { Clics, Header } from '../components';

type MainProps = {
    user: Realm.User;
    setUser: (user: Realm.User | null) => void;
};
export const Main = ({ user, setUser }: MainProps) => {
    return (
        <>
            <Header user={user} setUser={setUser} />
            <Clics user={user} />
        </>
    );
};
