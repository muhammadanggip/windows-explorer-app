import mysql from 'mysql2/promise';

async function testConnection() {
  try {
    console.log('Testing database connection...');
    
    const connection = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'windows_explorer'
    });
    
    console.log('✅ Database connected successfully!');
    
    const [rows] = await connection.execute('SELECT COUNT(*) as count FROM folders');
    console.log('✅ Query successful:', rows[0].count, 'folders found');
    
    await connection.end();
    console.log('✅ Connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
  }
}

testConnection();
