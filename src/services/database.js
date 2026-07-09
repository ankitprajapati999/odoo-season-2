import { supabase } from "./supabase";

/**
 * ============================================================
 * Database Service
 * ============================================================
 *
 * This file provides generic CRUD operations for all database
 * tables. React components should NEVER call:
 *
 *      supabase.from(...)
 *
 * directly.
 *
 * If additional database functionality is needed during the
 * hackathon, extend this file instead of duplicating queries
 * throughout the project.
 * ============================================================
 */

function handleError(error, action) {
  if (error) {
    throw new Error(`Database Error (${action}): ${error.message}`);
  }
}

/**
 * Create a new record.
 *
 * @param {string} table
 * @param {object} data
 * @returns {Promise<object>}
 */
async function create(table, data) {
  const { data: result, error } = await supabase
    .from(table)
    .insert(data)
    .select()
    .single();

  handleError(error, `create in "${table}"`);

  return result;
}

/**
 * Get a single record by ID.
 *
 * @param {string} table
 * @param {string|number} id
 * @param {string} idColumn
 * @returns {Promise<object|null>}
 */
async function getById(table, id, idColumn = "id") {
  const { data, error } = await supabase
    .from(table)
    .select("*")
    .eq(idColumn, id)
    .maybeSingle();

  handleError(error, `get from "${table}"`);

  return data;
}

/**
 * Get all records.
 *
 * Optional:
 * {
 *   filters: {
 *      status: "active",
 *      role: "admin"
 *   }
 * }
 *
 * @param {string} table
 * @param {object} options
 * @returns {Promise<object[]>}
 */
async function list(table, options = {}) {
  const { filters = {} } = options;

  let query = supabase
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
 * Update a record.
 *
 * @param {string} table
 * @param {string|number} id
 * @param {object} updates
 * @param {string} idColumn
 * @returns {Promise<object>}
 */
async function update(table, id, updates, idColumn = "id") {
  const { data, error } = await supabase
    .from(table)
    .update(updates)
    .eq(idColumn, id)
    .select()
    .single();

  handleError(error, `update in "${table}"`);

  return data;
}

/**
 * Delete a record.
 *
 * @param {string} table
 * @param {string|number} id
 * @param {string} idColumn
 * @returns {Promise<boolean>}
 */
async function deleteRecord(table, id, idColumn = "id") {
  const { error } = await supabase
    .from(table)
    .delete()
    .eq(idColumn, id);

  handleError(error, `delete from "${table}"`);

  return true;
}

const database = {
  create,
  getById,
  list,
  update,
  deleteRecord,
};

export default database;