import moment from 'moment';
import session, { SessionData } from 'express-session';
import { Session } from "./models";

export class CustomSequelizeStore extends session.Store {
    constructor(private store: session.Store) {
        super();
    }

    get(
        sid: string,
        callback: (err: any, session?: session.SessionData | null) => void
    ): void {
        this.store.get(sid, callback);
    }

    set(
        sid: string,
        session: session.SessionData,
        callback?: (err?: any) => void
    ): void {
        this.store.set(sid, session, callback);
    }

    destroy(sid: string, callback?: (err?: any) => void): void {
        this.store.destroy(sid, callback);
    }

    touch?(sid: string, session: SessionData, callback?: () => void): void {
        const executeTouch = () => {
            if (this.store.touch) {
                this.store.touch(sid, session, callback);
            } else if (super.touch) {
                super.touch(sid, session, callback);
            }
        };

        Session.findOne({
            where: {
                sid: sid,
            },
        })
            .then((result) => {
                if (!result || !result.data) {
                    executeTouch();
                    return;
                }
                if (!moment(result.updatedAt).add(1, 'month').isAfter(new Date())) {
                    executeTouch();
                    return;
                }

                if (callback) callback();
            })
            .catch((err) => {
                executeTouch();
            });
    }

    all?(
        callback: (
            err: any,
            obj?: SessionData[] | { [sid: string]: SessionData } | null
        ) => void
    ): void {
        if (this.store.all) {
            this.store.all(callback);
        } else if (super.all) {
            super.all(callback);
        }
    }

    length?(callback: (err: any, length: number) => void): void {
        if (this.store.length) {
            this.store.length(callback);
        } else if (super.length) {
            super.length(callback);
        }
    }

    clear?(callback?: (err?: any) => void): void {
        if (this.store.clear) {
            this.store.clear(callback);
        } else if (super.clear) {
            super.clear(callback);
        }
    }
}
