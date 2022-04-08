import { createClient } from 'redis';
import { promisify } from 'util';

const client = createClient({
    port: process.env.REDIS_PORT ? +process.env.REDIS_PORT : undefined,
    host: process.env.REDIS_HOST,
    password: process.env.REDIS_PASSWORD,
});

client.on('error', (err) => {
    console.log('Redis Client Error ' + err);
});

const get: Function = promisify(client.get.bind(client));
const set: Function = promisify(client.set.bind(client));
const del: Function = promisify(client.del.bind(client));

// In seconds
const COOL_DOWN_DURATION = 10 * 60;
const UNSUCCESSFUL_LOGIN_COUNT_EXPIRATION = 24 * 60 * 60;

function authKey(userId: string): string {
    return `auth_${userId}`;
}


export interface IRedisService {

    getUnsuccessfulLoginCount(userId: string): Promise<number>;

    setUnsuccessfulLoginCount(
        userId: string,
        count: number,
        isDisabled: boolean
    ): Promise<string>;

    deleteUnsuccessfulLoginCount(userId: string): Promise<number>;
}

export class RedisService implements IRedisService {
    getUnsuccessfulLoginCount(userId: string): Promise<number> {
        return get(authKey(userId)).then(Number);
    }

    setUnsuccessfulLoginCount(
        userId: string,
        count: number,
        isDisabled: boolean
    ): Promise<string> {
        const expiresIn = isDisabled
            ? COOL_DOWN_DURATION
            : UNSUCCESSFUL_LOGIN_COUNT_EXPIRATION;
        return set(authKey(userId), count, 'EX', expiresIn);
    }

    deleteUnsuccessfulLoginCount(userId: string): Promise<number> {
        return del(authKey(userId));
    }
}
