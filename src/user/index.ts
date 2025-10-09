import type { OldUser, ICity, TMethod } from './types/OldUser';
import type { IUser } from './types/NewUser';
import mongoose from 'mongoose';

// Schemas para o banco antigo
const oldUserSchema = new mongoose.Schema({
  _id: String,
  companyid: String,
  customerid: String,
  sunnyid: Number,
  name: String,
  username: String,
  password: String,
  isactive: Boolean,
  isadmin: Boolean,
  isconfirmed: Boolean,
  method: String,
  photourl: String,
  updatedat: Date,
  createdat: Date,
  version: String,
  cpf: String,
  istemporary: Boolean,
  phone: String,
  expireat: Date,
  dashboardpushsubscription: {
    endpoint: String,
    expirationTime: Date,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  pushsubscription: [{
    endpoint: String,
    expirationTime: Date,
    keys: {
      p256dh: String,
      auth: String
    }
  }],
  addresses: [{
    street: String,
    number: String,
    reference: String,
    complement: String,
    city: {
      _id: String,
      cityid: Number,
      ibgeid: String,
      name: String,
      uf: String,
      countryid: Number,
      utcoffset: Number
    },
    zipcode: String,
    neighborhood: String
  }]
}, { collection: 'users' });

// Schema para o banco novo
const newUserSchema = new mongoose.Schema({
  companyId: String,
  pdvId: String,
  name: String,
  username: String,
  password: String,
  isActive: Boolean,
  isAdmin: Boolean,
  isConfirmed: Boolean,
  photoUrl: String,
  cpf: String,
  isTemporary: Boolean,
  phone: String,
  expireAt: Date,
  sendWsNotification: Boolean,
  dashboardPushSubscription: {
    endpoint: String,
    expirationTime: Date,
    keys: {
      p256dh: String,
      auth: String
    }
  },
  pushSubscription: [{
    endpoint: String,
    expirationTime: Date,
    keys: {
      p256dh: String,
      auth: String
    }
  }],
  addresses: [{
    street: String,
    number: String,
    reference: String,
    complement: String,
    city: mongoose.Schema.Types.Mixed,
    zipCode: String,
    neighborhood: String
  }],
  createdAt: Date,
  updatedAt: Date,
  version: String,
  privacySettings: {
    allowDataCollection: Boolean,
    allowMarketingEmails: Boolean,
    allowLocationTracking: Boolean,
    dataRetentionPeriod: Number,
    consentGivenAt: Date,
    consentUpdatedAt: Date
  },
  dataUsageLog: [{
    action: String,
    timestamp: Date,
    purpose: String,
    legalBasis: String,
    ipAddress: String
  }],
  lgpdConsent: {
    hasGivenConsent: Boolean,
    consentDate: Date,
    consentVersion: String,
    ipAddress: String,
    userAgent: String
  }
}, { collection: 'users' });


// Função para transformar dados do modelo antigo para o novo
function transformUser(oldUser: any): Partial<IUser> {
  const newUser: Partial<IUser> = {
    companyId: oldUser.companyid,
    pdvId: oldUser.customerid,
    name: oldUser.name,
    username: oldUser.username,
    password: oldUser.password,
    isActive: oldUser.isactive,
    isAdmin: oldUser.isadmin,
    isConfirmed: oldUser.isconfirmed,
    photoUrl: oldUser.photourl,
    cpf: oldUser.cpf,
    isTemporary: oldUser.istemporary,
    phone: oldUser.phone,
    expireAt: oldUser.expireat,
    sendWsNotification: true, // valor padrão
    dashboardPushSubscription: oldUser.dashboardpushsubscription,
    pushSubscription: oldUser.pushsubscription,
    createdAt: oldUser.createdat || new Date(),
    updatedAt: oldUser.updatedat || new Date(),
    version: oldUser.version || '1.0.0'
  };

  // Transformar endereços (zipcode -> zipCode)
  if (oldUser.addresses && Array.isArray(oldUser.addresses)) {
    newUser.addresses = oldUser.addresses.map((addr: any) => ({
      ...addr,
      zipCode: addr.zipcode // renomear campo
    }));
  }

  // Adicionar configurações padrão de LGPD
  newUser.privacySettings = {
    allowDataCollection: true,
    allowMarketingEmails: false,
    allowLocationTracking: false,
    dataRetentionPeriod: 365,
    consentGivenAt: oldUser.createdat || new Date(),
    consentUpdatedAt: oldUser.createdAt || new Date()
  };

  newUser.lgpdConsent = {
    hasGivenConsent: true,
    consentDate: new Date(),
    consentVersion: '1.0',
    ipAddress: '127.0.0.1',
    userAgent: 'Migration Script'
  };

  return newUser;
}

// Função principal de migração
export async function migrateUsers(oldConnection: mongoose.Connection, newConnection: mongoose.Connection) {
  console.log('🚀 Iniciando migração de usuários...');
  
  try {
    // Conectar ao banco antigo
    console.log('📡 Conectando ao banco de dados antigo...');
    
    const OldUserModel = oldConnection.model('User', oldUserSchema);

    // Conectar ao banco novo
    console.log('📡 Conectando ao banco de dados novo...');
    const NewUserModel = newConnection.model('User', newUserSchema);

    // Buscar todos os usuários do banco antigo
    console.log('📋 Buscando usuários do banco antigo...');
    const oldUsers = await OldUserModel.find({
      istemporary: false,
      updatedat: {
        $gte: new Date("2023-06-01T03:00:00.000Z")
      }
    }).lean();
    console.log(`📊 Encontrados ${oldUsers.length} usuários para migrar`);

    let migratedCount = 0;
    let errorCount = 0;
    const batchSize = 100;

    // Processar em lotes
    for (let i = 0; i < oldUsers.length; i += batchSize) {
      const batch = oldUsers.slice(i, i + batchSize);
      console.log(`⚙️ Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldUsers.length / batchSize)}...`);

      for (const oldUser of batch) {
        try {
          // Verificar se o usuário já existe no banco novo
          const existingUser = await NewUserModel.findOne({ username: oldUser.username });
          
          if (existingUser) {
            console.log(`⚠️ Usuário ${oldUser.username} já existe no banco novo. Pulando...`);
            continue;
          }

          // Transformar e salvar o usuário
          const transformedUser = transformUser(oldUser);
          const newUser = new NewUserModel(transformedUser);
          await newUser.save();
          
          migratedCount++;
          
          if (migratedCount % 50 === 0) {
            console.log(`✅ ${migratedCount} usuários migrados...`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Erro ao migrar usuário ${oldUser.username}:`, error);
        }
      }
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`✅ Usuários migrados com sucesso: ${migratedCount}`);
    console.log(`❌ Erros durante a migração: ${errorCount}`);
    console.log(`📝 Total de usuários processados: ${oldUsers.length}`);

    // Fechar conexões
    await oldConnection.close();
    await newConnection.close();
    
    console.log('🎉 Migração concluída!');
  } catch (error) {
    console.error('💥 Erro fatal durante a migração:', error);
    process.exit(1);
  }
}