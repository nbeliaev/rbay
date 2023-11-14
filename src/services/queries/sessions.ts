import { sessionKey } from '$services/keys';
import { client } from '$services/redis';
import type { Session } from '$services/types';

export const getSession = async (id: string) => {
    const session = await client.hGetAll(sessionKey(id));
    return desereialize(id, session);
};

export const saveSession = async (session: Session) => {
    if (session.userId === undefined) {
        return null;
    }
    return client.hSet(sessionKey(session.id), serealize(session));
};

const serealize = (session: Session) => {
    return {
        userId: session.userId,
        username: session.username
    }
}

const desereialize = (id: string, session: { [key: string]: string }) => {
    return {
        id,
        userId: session.userId,
        username: session.username
    }
}
