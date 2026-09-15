import pool from "./pool.js";

try {
    const result = await pool.query(`
        SELECT
            current_database(),
            current_user,
            current_schema();
    `);

    console.log(result.rows);

} catch (error) {
    console.error(error);

} finally {
    await pool.end();
}