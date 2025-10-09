/**
 * Script de Validação Rápida - Migração de Empresas
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';

dotenv.config();

const NEW_DB_URI = process.env.NEW_DB_URI || 'mongodb://localhost:27017/new_tanamao';

async function validateMigration() {
  console.log('🔍 Validando resultados da migração...');

  try {
    // Conectar ao banco novo
    const newConn = await mongoose.connect(NEW_DB_URI);
    console.log('✅ Conectado ao banco novo');

    if (!newConn.connection.db) {
      throw new Error('Falha ao conectar com o banco de dados');
    }

    const db = newConn.connection.db;

    // Verificar empresas
    const companies = await db.collection('companies').find({}).limit(5).toArray();
    console.log(`📊 Total de empresas encontradas: ${companies.length}`);

    if (companies.length > 0) {
      console.log('\n📋 Exemplo de empresa migrada:');
      const company = companies[0];
      console.log(JSON.stringify({
        _id: company._id,
        cpsId: company.cpsId,
        name: company.name,
        isVisible: company.isVisible,
        phone: company.phone,
        email: company.email,
        city: company.address?.city,
        state: company.address?.state
      }, null, 2));
    }

    // Verificar delivery areas
    const deliveryAreas = await db.collection('deliveryareas').find({}).limit(5).toArray();
    console.log(`\n📍 Total de delivery areas encontradas: ${deliveryAreas.length}`);

    if (deliveryAreas.length > 0) {
      console.log('\n📋 Exemplo de delivery area:');
      const area = deliveryAreas[0];
      console.log(JSON.stringify({
        _id: area._id,
        companyId: area.companyId,
        name: area.name,
        areaType: area.areaType,
        priority: area.priority,
        hasGeometry: !!area.geometry,
        centerCoords: area.geometry?.center?.coordinates,
        polygonPoints: area.geometry?.polygon?.coordinates?.length || 0
      }, null, 2));
    }

    // Verificar estatísticas
    const companiesCount = await db.collection('companies').countDocuments();
    const deliveryAreasCount = await db.collection('deliveryareas').countDocuments();
    
    console.log('\n📈 Estatísticas finais:');
    console.log(`   📊 Empresas: ${companiesCount}`);
    console.log(`   📍 Delivery Areas: ${deliveryAreasCount}`);

    // Verificar distribuição por cidades
    const citiesStats = await db.collection('deliveryareas').aggregate([
      {
        $group: {
          _id: { $regex: /^(.+)\s-\s[A-Z]{2}$/ },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]).toArray();

    console.log('\n🏙️ Top cidades com mais empresas:');
    for (const stat of citiesStats) {
      console.log(`   ${stat._id}: ${stat.count} empresas`);
    }

    await newConn.disconnect();
    console.log('\n✅ Validação concluída com sucesso!');

  } catch (error) {
    console.error('❌ Erro durante a validação:', error);
  }
}

validateMigration();
