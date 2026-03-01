import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let initliasing : Promise<any> | null = null;

async function prepareDB(db: SQLiteDBConnection) {
    await db.executeSet([
        {
            statement:
            `CREATE TABLE IF NOT EXISTS LEDGERS (
                id INTEGER PRIMARY KEY NOT NULL,
                name VARCHAR(50) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
                img INTEGER
            );`,
            values: []
        },
        {
            statement:
            `CREATE TABLE IF NOT EXISTS TRANSACTIONS (
                id INTEGER PRIMARY KEY NOT NULL,
                ledger_id INTEGER NOT NULL,
                name VARCHAR(20) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
                details VARCHAR(256),
                amount DECIMAL(13, 4) NOT NULL CHECK (amount > 0),
                create_time INTEGER NOT NULL DEFAULT (strftime('%s', 'now') * 1000),
                transaction_time INTEGER,
                FOREIGN KEY (ledger_id) REFERENCES LEDGERS(id) ON DELETE CASCADE
            );`,
            values: []
        },
        {
            statement: "CREATE INDEX IF NOT EXISTS index_transaction_ledger_id ON TRANSACTIONS (ledger_id);",
            values: []
        },
        {
            statement: "CREATE INDEX IF NOT EXISTS index_transaction_create_time ON TRANSACTIONS (create_time);",
            values: []
        }
    ]);
}

async function initDatabase() {    
    if (Capacitor.getPlatform() === "web") {
        await customElements.whenDefined('jeep-sqlite');
        await sqlite.initWebStore();        
    }

    const db = await sqlite.createConnection(
        "ledgerdb",
        false,
        "no-encryption",
        1,
        false
    );

    await db.open();
    await prepareDB(db);
    return db;
}

export async function getDB() {
    if (db) {
        return db as SQLiteDBConnection;
    }

    if (!initliasing) {
        initliasing = initDatabase();
    }
    
    db = await initliasing;
    return db as SQLiteDBConnection;
}

export async function closeDB() {
    if (!db) {
        return;
    }

    await db.close();
    db = null;
    initliasing = null;
}

export default {
    getDB, closeDB
};