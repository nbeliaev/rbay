import { itemKey } from '$services/keys';
import { client } from '$services/redis';
import type { CreateItemAttrs } from '$services/types';
import { genId } from '$services/utils';
import { deserialize } from './deserialize';
import { serialize } from './serialize';

export const getItem = async (id: string) => {
    const item = await client.hGetAll(itemKey(id));

    if (Object.keys(item).length === 0) {
        return null;
    }

    return deserialize(id, item);
};

export const getItems = async (ids: string[]) => {
    const commands = ids.map((id) => {
        return client.hGetAll(itemKey(id));
    });

    const results = await Promise.all(commands);

    return results.map((result, i) => {
        if (Object.keys(result).length === 0) {
            return null;
        }
        
        return deserialize(ids[i], result);
    })
};

export const createItem = async (attrs: CreateItemAttrs, userId: string) => {
    console.log(attrs);

    const id = genId();
    await client.hSet(itemKey(id), serialize(attrs));
    return id;
};
