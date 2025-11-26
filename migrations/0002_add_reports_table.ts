import { pgTable, uuid, text, timestamp, boolean, pgSchema } from 'drizzle-orm/pg-core';

export async function up(db: any) {
  await db.schema.createTable('reports', (table: any) => {
    table.uuid('id').primaryKey().defaultTo(db.raw('gen_random_uuid()'));
    table.text('reporter_name').notNullable();
    table.text('reporter_email').notNullable();
    table.text('reporter_phone');
    table.text('animal_type').notNullable();
    table.text('breed');
    table.text('color');
    table.text('location').notNullable();
    table.text('city').notNullable();
    table.text('description').notNullable();
    table.text('urgency').notNullable();
    table.boolean('has_injuries').defaultTo(false);
    table.text('injuries_description');
    table.boolean('is_dangerous').defaultTo(false);
    table.text('additional_info');
    table.jsonb('images').defaultTo('[]');
    table.text('status').defaultTo('pending');
    table.timestamp('created_at').defaultTo(db.raw('now()'));
    table.timestamp('updated_at').defaultTo(db.raw('now()'));
  });
}

export async function down(db: any) {
  await db.schema.dropTable('reports');
}
