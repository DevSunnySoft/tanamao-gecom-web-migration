import type { OldCompany } from './types/OldCompany';
import { DeliveryAreaGeometry, DeliveryAreaType, type DeliveryConfig, type ICompany, type IDeliveryArea } from './types/NewCompany';
import { transformUser, oldUserSchema, newUserSchema } from '../user';
import type { OldUser } from '../user/types/OldUser';
import type { IUser } from '../user/types/NewUser';
import mongoose from 'mongoose';

// Interface para resposta da API Nominatim
interface NominatimResponse {
  place_id: number;
  osm_id: number;
  osm_type: string;
  licence: string;
  lat: string;
  lon: string;
  display_name: string;
  boundingbox: [string, string, string, string]; // [south, north, west, east]
  geojson?: {
    type: string;
    coordinates: number[][][] | number[][][][];
  };
  type: string;
  importance: number;
}

// Schemas para o banco antigo
const oldCompanySchema = new mongoose.Schema({
  _id: String,
  createdat: Date,
  updatedat: Date,
  isvisible: Boolean,
  name: String,
  cities: [{
    cityid: Number,
    ibgeid: String,
    name: String,
    uf: String,
    countryid: Number
  }],
  phone: String,
  uri: String,
  urilogo: String,
  cnpj: String,
  minvalue: Number,
  businesscategoryid: [String],
  version: String,
  deliveryfee: Number,
  isactive: Boolean,
  wildcards: [String],
  paymethods: [String],
  location: {
    address: String,
    utcoffset: String,
    geo: {
      type: String,
      coordinates: [Number]
    }
  },
  avgdelivery: Number,
  isdeliveryactive: Boolean,
  islocalactive: Boolean,
  islocalreadonly: Boolean,
  avglocal: Number,
  usespotcash: Boolean,
  useonlinecash: Boolean,
  isclosed: Boolean,
  stylecolor: String,
  businessscore: Number,
  admphone: String,
  allowtemporaryusers: Boolean,
  allowtempusersdelivery: Boolean,
  banner: {
    _id: String,
    path: String
  },
  pingexpireat: Date,
  catalogindex: Number,
  catalogname: String,
  closeat: Date,
  businesshours: String,
  usemenu: Boolean,
  pixtype: String,
  pixkey: String,
  pixkeytype: String,
  pixcontact: String,
  pixname: String
}, { collection: 'companies' });

// Schema para o banco novo
const newCompanySchema = new mongoose.Schema({
  cpsId: String,
  name: String,
  isVisible: Boolean,
  phone: String,
  uri: String,
  urlLogo: String,
  urlBanner: String,
  cnpj: String,
  minValue: Number,
  isActive: Boolean,
  wildcards: [String],
  payMethods: [mongoose.Schema.Types.ObjectId],
  location: {
    address: String,
    timezone: String,
    center: {
      type: { type: String, enum: ['Point'], required: false },
      coordinates: { type: [Number], required: false }
    }
  },
  deliveryTime: Number,
  deliveryFee: Number,
  pickupTime: Number,
  isPickupActive: Boolean,
  allowTemporaryUsers: Boolean,
  useMenu: Boolean,
  admPhone: String,
  useLocalCash: Boolean,
  useOnlineCash: Boolean,
  isDeliveryActive: Boolean,
  isDeliveryPaused: Boolean,
  isLocalActive: Boolean,
  businessHours: mongoose.Schema.Types.Mixed,
  businessCategories: [{
    name: String,
    _id: mongoose.Schema.Types.ObjectId
  }],
  catalogUpdatedAt: Date,
  catalogIndex: Number,
  catalogName: String,
  pingExpireAt: Date,
  isLocalReadonly: Boolean,
  merchantId: String,
  useIfood: Boolean,
  pixType: String,
  pixKey: String,
  pixKeyType: String,
  pixContact: String,
  pixName: String,
  rating: Number,
  reviewCount: Number,
  createdAt: Date,
  updatedAt: Date
}, { collection: 'companies' });

const DeliveryConfigSchema = new mongoose.Schema<DeliveryConfig>({
  allowDelivery: { type: Boolean, required: true },
  deliveryFee: { type: Number, required: true },
  minOrderValue: { type: Number, required: true },
  maxDeliveryTime: { type: Number, required: true },
  isActive: { type: Boolean, required: true },
  freeDeliveryMinValue: Number,
  surchargeRules: {
    nightSurcharge: Number,
    weekendSurcharge: Number,
    distanceSurcharge: {
      baseDistance: Number,
      extraFeePerKm: Number,
    },
  },
  //schedule: Schema.Types.Mixed,
}, { _id: false });

const DeliveryAreaGeometrySchema = new mongoose.Schema<DeliveryAreaGeometry>({
  center: {
    type: { type: String, enum: ['Point'], required: true },
    coordinates: { type: [Number], required: true },
  },
  polygon: {
    type: { type: String, enum: ['Polygon'], required: true },
    coordinates: { type: [[[Number]]], required: true },
  },
  placeReference: {
    placeId: String,
    bounds: {
      northeast: { lat: Number, lng: Number },
      southwest: { lat: Number, lng: Number },
    },
    viewport: {
      northeast: { lat: Number, lng: Number },
      southwest: { lat: Number, lng: Number },
    },
    lastSync: Date,
  },
}, { _id: false });


export const DeliveryAreaSchema = new mongoose.Schema<IDeliveryArea>({
  areaType: { type: String, enum: Object.values(DeliveryAreaType), required: true },
  name: { type: String, required: true },
  description: { type: String, required: false },
  companyId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Company' },
  priority: { type: Number, default: 1 },
  geometry: { type: DeliveryAreaGeometrySchema, required: false }, // Geometria da área de entrega
  config: { type: DeliveryConfigSchema, required: true },
  isActive: { type: Boolean, default: true },
  version: { type: String, default: '2.0.0' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const legacyPaymethodSchema = new mongoose.Schema({
  _id: String,
  code: { type: String, required: true }
}, { collection: 'paymethods' });

const modernPaymethodSchema = new mongoose.Schema({
  code: { type: String, required: true }
}, { collection: 'paymethods' });

interface PaymethodMappings {
  oldIdToCode: Map<string, string>;
  codeToNewId: Map<string, string>;
}

const STREET_TERMS_REGEX = /\b(?:Rua\s|R\.\s?|Avenida\s|Av\.\s|Av\s|R\s?)\b/gi;

function sanitizeAddressForGeocoding(address?: string): string {
  if (!address) {
    return '';
  }

  const cleaned = address
    .replace(STREET_TERMS_REGEX, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*,\s*/g, ', ')
    .trim();

  return cleaned.length > 0 ? cleaned : address.trim();
}

const lilCache = new Map<string, NominatimResponse>();

async function fetchAddressGeocode(address: string, retries = 3): Promise<NominatimResponse | null> {
  const encodedQuery = encodeURIComponent(address);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&polygon_geojson=1&limit=1&addressdetails=1`;
  console.log(`🔗 URL: ${url}`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌍 Buscando dados geográficos para ${address} (tentativa ${attempt}/${retries})`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'tanamao-migration-tool/1.0.0'
        }
      });

      if (response.status === 429) {
        // Rate limit - aguardar mais tempo
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Rate limit detectado. Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as NominatimResponse[];
      
      if (data && data.length > 0) {
        const result = data[0];
        // Armazenar no cache
        console.log(`✅ Dados geográficos encontrados para ${address}`);
        return result;
      } else {
        console.log(`⚠️ Nenhum dado geográfico encontrado para ${address}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar dados geográficos para ${address} (tentativa ${attempt}):`, error);

      if (attempt === retries) {
        console.error(`💥 Falha após ${retries} tentativas para ${address}`);
        return null;
      }
      
      // Aguardar antes da próxima tentativa
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return null;
}

// Função para buscar dados geográficos da API Nominatim
async function fetchCityGeographicData(cityName: string, stateCode: string, retries = 3): Promise<NominatimResponse | null> {
  const encodedQuery = encodeURIComponent(`${cityName}, ${stateCode}, Brazil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&polygon_geojson=1&limit=1&addressdetails=1`;

  // Verificar cache antes de fazer a requisição
  const cacheKey = `${cityName}, ${stateCode}`;
  if (lilCache.has(cacheKey)) {
    console.log(`🔍 Dados geográficos encontrados no cache para ${cityName}, ${stateCode}`);
    return lilCache.get(cacheKey)!;
  }
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🌍 Buscando dados geográficos para ${cityName}, ${stateCode} (tentativa ${attempt}/${retries})`);
      
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'tanamao-migration-tool/1.0.0'
        }
      });

      if (response.status === 429) {
        // Rate limit - aguardar mais tempo
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
        console.log(`⏳ Rate limit detectado. Aguardando ${waitTime}ms antes da próxima tentativa...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json() as NominatimResponse[];
      
      if (data && data.length > 0) {
        const result = data[0];
        // Armazenar no cache
        lilCache.set(cacheKey, result);
        console.log(`✅ Dados geográficos encontrados para ${cityName}, ${stateCode}`);
        return result;
      } else {
        console.log(`⚠️ Nenhum dado geográfico encontrado para ${cityName}, ${stateCode}`);
        return null;
      }
    } catch (error) {
      console.error(`❌ Erro ao buscar dados geográficos para ${cityName}, ${stateCode} (tentativa ${attempt}):`, error);
      
      if (attempt === retries) {
        console.error(`💥 Falha após ${retries} tentativas para ${cityName}, ${stateCode}`);
        return null;
      }
      
      // Aguardar antes da próxima tentativa
      const waitTime = Math.pow(2, attempt) * 1000;
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  return null;
}

function printProgressBar(current: number, total: number, barLength = 40) {
  const percent = Math.floor((current / total) * 100);
  const filledLength = Math.floor((barLength * current) / total);
  const bar = '█'.repeat(filledLength) + '-'.repeat(barLength - filledLength);
  process.stdout.write(`\r[${bar}] ${percent}% (${current}/${total})`);
  if (current === total) process.stdout.write('\n');
}

// Função para criar área de entrega baseada em dados geográficos
function createDeliveryAreaFromGeoData(
  cityData: NominatimResponse, 
  cityName: string, 
  stateCode: string,
  companyId: mongoose.Types.ObjectId,
  defaultConfig: DeliveryConfig
): Partial<IDeliveryArea> {
  
  const lat = parseFloat(cityData.lat);
  const lon = parseFloat(cityData.lon);
  const [south, north, west, east] = cityData.boundingbox.map(parseFloat);

  // Criar geometria baseada no geojson ou bounding box
  let geometry: DeliveryAreaGeometry | undefined;

  if (cityData.geojson && cityData.geojson.coordinates) {
    // Usar dados GeoJSON se disponível
    let polygonCoordinates: number[][][];
    
    if (cityData.geojson.type === 'Polygon') {
      polygonCoordinates = cityData.geojson.coordinates as number[][][];
    } else if (cityData.geojson.type === 'MultiPolygon') {
      // Para MultiPolygon, usar o primeiro polígono
      const multiPolygon = cityData.geojson.coordinates as number[][][][];
      polygonCoordinates = multiPolygon[0];
    } else {
      // Fallback para bounding box
      polygonCoordinates = [[
        [west, south],
        [east, south],
        [east, north],
        [west, north],
        [west, south]
      ]];
    }

    geometry = {
      center: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      polygon: {
        type: 'Polygon',
        coordinates: polygonCoordinates
      },
      placeReference: {
        placeId: cityData.place_id.toString(),
        timeZone: 'America/Sao_Paulo',
        lastSync: new Date()
      }
    };
  } else {
    // Fallback usando bounding box
    geometry = {
      center: {
        type: 'Point',
        coordinates: [lon, lat]
      },
      polygon: {
        type: 'Polygon',
        coordinates: [[
          [west, south],
          [east, south],
          [east, north],
          [west, north],
          [west, south]
        ]]
      },
      placeReference: {
        placeId: cityData.place_id.toString(),
        timeZone: 'America/Sao_Paulo',
        lastSync: new Date()
      }
    };
  }

  return {
    areaType: DeliveryAreaType.City,
    name: `${cityName} - ${stateCode}`,
    description: `Área de entrega para ${cityName}, ${stateCode}`,
    companyId,
    priority: 1,
    geometry,
    config: defaultConfig,
    isActive: true,
    version: '2.0.0',
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
async function ensureDefaultCompanyUser(
  oldConnection: mongoose.Connection,
  newConnection: mongoose.Connection,
  oldCompany: OldCompany,
  targetCompanyId: mongoose.Types.ObjectId | string
): Promise<boolean> {
  const username = oldCompany.cnpj?.trim();

  if (!username) {
    console.warn(`⚠️ Empresa ${oldCompany.name} não possui CNPJ para validar usuário padrão`);
    return false;
  }

  const NewUserModel = newConnection.models.User
    || newConnection.model('User', newUserSchema);

  const existingUser = await NewUserModel.findOne({ username }).lean();

  if (existingUser) {
    console.log(`👤 Usuário padrão já existe para ${oldCompany.name} (${username})`);
    return false;
  }

  const OldUserModel = oldConnection.models.LegacyUser
    || oldConnection.model('LegacyUser', oldUserSchema, 'users');

  const legacyUser = await OldUserModel.findOne({ username }).lean<OldUser>();

  if (!legacyUser) {
    console.warn(`⚠️ Usuário padrão não encontrado no legado para ${oldCompany.name} (${username})`);
    return false;
  }

  const transformedUser = transformUser(legacyUser);
  const newUserPayload: Partial<IUser> & { _id: string } = {
    ...transformedUser,
    _id: legacyUser._id.toHexString(),
    companyId: targetCompanyId.toString(),
    username,
  };

  const newUserDocument = new NewUserModel(newUserPayload);
  await newUserDocument.save();

  console.log(`✅ Usuário padrão criado para ${oldCompany.name} (${username})`);
  return true;
}
async function loadPaymethodMappings(
  oldConnection: mongoose.Connection,
  newConnection: mongoose.Connection
): Promise<PaymethodMappings> {
  const LegacyPaymethodModel = oldConnection.models.LegacyPaymethod
    || oldConnection.model('LegacyPaymethod', legacyPaymethodSchema, 'paymethods');

  const ModernPaymethodModel = newConnection.models.ModernPaymethod
    || newConnection.model('ModernPaymethod', modernPaymethodSchema, 'paymethods');

  const [legacyPaymethods, modernPaymethods] = await Promise.all([
    LegacyPaymethodModel.find({}).select({ _id: 1, code: 1 }).lean(),
    ModernPaymethodModel.find({}).select({ _id: 1, code: 1 }).lean()
  ]);

  const oldIdToCode = new Map<string, string>();
  const codeToNewId = new Map<string, string>();

  for (const legacy of legacyPaymethods as Array<{ _id: string; code?: string }>) {
    if (!legacy?._id || !legacy.code) {
      continue;
    }

    oldIdToCode.set(String(legacy._id), String(legacy.code).trim().toUpperCase());
  }

  for (const modern of modernPaymethods as Array<{ _id: mongoose.Types.ObjectId | string; code?: string }>) {
    if (!modern?._id || !modern.code) {
      continue;
    }

    codeToNewId.set(String(modern.code).trim().toUpperCase(), modern._id.toString());
  }

  return { oldIdToCode, codeToNewId };
}

// Função para transformar dados do modelo antigo para o novo
async function transformCompany(
  oldCompany: any,
  paymethodMappings: PaymethodMappings,
  companyObjectId?: mongoose.Types.ObjectId
): Promise<{ company: Partial<ICompany>, deliveryAreas: Partial<IDeliveryArea>[] }> {
  let locationCenter: any;
  
  if (oldCompany.location?.address && oldCompany.cities && Array.isArray(oldCompany.cities) && oldCompany.cities.length > 0) {
    // Tentar geocodificar o endereço com a cidade principal, se não funcionar, tentar só o endereço
    const primaryCity = oldCompany.cities[0];
    const sanitizedAddress = sanitizeAddressForGeocoding(oldCompany.location.address);
    const baseAddress = sanitizedAddress || oldCompany.location.address || '';
    const fullAddress = baseAddress
      ? `${baseAddress}, ${primaryCity.name}, ${primaryCity.uf}`
      : `${primaryCity.name}, ${primaryCity.uf}`;
    try {
      let locationGeo = await fetchAddressGeocode(fullAddress);

      if (!locationGeo || !locationGeo.lat || !locationGeo.lon) {
        // Tentar só com o endereço
        const fallbackAddress = sanitizedAddress || oldCompany.location.address;
        console.log(`🔄 Tentando geocodificar apenas o endereço: ${fallbackAddress}`)
        locationGeo = await fetchAddressGeocode(fallbackAddress)
      }

      if (locationGeo && locationGeo.lat && locationGeo.lon) {
        locationCenter = {
          type: 'Point',
          coordinates: [parseFloat(locationGeo.lon), parseFloat(locationGeo.lat)]
        };
        console.log(`📍 Geocodificação realizada para o endereço: ${oldCompany.location.address}`);
      }
    } catch (error) {
      console.error(`❌ Erro ao geocodificar o endereço ${oldCompany.location.address}:`, error);
    }
  }

  // go to next if no location found
  if (!locationCenter) {
    throw new Error(`Nenhum dado de localização encontrado para o endereço: ${oldCompany.location?.address}`);
  }
  
  const newCompany: Partial<ICompany> = {
    _id: oldCompany._id,
    cpsId: undefined,
    name: oldCompany.name,
    isVisible: oldCompany.isvisible,
    phone: oldCompany.phone,
    uri: oldCompany.uri,
    urlLogo: `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/100x100/${oldCompany.urilogo}`,
    urlBanner: `https://storage.googleapis.com/ta-na-mao-f41a6.appspot.com/original/${oldCompany.banner?.path}`,
    cnpj: oldCompany.cnpj,
    minValue: oldCompany.minvalue || 0,
    isActive: oldCompany.isactive,
    wildcards: oldCompany.wildcards,
    // Nota: payMethods precisará de conversão de string para ObjectId se necessário
    payMethods: [], // Será preenchido com lógica específica se necessário
    location: {
      address: oldCompany.location?.address || '',
      timezone: oldCompany.location?.utcoffset || 'America/Sao_Paulo',
      center: locationCenter ? locationCenter : undefined
    },
    deliveryTime: oldCompany.avgdelivery || 30,
    deliveryFee: oldCompany.deliveryfee || 0,
    pickupTime: oldCompany.avglocal || 15,
    isPickupActive: oldCompany.islocalactive || false,
    allowTemporaryUsers: oldCompany.allowtemporaryusers,
    useMenu: oldCompany.usemenu || false,
    admPhone: oldCompany.admphone,
    useLocalCash: oldCompany.usespotcash,
    useOnlineCash: oldCompany.useonlinecash,
    isDeliveryActive: oldCompany.isdeliveryactive,
    isDeliveryPaused: false, // valor padrão
    isLocalActive: oldCompany.islocalactive,
    businessHours: oldCompany.businesshours,
    catalogUpdatedAt: oldCompany.updatedat,
    catalogIndex: oldCompany.catalogindex,
    catalogName: oldCompany.catalogname,
    pingExpireAt: oldCompany.pingexpireat,
    isLocalReadonly: oldCompany.islocalreadonly || false,
    merchantId: undefined, // valor padrão
    useIfood: false, // valor padrão
    pixType: oldCompany.pixtype,
    pixKey: oldCompany.pixkey,
    pixKeyType: oldCompany.pixkeytype,
    pixContact: oldCompany.pixcontact,
    pixName: oldCompany.pixname,
    rating: oldCompany.businessscore || 0,
    reviewCount: 0, // valor padrão
    createdAt: oldCompany.createdat || new Date(),
    updatedAt: oldCompany.updatedat || new Date()
  };

  // Transformar Paymethods
  if (oldCompany.paymethods && Array.isArray(oldCompany.paymethods)) {
    const resolvedPaymethods = new Set<string>();

    for (const legacyReference of oldCompany.paymethods) {
      if (!legacyReference) {
        continue;
      }

      const legacyCodeCandidate = paymethodMappings.oldIdToCode.get(String(legacyReference)) ?? String(legacyReference);
      const normalizedCode = legacyCodeCandidate.trim().toUpperCase();

      if (!normalizedCode) {
        continue;
      }

      const newPaymethodId = paymethodMappings.codeToNewId.get(normalizedCode);

      if (newPaymethodId) {
        if (mongoose.Types.ObjectId.isValid(newPaymethodId)) {
          resolvedPaymethods.add(newPaymethodId);
        } else {
          console.warn(`⚠️ ID de método de pagamento inválido encontrado para o código ${normalizedCode}: ${newPaymethodId}`);
        }
      } else {
        console.warn(`⚠️ Não foi possível mapear o método de pagamento ${normalizedCode} para a empresa ${oldCompany.name}`);
      }
    }

    newCompany.payMethods = Array.from(resolvedPaymethods).map((id) => new mongoose.Types.ObjectId(id));
  }

  // Transformar categorias de negócio se existirem
  if (oldCompany.businesscategoryid && Array.isArray(oldCompany.businesscategoryid)) {
    newCompany.businessCategories = oldCompany.businesscategoryid.map((catId: string) => ({
      name: '', // Será preenchido se necessário
      _id: new mongoose.Types.ObjectId(catId)
    }));
  }

  // Criar delivery areas baseadas nas cidades
  const deliveryAreas: Partial<IDeliveryArea>[] = [];
  
  if (oldCompany.cities && Array.isArray(oldCompany.cities) && oldCompany.cities.length > 0) {
    console.log(`🏘️ Processando ${oldCompany.cities.length} cidades para ${oldCompany.name}`);
    
    // Configuração padrão para delivery
    const defaultDeliveryConfig: DeliveryConfig = {
      allowDelivery: oldCompany.isdeliveryactive || true,
      deliveryFee: oldCompany.deliveryfee || 0,
      minOrderValue: oldCompany.minvalue || 0,
      maxDeliveryTime: oldCompany.avgdelivery || 60,
      isActive: oldCompany.isdeliveryactive || true,
      freeDeliveryMinValue: oldCompany.minvalue ? oldCompany.minvalue * 2 : undefined,
      surchargeRules: {
        nightSurcharge: 0,
        weekendSurcharge: 0,
        distanceSurcharge: {
          baseDistance: 5, // 5km base
          extraFeePerKm: 2, // R$ 2,00 por km extra
        },
      },
    };

    // Usar o ObjectId da empresa se fornecido, senão criar um novo
    const companyId = companyObjectId || new mongoose.Types.ObjectId();

    // Processar cada cidade
    for (const city of oldCompany.cities) {
      try {
        console.log(`🌆 Processando cidade: ${city.name}, ${city.uf}`);
        
        // Buscar dados geográficos para a cidade
        const geoData = await fetchCityGeographicData(city.name, city.uf);
        
        if (geoData) {
          // Criar área de entrega baseada nos dados geográficos
          const deliveryArea = createDeliveryAreaFromGeoData(
            geoData, 
            city.name, 
            city.uf, 
            companyId, 
            defaultDeliveryConfig
          );
          
          deliveryAreas.push(deliveryArea);
          console.log(`✅ Área de entrega criada para ${city.name}, ${city.uf}`);
        } else {
          // Criar área básica sem geometria detalhada
          const basicDeliveryArea: Partial<IDeliveryArea> = {
            areaType: DeliveryAreaType.City,
            name: `${city.name} - ${city.uf}`,
            description: `Área de entrega para ${city.name}, ${city.uf} (dados geográficos não encontrados)`,
            companyId,
            priority: 1,
            config: defaultDeliveryConfig,
            isActive: true,
            version: '2.0.0',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          deliveryAreas.push(basicDeliveryArea);
          console.log(`⚠️ Área de entrega básica criada para ${city.name}, ${city.uf} (sem dados geográficos)`);
        }
        
        // Delay entre requisições para respeitar rate limits da API
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao processar cidade ${city.name}, ${city.uf}:`, error);
        
        // Criar área básica mesmo com erro
        const fallbackDeliveryArea: Partial<IDeliveryArea> = {
          areaType: DeliveryAreaType.City,
          name: `${city.name} - ${city.uf}`,
          description: `Área de entrega para ${city.name}, ${city.uf} (erro ao buscar dados geográficos)`,
          companyId,
          priority: 1,
          config: defaultDeliveryConfig,
          isActive: true,
          version: '2.0.0',
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        deliveryAreas.push(fallbackDeliveryArea);
      }
    }
    
    console.log(`🎯 ${deliveryAreas.length} áreas de entrega criadas para ${oldCompany.name}`);
  }

  return { company: newCompany, deliveryAreas };
}

// Função principal de migração
export async function migrateCompanies(oldConnection: mongoose.Connection, newConnection: mongoose.Connection) {
  console.log('🏢 Iniciando migração de empresas...');
  
  try {
    // Conectar ao banco antigo
    console.log('📡 Conectando ao banco de dados antigo...');
    
    const OldCompanyModel = oldConnection.model<OldCompany>('Company', oldCompanySchema);

    // Conectar ao banco novo
    console.log('📡 Conectando ao banco de dados novo...');
    const NewCompanyModel = newConnection.model<ICompany>('Company', newCompanySchema);
    const DeliveryAreaModel = newConnection.model('DeliveryArea', DeliveryAreaSchema);
    const paymethodMappings = await loadPaymethodMappings(oldConnection, newConnection);

    // Buscar todas as empresas do banco antigo
    console.log('📋 Buscando empresas do banco antigo...');
    const oldCompanies = await OldCompanyModel.find({
      isactive: true,
      updatedat: {
        $gte: new Date("2023-06-01T03:00:00.000Z")
      }
    }).lean();
    console.log(`📊 Encontradas ${oldCompanies.length} empresas para migrar`);

    let migratedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    let deliveryAreasCount = 0;
    let defaultUsersCreated = 0;
    const batchSize = 10; // Batch size menor devido às requisições da API externa

    // Processar em lotes
    for (let i = 0; i < oldCompanies.length; i += batchSize) {
      const batch = oldCompanies.slice(i, i + batchSize);
      console.log(`⚙️ Processando lote ${Math.floor(i / batchSize) + 1}/${Math.ceil(oldCompanies.length / batchSize)}...`);

      for (const oldCompany of batch) {
        try {
          printProgressBar(migratedCount + errorCount, oldCompanies.length);
          // Verificar se a empresa já existe no banco novo
          const existingCompany = await NewCompanyModel.findOne({ 
            $or: [
              { _id: oldCompany._id },
              { cnpj: oldCompany.cnpj },
              { uri: oldCompany.uri }
            ]
          });
          
          if (existingCompany) {
            console.log(`♻️ Empresa ${oldCompany.name} (${oldCompany.cnpj}) já existe. Atualizando registros...`);

            const { company: transformedCompany, deliveryAreas } = await transformCompany(oldCompany, paymethodMappings, existingCompany._id);
            const { _id: ignoredId, ...companyUpdateData } = transformedCompany;

            await NewCompanyModel.updateOne({ _id: existingCompany._id }, { $set: companyUpdateData });
            console.log(`✅ Empresa ${oldCompany.name} atualizada com sucesso`);

            const createdDefaultUser = await ensureDefaultCompanyUser(
              oldConnection,
              newConnection,
              oldCompany,
              existingCompany._id
            );

            if (createdDefaultUser) {
              defaultUsersCreated++;
            }

            if (deliveryAreas && deliveryAreas.length > 0) {
              console.log(`📍 Atualizando ${deliveryAreas.length} áreas de entrega para ${oldCompany.name}`);
              await DeliveryAreaModel.deleteMany({ companyId: existingCompany._id });

              const areasToSave = deliveryAreas.map(area => ({
                ...area,
                companyId: existingCompany._id
              }));

              const savedAreas = await DeliveryAreaModel.insertMany(areasToSave);
              deliveryAreasCount += savedAreas.length;
              console.log(`✅ ${savedAreas.length} áreas de entrega atualizadas para ${oldCompany.name}`);
            }

            updatedCount++;
            continue;
          }

          console.log(`🔄 Transformando empresa: ${oldCompany.name}`);
          
          // Transformar empresa e criar delivery areas
          const { company: transformedCompany, deliveryAreas } = await transformCompany(oldCompany, paymethodMappings);
          
          // Salvar a empresa primeiro
          const newCompany = new NewCompanyModel(transformedCompany);
          const savedCompany = await newCompany.save();
          
          console.log(`✅ Empresa ${oldCompany.name} salva com ID: ${savedCompany._id}`);

          const createdDefaultUser = await ensureDefaultCompanyUser(
            oldConnection,
            newConnection,
            oldCompany,
            savedCompany._id
          );

          if (createdDefaultUser) {
            defaultUsersCreated++;
          }
          
          // Atualizar companyId nas delivery areas e salvar
          if (deliveryAreas && deliveryAreas.length > 0) {
            console.log(`📍 Salvando ${deliveryAreas.length} áreas de entrega para ${oldCompany.name}`);
            
            // Atualizar companyId nas delivery areas
            const areasToSave = deliveryAreas.map(area => ({
              ...area,
              companyId: savedCompany._id
            }));
            
            // Salvar delivery areas em lote
            const savedAreas = await DeliveryAreaModel.insertMany(areasToSave);
            deliveryAreasCount += savedAreas.length;
            
            console.log(`✅ ${savedAreas.length} áreas de entrega salvas para ${oldCompany.name}`);
          }
          
          migratedCount++;
          
          if (migratedCount % 5 === 0) {
            console.log(`✅ ${migratedCount} empresas migradas...`);
          }
          
        } catch (error) {
          errorCount++;
          console.error(`❌ Erro ao migrar empresa ${oldCompany.name} (${oldCompany.cnpj}):`, error);
          
          // Log detalhado do erro
          if (error instanceof Error) {
            console.error(`   Detalhes do erro: ${error.message}`);
            if (error.stack) {
              console.error(`   Stack trace: ${error.stack.substring(0, 500)}...`);
            }
          }
        }
        
        // Delay entre empresas para não sobrecarregar a API externa
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }

    console.log('\n📊 Resumo da migração:');
    console.log(`✅ Empresas migradas com sucesso: ${migratedCount}`);
    console.log(`♻️ Empresas atualizadas: ${updatedCount}`);
    console.log(`📍 Áreas de entrega criadas: ${deliveryAreasCount}`);
    console.log(`👤 Usuários padrão criados: ${defaultUsersCreated}`);
    console.log(`❌ Erros durante a migração: ${errorCount}`);
    console.log(`📝 Total de empresas processadas: ${oldCompanies.length}`);

    console.log('🎉 Migração de empresas concluída!');
    
    return {
      migratedCount,
      updatedCount,
      deliveryAreasCount,
      defaultUsersCreated,
      errorCount,
      totalProcessed: oldCompanies.length
    };
  } catch (error) {
    console.error('💥 Erro fatal durante a migração de empresas:', error);
    throw error;
  }
}
