import { usersKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateUserAttrs } from '$services/types';
import { genId } from '$services/utils';

export const getUserByUsername = async (username: string) => { };

export const getUserById = async (id: string) => {
    const user = await client.hGetAll(usersKey(id));

    return deserealize(id, user);
};

export const createUser = async (attrs: CreateUserAttrs) => {
    const id = genId();
    client.hSet(usersKey(id), serealize(attrs))
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