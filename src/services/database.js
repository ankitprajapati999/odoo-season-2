/**
 * ============================================================
 * Database Service
 * ============================================================
 *
 * Generic CRUD helper for Supabase.
 *
 * IMPORTANT:
 * This file NEVER creates a Supabase client.
 *
 * React components must first obtain an authenticated client:
 *
 *    const supabase = useSupabase();
 *
 * Then pass it into these functions:
 *
 *    database.list(supabase, "messages");
 *
 * This keeps authentication separated from database logic.
 * ============================================================
 */

function handleError(error, action) {
  if (error) {
    throw new Error(`Database Error (${action}): ${error.message}`);
  }
}

/**
 * Create a record
 */
async function create(client, table, data) {
  const { data: result, error } = await client
    .from(table)
    .insert(data)
    .select()
    .single();

  handleError(error, `create in "${table}"`);

  return result;
}

/**
 * Get one record by ID
 */
async function getById(client, table, id, idColumn = "id") {
  const { data, error } = await client
    .from(table)
    .select("*")
    .eq(idColumn, id)
    .maybeSingle();

  handleError(error, `get from "${table}"`);

  return data;
}

/**
 * List records
 */
async function list(client, table, options = {}) {
  const { filters = {} } = options;

  let query = client
    .from(table)
    .select("*");

  for (const [column, value] of Object.entries(filters)) {
    query = query.eq(column, value);
  }

  const { data, error } = await query;

  handleError(error, `list from "${table}"`);

  return data;
}

/**
 * Update a record
 */
async function update(client, table, id, updates, idColumn = "id") {
  const { data, error } = await client
    .from(table)
    .update(updates)
    .eq(idColumn, id)
    .select()
    .single();

  handleError(error, `update in "${table}"`);

  return data;
}

/**
 * Delete a record
 */
async function deleteRecord(client, table, id, idColumn = "id") {
  const { error } = await client
    .from(table)
    .delete()
    .eq(idColumn, id);

  handleError(error, `delete from "${table}"`);

  return true;
}

export default {
  create,
  getById,
  list,
  update,
  deleteRecord,
};
