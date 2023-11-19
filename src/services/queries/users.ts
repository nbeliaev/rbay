import { usernamesKey, usernamesUniqueKey, usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => {
    const decimalId = await client.zScore(usernamesKey(), username);

    if (!decimalId) {
        throw new Error('User does not exist');
    }

    const id = decimalId.toString(16);

    const user = await client.hGetAll(usersKey(id));

    return deserealize(id, user);
};

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));

    return deserealize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const exists = await client.sIsMember(usernamesUniqueKey(), attrs.username);
    if (exists) {
        throw new Error('Username is taken');
    }

    const id = genId();

    await client.hSet(usersKey(id), serealize(attrs));
    await client.sAdd(usernamesUniqueKey(), attrs.username);
    await client.zAdd(usernamesKey(), {
        value: attrs.username,
        score: parseInt(id, 16)
    });

    return id;
};

const serealize = (user: CreateUserAttrs) => {
    return {
        username: user.username,
        password: user.password
    }
}

const deserealize = (id: string, user: { [key: string]: string }) => {
    return {
        id,
        username: user.username,
        password: user.password
    }
}