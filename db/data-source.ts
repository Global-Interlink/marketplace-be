import { DataSource, DataSourceOptions } from "typeorm";
// import dotenv from 'dotenv';
require('dotenv').config()


export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DATABASE_HOST,
    port: +process.env.DATABASE_PORT,
    username: process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [
        'dist/**/*.entity.js'
    ],
    migrations: [
        'dist/db/migrations/*.js'
    ],
};

const dataSource = new DataSource(dataSourceOptions);
export default dataSource;