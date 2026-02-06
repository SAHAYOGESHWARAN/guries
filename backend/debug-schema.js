const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, 'database', 'schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf-8');

const allStatements = schema
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--') && !stmt.startsWith('PRAGMA'));

console.log('Total statements:', allStatements.length);
console.log('\nFirst 10 statements:');
allStatements.slice(0, 10).forEach((stmt, i) => {
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    console.log(`${i + 1}. ${preview}...`);
});

console.log('\nStatements containing CREATE TABLE:');
const tableStmts = allStatements.filter(stmt => stmt.toUpperCase().includes('CREATE TABLE'));
console.log('Count:', tableStmts.length);
tableStmts.slice(0, 3).forEach((stmt, i) => {
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    console.log(`${i + 1}. ${preview}...`);
});

console.log('\nStatements containing CREATE INDEX:');
const indexStmts = allStatements.filter(stmt => stmt.toUpperCase().includes('CREATE INDEX'));
console.log('Count:', indexStmts.length);
indexStmts.slice(0, 3).forEach((stmt, i) => {
    const preview = stmt.substring(0, 80).replace(/\n/g, ' ');
    console.log(`${i + 1}. ${preview}...`);
});
