/**
 * Script de Teste - Migração de Empresas
 * 
 * Execute este script para testar a migração antes de executar em produção
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const OLD_DB_URI = process.env.OLD_DB_URI || 'mongodb://localhost:27017/old_tanamao';
const NEW_DB_URI = process.env.NEW_DB_URI || 'mongodb://localhost:27017/new_tanamao';

async function validateMigration() {
  console.log('🔍 Iniciando validação da migração de empresas...');

  try {
    // Conectar aos bancos
    const oldConn = await mongoose.createConnection(OLD_DB_URI);
    const newConn = await mongoose.createConnection(NEW_DB_URI, { dbName: 'tanamao_default' });

    // Contar registros
    const oldCount = await oldConn.db?.collection('companies').countDocuments({ isactive: true }) || 0;
    const newCount = await newConn.db?.collection('companies').countDocuments() || 0;

    console.log(`📊 Empresas ativas no banco antigo: ${oldCount}`);
    console.log(`📊 Empresas no banco novo: ${newCount}`);

    // Buscar algumas amostras para validação
    const oldSample = await oldConn.db?.collection('companies').findOne({ isactive: true });
    const newSample = await newConn.db?.collection('companies').findOne();

    console.log('\n📋 Amostra do banco antigo:');
    console.log(JSON.stringify({
      _id: oldSample?._id,
      name: oldSample?.name,
      isvisible: oldSample?.isvisible,
      minvalue: oldSample?.minvalue,
      cnpj: oldSample?.cnpj
    }, null, 2));

    console.log('\n📋 Amostra do banco novo:');
    console.log(JSON.stringify({
      cpsId: newSample?.cpsId,
      name: newSample?.name,
      isVisible: newSample?.isVisible,
      minValue: newSample?.minValue,
      cnpj: newSample?.cnpj
    }, null, 2));

    // Validar campos críticos
    await validateCriticalFields(newConn);

    await oldConn.close();
    await newConn.close();

    console.log('\n✅ Validação concluída!');

  } catch (error) {
    console.error('❌ Erro durante validação:', error);
  }
}

async function validateCriticalFields(newConn: mongoose.Connection) {
  console.log('\n🔍 Validando campos críticos...');

  const companies = await newConn.db?.collection('companies').find({}).limit(10).toArray();

  if (!companies || companies.length === 0) {
    console.log('⚠️ Nenhuma empresa encontrada no banco novo');
    return;
  }

  const validations = [
    { field: 'name', required: true },
    { field: 'cnpj', required: true },
    { field: 'isVisible', required: true },
    { field: 'isActive', required: true },
    { field: 'minValue', required: true },
    { field: 'location', required: true },
    { field: 'createdAt', required: true },
    { field: 'updatedAt', required: true }
  ];

  for (const company of companies) {
    console.log(`\n📋 Validando empresa: ${company.name}`);
    
    for (const validation of validations) {
      const value = company[validation.field];
      if (validation.required && (value === undefined || value === null)) {
        console.log(`❌ Campo obrigatório ausente: ${validation.field}`);
      } else {
        console.log(`✅ ${validation.field}: ${typeof value === 'object' ? 'objeto' : value}`);
      }
    }
  }
}

// Função para testar transformação específica
async function testTransformation() {
  console.log('\n🧪 Testando transformação de dados...');

  const mockOldCompany = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Empresa Teste',
    isvisible: true,
    minvalue: 25.50,
    cnpj: '12.345.678/0001-90',
    urilogo: 'https://example.com/logo.png',
    businesscategoryid: ['60d5ec49f1b2c72b1c8b4567'],
    location: {
      address: 'Rua Teste, 123',
      utcoffset: '-03:00',
      geo: {
        type: 'Point',
        coordinates: [-23.550520, -46.633308]
      }
    },
    avgdelivery: 30,
    avglocal: 15,
    createdat: new Date('2023-01-01'),
    updatedat: new Date('2023-12-01')
  };

  console.log('📋 Dados originais:');
  console.log(JSON.stringify(mockOldCompany, null, 2));

  // Aplicar transformação (simulando a função do migration)
  const transformed = {
    cpsId: mockOldCompany._id,
    name: mockOldCompany.name,
    isVisible: mockOldCompany.isvisible,
    minValue: mockOldCompany.minvalue,
    cnpj: mockOldCompany.cnpj,
    urlLogo: mockOldCompany.urilogo,
    location: {
      address: mockOldCompany.location.address,
      timezone: 'America/Sao_Paulo', // Conversão do utcoffset
      center: mockOldCompany.location.geo
    },
    deliveryTime: mockOldCompany.avgdelivery,
    pickupTime: mockOldCompany.avglocal,
    createdAt: mockOldCompany.createdat,
    updatedAt: mockOldCompany.updatedat
  };

  console.log('\n📋 Dados transformados:');
  console.log(JSON.stringify(transformed, null, 2));
}

async function main() {
  const command = process.argv[2] || 'validate';

  switch (command) {
    case 'validate':
      await validateMigration();
      break;
    case 'transform':
      await testTransformation();
      break;
    default:
      console.log('📖 Comandos disponíveis:');
      console.log('  node test-migration.js validate   - Validar migração');
      console.log('  node test-migration.js transform  - Testar transformação');
  }
}

if (require.main === module) {
  main().catch(console.error);
}
