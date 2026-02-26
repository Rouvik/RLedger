import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let initliasing : Promise<any> | null = null;

async function prepareDB(db: SQLiteDBConnection) {
    await db.execute("CREATE TABLE IF NOT EXISTS LEDGERS (id INTEGER PRIMARY KEY, name VARCHAR(50));");
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
        return db;
    }

    if (!initliasing) {
        initliasing = initDatabase();
    }
    
    db = await initliasing;
    return db;
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