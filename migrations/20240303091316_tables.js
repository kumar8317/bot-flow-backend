/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = async function(knex) {
  await knex.raw(`\
    CREATE TABLE workflows (
        id UUID NOT NULL PRIMARY KEY,
        user_email VARCHAR(200) NOT NULL,
        user_id VARCHAR(200) NOT NULL,
        script TEXT NOT NULL,
        runOnce BOOLEAN NOT NULL DEFAULT FALSE,
        cron_expr VARCHAR(200) NOT NULL
    );
  `)
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = async function(knex) {
  await knex.raw(`\
    DROP TABLE workflows;
  `)
};
