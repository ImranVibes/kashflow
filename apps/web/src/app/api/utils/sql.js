import { getDb } from './mongodb';

function normalizeQuery(strings, ...values) {
  if (typeof strings === 'string') {
    return { query: strings, params: values[0] || [] };
  }
  let query = '';
  const params = values;
  for (let i = 0; i < strings.length; i++) {
    query += strings[i];
    if (i < params.length) {
      query += `$${i + 1}`;
    }
  }
  return { query, params };
}

// Simple SQL query parser and MongoDB emulator
async function executeSql(queryStr, params) {
  const db = await getDb();
  
  // Clean up the query string
  const cleanQuery = queryStr.trim().replace(/\s+/g, ' ');

  // 1. Parse INSERT INTO
  if (cleanQuery.match(/^INSERT INTO/i)) {
    const insertMatch = cleanQuery.match(/INSERT INTO\s+(\w+)\s*\(([^)]+)\)\s*VALUES\s*\(([^)]+)\)/i);
    if (!insertMatch) throw new Error(`Unsupported INSERT query: ${cleanQuery}`);
    
    const table = insertMatch[1].toLowerCase();
    const fields = insertMatch[2].split(',').map(f => f.trim().replace(/['"`]/g, ''));
    const placeholders = insertMatch[3].split(',').map(p => p.trim());
    
    const doc = {};
    fields.forEach((field, index) => {
      const placeholder = placeholders[index];
      const paramMatch = placeholder.match(/\$(\d+)/);
      if (paramMatch) {
        const paramIdx = parseInt(paramMatch[1]) - 1;
        doc[field] = params[paramIdx];
      } else if (placeholder.toLowerCase() === 'now()' || placeholder.toLowerCase() === 'current_timestamp') {
        doc[field] = new Date();
      } else if (placeholder.toLowerCase() === 'null') {
        doc[field] = null;
      } else {
        doc[field] = placeholder.replace(/['"]/g, '');
      }
    });

    // Ensure we have a unique integer ID as standard in relational DBs this app expects
    if (!doc.id) {
      doc.id = Math.floor(Math.random() * 10000000) + 1;
    }
    doc.created_at = doc.created_at || new Date();
    doc.updated_at = doc.updated_at || new Date();

    const collection = db.collection(table);
    await collection.insertOne(doc);
    return [doc];
  }

  // 2. Parse UPDATE
  if (cleanQuery.match(/^UPDATE/i)) {
    const updateMatch = cleanQuery.match(/UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+?))?$/i);
    if (!updateMatch) throw new Error(`Unsupported UPDATE query: ${cleanQuery}`);

    const table = updateMatch[1].toLowerCase();
    const setClause = updateMatch[2];
    const whereClause = updateMatch[3] || '';

    // Parse SET values
    const setFields = {};
    const setPairs = setClause.split(/,(?![^(]*\))/);
    setPairs.forEach(pair => {
      const [field, valExpr] = pair.split('=').map(s => s.trim().replace(/['"`]/g, ''));
      const paramMatch = valExpr.match(/\$(\d+)/);
      if (paramMatch) {
        const paramIdx = parseInt(paramMatch[1]) - 1;
        setFields[field] = params[paramIdx];
      } else if (valExpr.toLowerCase() === 'now()') {
        setFields[field] = new Date();
      } else if (valExpr.toLowerCase() === 'null') {
        setFields[field] = null;
      } else {
        setFields[field] = valExpr.replace(/['"]/g, '');
      }
    });

    // Parse WHERE clause
    const filter = parseWhereClause(whereClause, params);
    const collection = db.collection(table);
    
    const originalDocs = await collection.find(filter).toArray();
    await collection.updateMany(filter, { $set: setFields });
    
    const updatedDocs = originalDocs.map(doc => ({
      ...doc,
      ...setFields,
    }));
    return updatedDocs;
  }

  // 3. Parse DELETE
  if (cleanQuery.match(/^DELETE/i)) {
    const deleteMatch = cleanQuery.match(/DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+?))?$/i);
    if (!deleteMatch) throw new Error(`Unsupported DELETE query: ${cleanQuery}`);

    const table = deleteMatch[1].toLowerCase();
    const whereClause = deleteMatch[2] || '';
    const filter = parseWhereClause(whereClause, params);
    
    const collection = db.collection(table);
    const results = await collection.find(filter).toArray();
    await collection.deleteMany(filter);
    return results;
  }

  // 4. Parse SELECT
  if (cleanQuery.match(/^SELECT/i)) {
    const fromMatch = cleanQuery.match(/FROM\s+(\w+)(?:\s+(\w+))?/i);
    if (!fromMatch) throw new Error(`Unsupported SELECT query: ${cleanQuery}`);
    
    const table = fromMatch[1].toLowerCase();
    
    // Extract WHERE clause
    const whereMatch = cleanQuery.match(/WHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+LIMIT|\s+GROUP\s+BY|$)/i);
    const whereClause = whereMatch ? whereMatch[1] : '';
    const filter = parseWhereClause(whereClause, params);

    const collection = db.collection(table);
    let queryBuilder = collection.find(filter);

    // Sort/Order By
    const orderMatch = cleanQuery.match(/ORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s+OFFSET|$)/i);
    if (orderMatch) {
      const sortFields = orderMatch[1].split(',').map(s => s.trim());
      const sortObj = {};
      sortFields.forEach(fieldExpr => {
        const parts = fieldExpr.split(/\s+/);
        let fieldName = parts[0].replace(/^\w+\./, ''); // remove table prefix
        const direction = parts[1] && parts[1].toLowerCase() === 'desc' ? -1 : 1;
        sortObj[fieldName] = direction;
      });
      queryBuilder = queryBuilder.sort(sortObj);
    }

    // Limit and Offset
    const limitMatch = cleanQuery.match(/LIMIT\s+(\S+)/i);
    if (limitMatch) {
      const limitVal = limitMatch[1];
      const paramMatch = limitVal.match(/\$(\d+)/);
      const limit = paramMatch ? params[parseInt(paramMatch[1]) - 1] : parseInt(limitVal);
      if (typeof limit === 'number' && limit > 0) {
        queryBuilder = queryBuilder.limit(limit);
      }
    }

    const offsetMatch = cleanQuery.match(/OFFSET\s+(\S+)/i);
    if (offsetMatch) {
      const offsetVal = offsetMatch[1];
      const paramMatch = offsetVal.match(/\$(\d+)/);
      const offset = paramMatch ? params[parseInt(paramMatch[1]) - 1] : parseInt(offsetVal);
      if (typeof offset === 'number' && offset > 0) {
        queryBuilder = queryBuilder.skip(offset);
      }
    }

    let results = await queryBuilder.toArray();

    // Emulate JOIN category to make sure transactions and budgets display categories perfectly!
    if (cleanQuery.match(/LEFT\s+JOIN\s+categories/i)) {
      const categoryCollection = db.collection('categories');
      const allCategories = await categoryCollection.find().toArray();
      const catMap = new Map(allCategories.map(c => [c.id, c]));

      results = results.map(doc => {
        const categoryId = doc.category_id;
        const category = catMap.get(categoryId) || catMap.get(parseInt(categoryId));
        if (category) {
          return {
            ...doc,
            category_name: category.name,
            category_icon: category.icon,
            category_color: category.color,
            category_type: category.category_type || category.type,
          };
        }
        return doc;
      });
    }

    return results;
  }

  throw new Error(`Unsupported SQL query: ${cleanQuery}`);
}

function parseWhereClause(whereStr, params) {
  if (!whereStr || whereStr.trim() === '1=1' || whereStr.trim() === '1 = 1') return {};
  
  const filter = {};
  
  // Split AND conditions (simple regex assuming no complicated expressions)
  const conditions = whereStr.split(/\s+AND\s+/i);
  
  conditions.forEach(cond => {
    const trimmed = cond.trim();
    if (!trimmed || trimmed === '1=1') return;

    // 1. IS NULL condition
    const isNullMatch = trimmed.match(/^(\w+\.)?(\w+)\s+IS\s+NULL$/i);
    if (isNullMatch) {
      const field = isNullMatch[2];
      filter[field] = null;
      return;
    }

    // 2. IS NOT NULL condition
    const isNotNullMatch = trimmed.match(/^(\w+\.)?(\w+)\s+IS\s+NOT\s+NULL$/i);
    if (isNotNullMatch) {
      const field = isNotNullMatch[2];
      filter[field] = { $ne: null };
      return;
    }

    // 3. Comparison operators (=, <, >, <=, >=, !=, LIKE)
    const operatorMatch = trimmed.match(/^(\w+\.)?(\w+)\s*(=|<|>|<=|>=|!=|LIKE)\s*(\S+)$/i);
    if (operatorMatch) {
      const field = operatorMatch[2];
      const op = operatorMatch[3].toUpperCase();
      const valExpr = operatorMatch[4];
      
      let value;
      const paramMatch = valExpr.match(/\$(\d+)/);
      if (paramMatch) {
        value = params[parseInt(paramMatch[1]) - 1];
      } else {
        value = valExpr.replace(/['"]/g, '');
      }

      if (op === '=') {
        filter[field] = value;
      } else if (op === '<') {
        filter[field] = { $lt: value };
      } else if (op === '>') {
        filter[field] = { $gt: value };
      } else if (op === '<=') {
        filter[field] = { $lte: value };
      } else if (op === '>=') {
        filter[field] = { $gte: value };
      } else if (op === '!=') {
        filter[field] = { $ne: value };
      } else if (op === 'LIKE') {
        // Map SQL LIKE to MongoDB RegExp
        const regexStr = value.replace(/%/g, '.*');
        filter[field] = { $regex: new RegExp(`^${regexStr}$`, 'i') };
      }
    }
  });

  return filter;
}

export default async function sql(strings, ...values) {
  const { query, params } = normalizeQuery(strings, ...values);
  return executeSql(query, params);
}