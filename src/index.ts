import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { migrateUsers } from './user';
import { migrateCompanies } from './company';
import { migratePaymethods } from './paymethods';
import { migrateProduct } from './products';
import readline from "readline"

// Carregar variáveis de ambiente
dotenv.config();

// Configurações dos bancos de dados
const OLD_DB_URI = process.env.OLD_DB_URI || 'mongodb://localhost:27017/old_tanamao';
const NEW_DB_URI = process.env.NEW_DB_URI || 'mongodb://localhost:27017/new_tanamao';


async function migrate() {
  console.log('🚀 Iniciando migração completa...');

  const oldConnection = await mongoose.createConnection(OLD_DB_URI);
  const newConnection = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default'});

  try {
    // Migrar usuários
    await migrateUsers(oldConnection, newConnection);
    
    // Migrar empresas
    await migrateCompanies(oldConnection, newConnection);
    
    console.log('🎉 Migração completa finalizada!');
  } finally {
    // Fechar conexões
    await oldConnection.close();
    await newConnection.close();
  }
}

// Função para verificar conectividade dos bancos
async function checkConnections() {
  console.log('🔍 Verificando conectividade dos bancos de dados...');
  
  try {
    // Testar conexão com banco antigo
    const oldConn = await mongoose.createConnection(OLD_DB_URI);
    console.log('✅ Conexão com banco antigo: OK');
    await oldConn.close();

    // Testar conexão com banco novo
    const newConn = await mongoose.createConnection(NEW_DB_URI);
    console.log('✅ Conexão com banco novo: OK');
    await newConn.close();

    return true;
  } catch (error) {
    console.error('❌ Erro de conectividade:', error);
    return false;
  }
}

// Função para exibir estatísticas dos bancos
async function showStats() {
  console.log('\n📊 Estatísticas dos bancos de dados:');
  
  try {
    // Estatísticas do banco antigo
    const oldConn = await mongoose.createConnection(OLD_DB_URI);
    
    if (oldConn.db) {
      const usersCount = await oldConn.db.collection('users').countDocuments();
      const companiesCount = await oldConn.db.collection('companies').countDocuments();
      
      console.log(`📋 Usuários no banco antigo: ${usersCount}`);
      console.log(`🏢 Empresas no banco antigo: ${companiesCount}`);
    }
    await oldConn.close();

    // Estatísticas do banco novo
    const newConn = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default'});
    
    if (newConn.db) {
      const newUsersCount = await newConn.db.collection('users').countDocuments();
      const newCompaniesCount = await newConn.db.collection('companies').countDocuments();
      
      console.log(`📋 Usuários no banco novo: ${newUsersCount}`);
      console.log(`🏢 Empresas no banco novo: ${newCompaniesCount}`);
    }
    await newConn.close();

  } catch (error) {
    console.error('❌ Erro ao obter estatísticas:', error);
  }
}

// Função principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'migrate';

  switch (command) {
    case 'check':
      await checkConnections();
      break;
    case 'stats':
      await showStats();
      break;
    case 'migrate':
      const connectionsOk = await checkConnections();
      if (connectionsOk) {
        await showStats();
        await migrate();
      }
      break;
    case 'migrate-users':
      const connectionsOk1 = await checkConnections();
      if (connectionsOk1) {
        const oldConn = await mongoose.createConnection(OLD_DB_URI);
        const newConn = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default'});
        try {
          await migrateUsers(oldConn, newConn);
        } finally {
          await oldConn.close();
          await newConn.close();
        }
      }
      break;
    case 'migrate-companies':
      const connectionsOk2 = await checkConnections();
      if (connectionsOk2) {
        const oldConn = await mongoose.createConnection(OLD_DB_URI);
        const newConn = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default'});
        try {
          await migrateCompanies(oldConn, newConn);
        } finally {
          await oldConn.close();
          await newConn.close();
        }
      }
      break;
    case 'migrate-paymethods':
      const connectionsOk3 = await checkConnections();
      if (connectionsOk3) {
        const oldConn = await mongoose.createConnection(OLD_DB_URI);
        const newConn = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default'});
        try {
          await migratePaymethods(oldConn, newConn);
        } finally {
          await oldConn.close();
          await newConn.close();
        }
      }
      break;
    case 'migrate-products':
      let companyUri = process.argv[3];

      if (!companyUri) {
        console.error('❌ URI da empresa não fornecido.');
        // Asks to provide it
        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        companyUri = await new Promise<string>((resolve) => {
          rl.question('Por favor, informe a URI da empresa: ', (answer) => {
            rl.close();
            resolve(answer.trim());
          });
        });
        if (!companyUri) {
          console.error('❌ URI da empresa não fornecida. Abortando.');
          process.exit(1);
        }
      }

      const connectionsOk4 = await checkConnections();
      if (connectionsOk4) {
        const oldConn = await mongoose.createConnection(OLD_DB_URI);
        const newConn = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default'});
        try {
          await migrateProduct(oldConn, newConn, companyUri);
        } finally {
          await oldConn.close();
          await newConn.close();
        }
      }
    break;
    default:
      console.log('📖 Comandos disponíveis:');
      console.log('  npm run start check            - Verificar conectividade');
      console.log('  npm run start stats            - Mostrar estatísticas');
      console.log('  npm run start migrate          - Executar migração completa (users + companies)');
      console.log('  npm run start migrate-users    - Migrar apenas usuários');
      console.log('  npm run start migrate-companies - Migrar apenas empresas');
      console.log('  npm run start migrate-paymethods - Migrar apenas formas de pagamento');
      console.log('  npm run start migrate-products - Migrar apenas produtos');
    break;
  }
}

// Executar script
if (require.main === module) {
  main().catch(console.error);
}