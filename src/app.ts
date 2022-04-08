import express, { CookieOptions } from 'express';
import storeInit from 'connect-session-sequelize';
import session, { SessionOptions } from "express-session";
import { sequelize, Session } from "./models";
import { CustomSequelizeStore } from "./CustomSequelizeStore";
import { attachRequestUIDMiddleware } from "./utils";
import morgan from "morgan";
import { loggerStream } from "./logger";
import { LoggerLevelEnum } from "./enums/logger-level.enum";
import passport from 'passport';
import { configurePassport } from "./passport";

const SequelizeStore = storeInit(session.Store);

const app = express();

const storeOptions = {
    db: sequelize,
    table: 'Session',
    extendDefaultFields: Session.extendDefaultFields,
};

const sessionOptions = {
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new CustomSequelizeStore(new SequelizeStore(storeOptions)),
    cookie: <CookieOptions>{
        maxAge: 6 * 30 * 24 * 60 * 60 * 1000, // approximately 6 months
    },
} as SessionOptions;

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);

    sessionOptions!.cookie!.secure = true;
}

app.disable('x-powered-by');

app.use(attachRequestUIDMiddleware);
app.use((req, res, next) => {
    morgan('combined', {
        stream: loggerStream(LoggerLevelEnum.http, req.requestUID),
    })(req, res, next);
});
app.use(express.json({}));
app.use(express.urlencoded({ extended: false }));
app.use(session(sessionOptions));
app.use(passport.initialize());
app.use(passport.session());

configurePassport(passport);


app.get('/', function (req, res) {
    res.send('Welcome to Passport with Sequelize');
});

export default app;
