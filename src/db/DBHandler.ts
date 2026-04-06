import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection, type capSQLiteSet } from "@capacitor-community/sqlite";
import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { FilePicker } from "@capawesome/capacitor-file-picker";

export const DB_VERSION = 1;

const sqlite = new SQLiteConnection(CapacitorSQLite);

let db: SQLiteDBConnection | null = null;
let initliasing: Promise<any> | null = null;

/**
 * Initialises database with required tables if not existing to prepare for operations
 * @param db The database connection to initialse database for
 */
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
                    amount DECIMAL(13, 4) NOT NULL CHECK (amount != 0),
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

/**
 * Initialises the database and prepares it before returning
 * @returns The database connection
 */
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

/**
 * Initialises and prepares the database if required and returns the db connection or returns an existing db connection
 * @returns The SQLite database connection
 */
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

/**
 * Closes the internal database connection, usually not required to call, the database is closed automatically on cleanup
 */
export async function closeDB() {
    if (!db) {
        return;
    }

    await db.close();
    db = null;
    initliasing = null;
}

/**
 * Container type for exporting and importing database
 */
type DBExport = {
    version: number,
    LEDGERS?: any[],
    TRANSACTIONS?: any[]
};

/**
 * Helper to check if obj is a valid entity of DBExport
 * @param obj An object assumed to be DBExport and checked for
 * @returns true if obj is a valid DBExport else false
 */
function isDBExport(obj: any): obj is DBExport {
    if (typeof obj !== "object" || obj === null) return false;

    // version must exist and be number
    if (typeof obj.version !== "number") return false;

    // TRANSACTIONS (optional)
    if (
        obj.TRANSACTIONS !== undefined &&
        !Array.isArray(obj.TRANSACTIONS)
    ) {
        return false;
    }

    // LEDGERS (optional)
    if (
        obj.LEDGERS !== undefined &&
        !Array.isArray(obj.LEDGERS)
    ) {
        return false;
    }

    return true;
}

/**
 * Calls corresponding implementation to export the internal SQLite DB as a JSON
 */
export async function exportDB() {
    const db = await getDB();
    const out: DBExport = {
        version: DB_VERSION
    };

    let ledgers, transactions;

    try {
        ledgers = await db.query("SELECT * from LEDGERS;");
        transactions = await db.query("SELECT * from TRANSACTIONS;");

        if (!ledgers.values || !transactions.values) {
            alert("Failed to export DB, database entries are invalid!");
            return;
        }
    } catch (error) {
        alert(error);
        return;
    }

    out.LEDGERS = ledgers?.values;
    out.TRANSACTIONS = transactions?.values;

    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const fname = `RLedger-${now}.json`;

    if (import.meta.env.VITE_PLATFORM === 'web') {
        const blob = new Blob([JSON.stringify(out)], { type: "application/json" });
        const down = document.createElement("a");
        down.href = URL.createObjectURL(blob);
        down.download = fname;
        document.body.appendChild(down);
        down.click();

        document.body.removeChild(down);
        URL.revokeObjectURL(down.href);
    }
    else if (import.meta.env.VITE_PLATFORM === 'android') {
        try {
            const writeResult = await Filesystem.writeFile({
                path: fname,
                data: JSON.stringify(out),
                directory: Directory.Cache,
                encoding: Encoding.UTF8
            });

            await Share.share({
                title: "Export DB",
                text: "Save exported database JSON",
                url: writeResult.uri
            });

            await Filesystem.deleteFile({
                path: fname,
                directory: Directory.Cache
            });

            alert("Saved succesfully!");
        } catch (error) {
            alert(error);
        }
    }
}

/**
 * Calls corresponding implementation to export the internal SQLite DB as a JSON
 */
export async function importDB() {
    const check = confirm("Warning this will delete existing data and replace with imported data, proceed?");

    if (!check) {
        alert("Cancelled by user.");
        return;
    }

    try {
        if (import.meta.env.VITE_PLATFORM === 'web') {
            const fp = document.createElement("input");
            fp.type = "file";
            document.body.appendChild(fp);

            fp.addEventListener("input", async () => {
                document.body.removeChild(fp);

                if (fp.files) {
                    const json = await getJSONFromFile(fp.files[0]);
                    const entries = JSON.parse(json);

                    await insertFromJSON(entries);
                }
            });

            fp.click();
        }
        else if (import.meta.env.VITE_PLATFORM === 'android') {
            const pickRes = await FilePicker.pickFiles({
                limit: 1,
                readData: true,
                types: ['application/json']
            });

            if (pickRes.files[0].data) {
                const json = atob(pickRes.files[0].data);
                const entries = JSON.parse(json);

                await insertFromJSON(entries);
            }
        }
    } catch (error) {
        alert(error);
    }
}

const fr = new FileReader();

/**
 * A helper to read files as string using Promise API
 * @param file The file to read as string
 * @returns Returns the string promise to read from
 */
async function getJSONFromFile(file: File): Promise<string> {
    fr.readAsText(file);

    return new Promise((res, err) => {
        fr.onload = () => {
            res(fr.result as string);
        }

        fr.onerror = () => {
            err(fr.error);
        }
    });
}

/**
 * REMOVES old DB content and UPDATES it with new entries
 * @param entries The entries to insert in DB
 */
async function insertFromJSON(entries: DBExport) {
    if (!isDBExport(entries)) {
        alert("Error invalid DBExport format detected, rejecting...");
        return;
    }

    if (entries.version != DB_VERSION) {
        alert(`Error export version mismatch, rejecting...\nIf you still want to proceed, edit the file and set 'version' to ${DB_VERSION} to force import but this might break the database!`);
        return;
    }

    if (!entries.LEDGERS || !entries.TRANSACTIONS) {
        alert("Error LEDGERS or TRANSACTIONS missing from import, ignoring");
        return;
    }

    const db = await getDB();

    try {
        const statements: capSQLiteSet[] = [
            {
                statement: "DELETE FROM LEDGERS;",
                values: []
            },
            {
                statement: "DELETE FROM TRANSACTIONS;",
                values: []
            }
        ];

        for (const ledger of entries.LEDGERS) {
            statements.push({
                statement: "INSERT INTO LEDGERS VALUES (?, ?, ?);",
                values: [ledger.id, ledger.name, ledger.img]
            });
        }

        for (const transaction of entries.TRANSACTIONS) {
            statements.push({
                statement: "INSERT INTO TRANSACTIONS VALUES (?, ?, ?, ?, ?, ?, ?);",
                values: [
                    transaction.id,
                    transaction.ledger_id,
                    transaction.name,
                    transaction.details,
                    transaction.amount,
                    transaction.create_time,
                    transaction.transaction_time
                ]
            });
        }

        await db.executeSet(statements, true);

        alert("Import successfull!");
    } catch (error) {
        alert(error);
    }
}

export default {
    getDB, closeDB, exportDB, importDB
};