import mongoose, { ObjectId, Schema, Types } from "mongoose";
import { OldProduct, OldProductAdditional, OldProductComponent, OldProductType } from "./types/OldProduct";
import { ICatalogShortcut, ICategory, IProduct, IProductComplement, IProductComplementItem, IProductVariation, IProductVariationOption, ProductType } from "./types/NewProduct";

const oldProductAdditionalSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  settingsid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'ProductSettings'
  },
  additionalid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  additionaltype: {
    type: String,
    enum: ['B', 'Q', 'N'],
    required: true
  },
  maxqtd: {
    type: Number,
    required: true
  },
  createdat: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedat: {
    type: Date
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  }
});

const oldProductComponentSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  settingsid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  qtdselection: {
    type: Number,
    required: true
  },
  selected: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  idx: {
    type: Number,
    required: true
  },
  action: {
    type: String,
    enum: ['N', 'R', 'A', 'C'],
    required: true
  },
  data: [{
    componentid: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Product' },
    qtd: { type: Number, required: true },
    isdefault: { type: Boolean, required: true },
    isvisible: { type: Boolean, required: true },
    iseditable: { type: Boolean, required: true },
    product: { type: Schema.Types.Mixed }
  }],
  createdat: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedat: {
    type: Date
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  }
});

const OldProductSettingsSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  companyid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  productid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Product'
  },
  specifications: {
    type: String
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  createdat: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedat: {
    type: Date
  },
  minqtd: {
    type: Number,
    required: true,
    default: 1
  },
  obs: [{
    name: { type: String, required: true },
    group: { type: String, required: true },
    data: [{ type: String, required: true }]
  }]
}, { collection: 'productsettings' });

const OldCategorySchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  companyid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sunnyid: {
    type: Number,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  qtdselection: {
    type: Number,
    required: true
  },
  qtdselchargehigher: {
    type: Number,
    required: true
  },
  categorytype: {
    type: String,
    enum: ['D', 'F', ''],
    required: true
  },
  parentcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  createdat: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedat: {
    type: Date
  },
  uriicon: {
    type: String
  },
  isvisible: {
    type: Boolean,
    required: true
  },
  catalogindex: {
    type: Number,
    required: true
  },
  isdeliveryactive: {
    type: Boolean,
    required: true
  },
  islocalactive: {
    type: Boolean,
    required: true
  },
  idx: {
    type: Number,
    required: true
  }
}, { collection: 'categories' });

const oldProductSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  categoryid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Category'
  },
  companyid: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  sunnyid: {
    type: Number,
    required: true
  },
  product: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  barcode: {
    type: String,
    required: true
  },
  measure: {
    type: String,
    enum: ['UN', 'KG', 'LT'],
    required: true
  },
  isactive: {
    type: Boolean,
    required: true
  },
  producttype: {
    type: String,
    enum: ['N', 'C', 'A', 'I'],
    required: true
  },
  prices: {
    cashpayment: { type: Number, required: true },
    defpayment: { type: Number }
  },
  supplymanagement: {
    type: Boolean,
    required: true
  },
  stock: {
    type: Number,
    required: true
  },
  images: {
    type: [String],
    required: true,
    default: []
  },
  wildcards: {
    type: [String],
    required: true,
    default: []
  },
  createdat: {
    type: Date,
    required: true,
    default: Date.now
  },
  updatedat: {
    type: Date
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  isavailable: {
    type: Boolean,
    required: true
  },
  isdeliveryactive: {
    type: Boolean,
    required: true
  },
  islocalactive: {
    type: Boolean,
    required: true
  },
  productsettingsid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ProductSettings'
  }
}, { collection: 'products' });

const ProductVariationOptionSchema = new Schema<IProductVariationOption>({
  name: String,
  price: Number,
  pdvId: String,
  variationItemPdvId: String,
  qtdSelection: Number,
  qtdSelectionChargeHigher: Number
}, { _id: false });

const ProductVariationSchema = new Schema<IProductVariation>({
  pdvId: String,
  name: String,
  options: [ProductVariationOptionSchema],
}, { _id: false });

const ProductComplementItemSchema = new Schema<IProductComplementItem>({
  pdvId: String,
  product: String,
  description: String,
  barCode: String,
  variations: ProductVariationSchema,
  price: Number,
  thumbnails: [String],
  modifiers: Schema.Types.Mixed,
  isSelected: Boolean,
}, { _id: false });

const ProductComplementSchema = new Schema<IProductComplement>({
  pdvId: String,
  name: String,
  qtdSelection: Number,
  isRequired: Boolean,
  groupId: String,
  items: [ProductComplementItemSchema],
}, { _id: false });

const newProductSchema = new mongoose.Schema({
  categoriesIds: [{ type: Schema.Types.ObjectId, ref: 'Category', required: true }],
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  pdvId: { type: String, required: true },
  product: { type: String, required: true },
  description: { type: String, required: false, default: '' },
  barCode: { type: String, required: true },
  measure: { type: String, enum: ['UN', 'KG', 'LT'], required: true },
  isActive: { type: Boolean, default: true },
  variations: ProductVariationSchema,
  supplyManagement: { type: Boolean, default: false },
  images: [String],
  thumbnails: [String],
  wildcards: [String],
  isAvailable: { type: Boolean, default: true },
  isDeliveryActive: { type: Boolean, default: true },
  isLocalActive: { type: Boolean, default: true },
  catalogIndex: Number,
  productType: { type: Number, enum: ProductType, required: true },
  maxQtd: { type: Number, required: true },
  ifoodId: String,
  complements: [ProductComplementSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  version: { type: String, default: '2.0.0' },
})

const CategorySchema = new Schema<ICategory>({
  companyId: { type: Schema.Types.ObjectId, required: true, ref: 'Company' },
  pdvId: { type: String },
  name: { type: String, required: true },
  index: { type: Number, required: true },
  urlIcon: { type: String },
  isVisible: { type: Boolean, default: true },
  catalogIndex: { type: Number },
  isDeliveryActive: { type: Boolean, default: true },
  isLocalActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const CatalogShortcutSchema = new Schema<ICatalogShortcut>({
  companyId: { type: Schema.Types.ObjectId, ref: 'Company', required: true },
  productId: { type: Schema.Types.ObjectId, ref: 'Product' },
  name: { type: String, required: true },
  photo: { type: String, required: false },
  description: { type: String, required: false, default: '' },
  prices: { type: [Number], required: true },
  productType: { type: Number, enum: ProductType, required: true },
  isActive: { type: Boolean, default: true },
  isAvailable: { type: Boolean, default: true },
  isDeliveryActive: { type: Boolean, default: true },
  isLocalActive: { type: Boolean, default: true },
  categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  variationId: String,
  variationItemsPdvId: [String],
  wildcards: [String]
}, { timestamps: true });

const transformProductType = (oldProduct: any): ProductType => {
  if (oldProduct.categoryid.qtdselection > 1) {
    // Check if exists pizza in the category name (ignore case)
    if (
      oldProduct.categoryid.name.search(/pizza/i) >= 0
      || (oldProduct.categoryid.parentcategory && oldProduct.categoryid.parentcategory.name.search(/pizza/i) >= 0)
    ) {
      return ProductType.PIZZA;
    }
    
    return ProductType.VARIATION;
  }

  if (oldProduct.isAdditional)
    return ProductType.ADDITIONAL;

  if (oldProduct.isComponent)
    return ProductType.INGREDIENT;

  switch (oldProduct.producttype) {
    case 'N':
      return ProductType.NORMAL;
    case 'C':
      return ProductType.NORMAL;
    case 'A':
      return ProductType.ADDITIONAL;
    case 'I':
      return ProductType.INGREDIENT;
    default:
      throw new Error(`Unknown product type: ${oldProduct.producttype}`);
  }
}

function transformVariations(oldProduct: any, forcedVarItemId?: string): IProductVariation {
  if (oldProduct.categoryid.qtdselection > 1) {
    return {
      pdvId: `var-${forcedVarItemId || oldProduct.categoryid._id}`,
      name: oldProduct.categoryid.name,
      options: [
        {
          name: oldProduct.categoryid.name,
          price: oldProduct.prices.cashpayment,
          pdvId: 'opt-' + oldProduct.categoryid._id + '-' + oldProduct._id,
          variationItemPdvId: `varitem-${forcedVarItemId || oldProduct.categoryid._id}`,
          qtdSelection: oldProduct.categoryid.qtdselection,
          qtdSelectionChargeHigher: oldProduct.categoryid.qtdselchargehigher,
        }
      ]
    }
  }

  return {
    pdvId: `var-${forcedVarItemId || oldProduct.companyid}`,
    name: 'Padrão',
    options: [
      {
        name: 'Tamanho Único',
        price: oldProduct.prices.cashpayment,
        pdvId: `opt-${oldProduct.companyid}-${oldProduct._id}`,
        variationItemPdvId: `varitem-${forcedVarItemId || oldProduct.companyid}`,
        qtdSelection: 1,
        qtdSelectionChargeHigher: 1,
      }
    ]
  }
}

function transformComponentComplementItem(oldComponents: any[], oldCategoryId: string): IProductComplement[] {
  const selectableComponents = oldComponents.filter(c => c.action === 'C');
  return selectableComponents.map(component => ({
    pdvId: component._id,
    name: component.name,
    qtdSelection: component.qtdselection,
    isRequired: true,
    groupId: component._id,
    items: component.data.map((item: any, index: 1) => ({
      pdvId: index,
      product: item.componentid.product,
      description: item.componentid.description,
      barCode: item.componentid.barcode,
      variations: transformVariations(item.componentid, oldCategoryId),
      price: 0,
      thumbnails: item.componentid.images.map((image: string) => `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/100x100/${image}`),
      modifiers: [],
      isSelected: component.selected.includes(index)
    }))
  }));
}

function transformProductAdditionalItem(oldAdditionals: any[], companyId: string, oldCategoryId: string): IProductComplement[] {
  const normalAdditionals = oldAdditionals.filter(a => a.additionaltype === 'N' || a.additionaltype === 'Q');
  const borders = oldAdditionals.filter(a => a.additionaltype === 'B');

  let response: IProductComplement[] = [
    {
      pdvId: 'add-' + companyId,
      name: `Adicionais`,
      qtdSelection: normalAdditionals.length,
      isRequired: false,
      groupId: 'add-' + companyId,
      items: normalAdditionals.map((item: any, index) => ({
        pdvId: item._id,
        product: item.additionalid.product,
        description: item.additionalid.description,
        barCode: item.additionalid.barcode,
        variations: transformVariations(item.additionalid, oldCategoryId),
        price: 0,
        thumbnails: item.additionalid.images.map((image: string) => `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/100x100/${image}`),
        modifiers: [],
        isSelected: false
      }))
    }
  ];

  if (borders.length > 0) {
    response.push({
      pdvId: 'borders-' + companyId,
      name: `Bordas`,
      qtdSelection: 1,
      isRequired: false,
      groupId: 'borders-' + companyId,
      items: borders.map((item: any) => ({
        pdvId: item._id,
        product: item.additionalid.product,
        description: item.additionalid.description,
        barCode: item.additionalid.barcode,
        variations: transformVariations(item.additionalid, oldCategoryId),
        price: 0,
        thumbnails: item.additionalid.images.map((image: string) => `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/100x100/${image}`),
        modifiers: [],
        isSelected: false
      }))
    });
  }

  return response;
}

// Função para transformar dados do modelo antigo para o novo
function transformProduct(oldProduct: any, oldComponents: any[], oldAdditionals: any[]): Partial<any> { 
  const transformedCategory: ICategory | null = oldProduct.categoryid ? {
    companyId: oldProduct.categoryid.companyid,
    pdvId: oldProduct.categoryid.sunnyid,
    name: (oldProduct.categoryid.parentcategory ? `${oldProduct.categoryid.parentcategory.name} - ` : '') + oldProduct.categoryid.name,
    index: oldProduct.categoryid.idx,
    urlIcon: oldProduct.categoryid.uriicon,
    isVisible: oldProduct.categoryid.isvisible,
    catalogIndex: oldProduct.categoryid.catalogindex,
    isDeliveryActive: oldProduct.categoryid.isdeliveryactive,
    isLocalActive: oldProduct.categoryid.islocalactive,
    createdAt: oldProduct.categoryid.createdat,
    updatedAt: oldProduct.categoryid.updatedat,
    _id: oldProduct.categoryid._id
  } : null;

  const transformedProduct: Partial<IProduct> = {
    _id: oldProduct._id,
    categoriesIds: [oldProduct.categoryid._id],
    companyId: oldProduct.companyid,
    pdvId: (oldProduct.sunnyid || oldProduct.barcode).toString(),
    product: oldProduct.product,
    description: oldProduct.description,
    barCode: oldProduct.barcode,
    measure: oldProduct.measure as 'UN' | 'KG' | 'LT',
    variations: transformVariations(oldProduct),
    isActive: oldProduct.isactive,
    supplyManagement: oldProduct.supplymanagement,
    images: oldProduct.images.map((image: string) => `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/380x380/${image}`),
    thumbnails: oldProduct.images.map((image: string) => `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/100x100/${image}`), // Assuming thumbnails are same as images in old model
    wildcards: oldProduct.wildcards,
    isAvailable: oldProduct.isavailable,
    isDeliveryActive: oldProduct.isdeliveryactive,
    isLocalActive: oldProduct.islocalactive,
    productType: transformProductType(oldProduct),
    maxQtd: 100, // Default value, as old model doesn't have this field]
    updatedAt: oldProduct.updatedat,
    createdAt: oldProduct.createdat,
    catalogIndex: oldProduct.category?.catalogindex,
    version: '2.0.0'
  };

  let transformedComplements: IProductComplement[] = [];
  
  transformedComplements.push(...transformComponentComplementItem(oldComponents, oldProduct.categoryid._id));
  transformedComplements.push(...transformProductAdditionalItem(oldAdditionals, oldProduct.companyid, oldProduct.categoryid._id));

  transformedProduct.complements = transformedComplements;
  return {
    transformedProduct, 
    transformedCategory
  };
}

const saveShortcut = async (newProduct: any, CatalogShortcutModel: mongoose.Model<ICatalogShortcut>) => {
  if (!newProduct.categoriesIds || newProduct.categoriesIds.length === 0) {
    console.warn(`Produto ${newProduct.product} (${newProduct.pdvId}) não tem categorias associadas. Pulando criação de atalho.`);
    return;
  }
  for (const categoryId of newProduct.categoriesIds) {
    let existingShortcut = await CatalogShortcutModel.findOne({
      companyId: newProduct.companyId,
      productId: newProduct._id,
      categoryId: categoryId
    });

    if (existingShortcut) {
      console.log(`Atalho para o produto ${newProduct.product} (${newProduct.pdvId}) na categoria ${categoryId} já existe. Pulando criação.`);
      existingShortcut.name = newProduct.product;
      existingShortcut.photo = newProduct.thumbnails[0] || '';
      existingShortcut.description = newProduct.description;
      existingShortcut.prices = newProduct.variations.options.map((opt: any) => opt.price);
      existingShortcut.productType = newProduct.productType;
      existingShortcut.isActive = newProduct.isActive;
      existingShortcut.isAvailable = newProduct.isAvailable;
      existingShortcut.isDeliveryActive = newProduct.isDeliveryActive;
      existingShortcut.isLocalActive =  newProduct.isLocalActive;
      existingShortcut.variationId = newProduct.variations.pdvId;
    } else {
      existingShortcut = new CatalogShortcutModel({
        companyId: newProduct.companyId,
        productId: newProduct._id,
        categoryId: categoryId,
        variationItemsPdvId: newProduct.variations.options.map((opt: any) => opt.variationItemPdvId),
        name: newProduct.product,
        photo: newProduct.thumbnails[0] || '',
        description: newProduct.description,
        prices: newProduct.variations.options.map((opt: any) => opt.price),
        productType: newProduct.productType,
        isActive: newProduct.isActive,
        isAvailable: newProduct.isAvailable,
        isDeliveryActive: newProduct.isDeliveryActive,
        isLocalActive:  newProduct.isLocalActive,
        variationId: newProduct.variations.pdvId
      });
    }

    await existingShortcut.save();
  }
}

// Função principal de migração
export async function migrateProduct(oldConnection: mongoose.Connection, newConnection: mongoose.Connection, companyUri: string) {
  console.log('🏢 Iniciando migração de produtos...');
  
  try {
    // Conectar ao banco antigo
    console.log('📡 Conectando ao banco de dados antigo...');
    const OldProductSettingsModel = oldConnection.model('ProductsSettings', OldProductSettingsSchema, 'productssettings');
    const OldCategoryModel = oldConnection.model('Category', OldCategorySchema);
    const OldProductAdditionalModel = oldConnection.model('ProductsAdditional', oldProductAdditionalSchema, 'productsadditionals');
    const OldProductComponentModel = oldConnection.model('ProductsComponents', oldProductComponentSchema, 'productscomponents');
    const OldProductModel = oldConnection.model('Product', oldProductSchema);
    const oldCompanyModel = oldConnection.model('Company', new mongoose.Schema({}, { strict: false }), 'companies');

    let companyId: ObjectId;

    const company = await oldCompanyModel.findOne({ uri: companyUri }).lean();
    if (!company) {
      throw new Error(`Empresa com URI ${companyUri} não encontrada no banco antigo.`);
    }

    companyId = company._id as ObjectId;

    // Conectar ao banco novo
    console.log('📡 Conectando ao banco de dados novo...');
    const NewProductModel = newConnection.model('Product', newProductSchema);
    const newCategoryModel = newConnection.model('Category', CategorySchema);
    const CatalogShortcutModel = newConnection.model<ICatalogShortcut>('CatalogShortcut', CatalogShortcutSchema);
    

    // Buscar todas as produtos do banco antigo
    console.log('📋 Buscando produtos do banco antigo...');
    const oldData = await OldProductModel.find({ 
      companyid: companyId
    })
    .populate({
      path: 'categoryid',
      populate: { path: 'parentcategory', model: OldCategoryModel }
    })
    .lean();

    // Exclui produtos e atalhos existentes no banco novo para evitar duplicatas
    await NewProductModel.deleteMany({ companyId: companyId });
    await CatalogShortcutModel.deleteMany({ companyId: companyId });
    console.log('🗑️ Produtos e atalhos existentes no banco novo excluídos para evitar duplicatas.');

    if (oldData.length === 0) {
      console.log('⚠️ Nenhum produto encontrado para a empresa com URI:', companyUri);
      return {
        migratedCount: 0,
        errorCount: 0,
        totalProcessed: 0
      };
    }

    console.log(`📊 Encontradas ${oldData.length} produtos para migrar`);

    let migratedCount = 0;
    let errorCount = 0;
    const batchSize = 50; // Menor batch size para produtos

    // Processar em lotes
    for (let i = 0; i < oldData.length; i += batchSize) {
      const batch: any[] = oldData.slice(i, i + batchSize);
      console.log(`⚙️ Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldData.length / batchSize)}...`);

      for (const oldData of batch) {
        try {
          oldData.settings = await OldProductSettingsModel.findOne({
            _id: new mongoose.Types.ObjectId(oldData.productsettingsid)
          }).lean();

          // Verificar se o produto já existe no banco novo
          const existingProduct = await NewProductModel.findOne({
            _id: oldData._id
          });
          
          if (existingProduct) {
            console.log(`⚠️ O produto ${oldData.product} (${oldData.sunnyid}) já existe no banco novo. Pulando...`);
            continue;
          }

          if (!oldData.settings)
            throw new Error(`Produto ${oldData.product} (${oldData.sunnyid}) não tem configurações associadas.`);

          const oldComponents = await OldProductComponentModel
            .find({ settingsid: oldData.productsettingsid })
            .populate({ path: 'data.componentid', model: OldProductModel })
            .lean();

          const oldAdditionals = await OldProductAdditionalModel
            .find({ settingsid: oldData.productsettingsid })
            .populate({ path: 'additionalid', model: OldProductModel })
            .lean();

          const isAnAdditional = await OldProductAdditionalModel.findOne({ additionalid: oldData._id });
          const isAComponent = await OldProductComponentModel.findOne({ 'data.componentid': oldData._id });

          (oldData as any).isAdditional = !!isAnAdditional;
          (oldData as any).isComponent = !!isAComponent;

          // Transformar e salvar o método de pagamento
          const transformedData = transformProduct(oldData, oldComponents, oldAdditionals);

          if (transformedData.transformedCategory) {
            console.log('Verificando categoria:', transformedData.transformedCategory.name);
            const existingCategory = await newCategoryModel.findOne({ _id: transformedData.transformedCategory._id });
            if (!existingCategory) {
              console.log('Salvando nova categoria:', transformedData.transformedCategory.name);
              const newCategory = new newCategoryModel(transformedData.transformedCategory);
              await newCategory.save();
            }
          }

          // Salvar o produto transformado
          const newProduct= new NewProductModel(transformedData.transformedProduct);
          await newProduct.save();
          // Criar atalho no catálogo
          if (newProduct.productType === ProductType.NORMAL || 
              newProduct.productType === ProductType.VARIATION ||
              newProduct.productType === ProductType.COMBO ||
              newProduct.productType === ProductType.PIZZA) {
            await saveShortcut(newProduct, CatalogShortcutModel);
          }
          
          migratedCount++;
          
          if (migratedCount % 25 === 0) {
            console.log(`✅ ${migratedCount} products migrados...`);
          }
        } catch (error) {
          errorCount++;
          console.error(`❌ Erro ao migrar produto ${oldData.product} (${oldData.sunnyid}):`, error);
        }
      }
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`✅ produtos migrados com sucesso: ${migratedCount}`);
    console.log(`❌ Erros durante a migração: ${errorCount}`);
    console.log(`📝 Total de produtos processadas: ${oldData.length}`);

    console.log('🎉 Migração de produtos concluída!');

    return {
      migratedCount,
      errorCount,
      totalProcessed: oldData.length
    };
  } catch (error) {
    console.error('💥 Erro fatal durante a migração de produtos:', error);
    throw error;
  }
}
