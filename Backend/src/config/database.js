'use strict';
import mysql from 'mysql2';
import 'dotenv/config'
const getConnection = async () => {
    const connection = await mysql.createPool({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        port: Number(process.env.DB_PORT) || 3306,
        waitForConnections: true,
        connectionLimit: 100,
        queueLimit: 0
    });
    return connection;
};
export default getConnection;
