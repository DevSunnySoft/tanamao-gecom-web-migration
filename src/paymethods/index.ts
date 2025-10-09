import mongoose from 'mongoose';
import { IPaymethod } from './types/NewPaymethod';
import { OldPaymethod } from './types/OldPaymethod';

// Schemas para o banco antigo
const oldPaymethodSchema = new mongoose.Schema({
  description: { type: String, required: true },
  onlinecash: { type: Boolean, required: true },
  spotcash: { type: Boolean, required: true },
  code: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  version: { type: String, default:  '1.0.0' },
  createdat: { type: Date, default: Date.now },
  updatedat: { type: Date, default: Date.now },
  isactive: { type: Boolean, default: true }
}, { collection: 'paymethods' });

// Schema para o banco novo
const newPaymethodSchema = new mongoose.Schema({
  description: { type: String, required: true },
  isOnline: { type: Boolean, required: true },
  isLocal: { type: Boolean, required: true },
  code: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '2.0.0' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { collection: 'paymethods' });

// Função para transformar dados do modelo antigo para o novo
function transformPaymethod(oldPaymethod: OldPaymethod): Partial<IPaymethod> {
  const newPaymethod: Partial<IPaymethod> = {
    _id: oldPaymethod._id,
    description: oldPaymethod.description,
    isOnline: oldPaymethod.onlinecash,
    isLocal: oldPaymethod.spotcash,
    code: oldPaymethod.code as any,
    isActive: oldPaymethod.isactive,
    version: oldPaymethod.version,
    createdAt: oldPaymethod.createdat,
    updatedAt: oldPaymethod.updatedat
  };

  return newPaymethod;
}

// Função principal de migração
export async function migratePaymethods(oldConnection: mongoose.Connection, newConnection: mongoose.Connection) {
  console.log('🏢 Iniciando migração de formas de pagamento...');
  
  try {
    // Conectar ao banco antigo
    console.log('📡 Conectando ao banco de dados antigo...');
    
    const OldPaymethodModel = oldConnection.model('Paymethod', oldPaymethodSchema);

    // Conectar ao banco novo
    console.log('📡 Conectando ao banco de dados novo...');
    const NewPaymethodModel = newConnection.model('Paymethod', newPaymethodSchema);

    // Buscar todas as formas de pagamento do banco antigo
    console.log('📋 Buscando formas de pagamento do banco antigo...');
    const oldData = await OldPaymethodModel.find({}).lean();
    console.log(`📊 Encontradas ${oldData.length} formas de pagamento para migrar`);

    let migratedCount = 0;
    let errorCount = 0;
    const batchSize = 50; // Menor batch size para formas de pagamento

    // Processar em lotes
    for (let i = 0; i < oldData.length; i += batchSize) {
      const batch = oldData.slice(i, i + batchSize);
      console.log(`⚙️ Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldData.length / batchSize)}...`);

      for (const oldData of batch) {
        try {
          // Verificar se a empresa já existe no banco novo
          const existingPaymethod = await NewPaymethodModel.findOne({ 
            $or: [
              { cpsId: oldData.code }
            ]
          });
          
          if (existingPaymethod) {
            console.log(`⚠️ O método de pagamento ${oldData.description} (${oldData.code}) já existe no banco novo. Pulando...`);
            continue;
          }

          // Transformar e salvar o método de pagamento
          const transformedData = transformPaymethod(oldData);
          const newPaymethod = new NewPaymethodModel(transformedData);
          await newPaymethod.save();
          
          migratedCount++;
          
          if (migratedCount % 25 === 0) {
            console.log(`✅ ${migratedCount} formas de pagamento migradas...`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Erro ao migrar método de pagamento ${oldData.description} (${oldData.code}):`, error);
        }
      }
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`✅ formas de pagamento migradas com sucesso: ${migratedCount}`);
    console.log(`❌ Erros durante a migração: ${errorCount}`);
    console.log(`📝 Total de formas de pagamento processadas: ${oldData.length}`);

    console.log('🎉 Migração de formas de pagamento concluída!');
    
    return {
      migratedCount,
      errorCount,
      totalProcessed: oldData.length
    };
  } catch (error) {
    console.error('💥 Erro fatal durante a migração de formas de pagamento:', error);
    throw error;
  }
}
