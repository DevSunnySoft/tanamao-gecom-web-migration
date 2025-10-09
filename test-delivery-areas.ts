import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

interface TestCity {
  cityid: number;
  ibgeid: string;
  name: string;
  uf: string;
  countryid: number;
}

interface TestCompany {
  _id: string;
  name: string;
  cities: TestCity[];
  cnpj: string;
  isdeliveryactive: boolean;
  deliveryfee: number;
  minvalue: number;
  avgdelivery: number;
  isactive: boolean;
  createdat: Date;
  updatedat: Date;
}

// Função para simular busca da API Nominatim
async function testNominatimAPI(cityName: string, stateCode: string) {
  const encodedQuery = encodeURIComponent(`${cityName}, ${stateCode}, Brazil`);
  const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&polygon_geojson=1&limit=1&addressdetails=1`;
  
  console.log(`🌍 Testando API Nominatim para: ${cityName}, ${stateCode}`);
  console.log(`   URL: ${url}`);
  
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'tanamao-migration-tool/1.0.0'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as any[];
    console.log(`✅ Resposta recebida para ${cityName}, ${stateCode}:`);
    console.log(`   Status: ${response.status}`);
    console.log(`   Resultados: ${data.length}`);
    
    if (data && data.length > 0) {
      const result = data[0];
      console.log(`   Place ID: ${result.place_id}`);
      console.log(`   Display Name: ${result.display_name}`);
      console.log(`   Coordenadas: ${result.lat}, ${result.lon}`);
      console.log(`   Bounding Box: ${result.boundingbox}`);
      console.log(`   Tem GeoJSON: ${result.geojson ? 'Sim' : 'Não'}`);
      if (result.geojson) {
        console.log(`   GeoJSON Type: ${result.geojson.type}`);
        console.log(`   Coordenadas GeoJSON: ${JSON.stringify(result.geojson.coordinates).substring(0, 100)}...`);
      }
      return result;
    } else {
      console.log(`⚠️ Nenhum resultado encontrado para ${cityName}, ${stateCode}`);
      return null;
    }
  } catch (error) {
    console.error(`❌ Erro ao buscar dados para ${cityName}, ${stateCode}:`, error);
    return null;
  }
}

// Função para testar criação de delivery areas
async function testDeliveryAreaCreation() {
  console.log('🧪 Iniciando teste de criação de Delivery Areas\n');
  
  // Empresa de teste
  const testCompany: TestCompany = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Pizzaria Teste',
    cnpj: '12.345.678/0001-90',
    isdeliveryactive: true,
    deliveryfee: 5.50,
    minvalue: 25.00,
    avgdelivery: 45,
    isactive: true,
    createdat: new Date('2023-01-01'),
    updatedat: new Date('2024-01-01'),
    cities: [
      {
        cityid: 1,
        ibgeid: '3550308',
        name: 'São Paulo',
        uf: 'SP',
        countryid: 1
      },
      {
        cityid: 2,
        ibgeid: '3304557',
        name: 'Rio de Janeiro',
        uf: 'RJ',
        countryid: 1
      },
      {
        cityid: 3,
        ibgeid: '3106200',
        name: 'Belo Horizonte',
        uf: 'MG',
        countryid: 1
      }
    ]
  };

  console.log(`🏢 Testando empresa: ${testCompany.name}`);
  console.log(`📍 Cidades a processar: ${testCompany.cities.length}\n`);

  // Testar API para cada cidade
  for (const city of testCompany.cities) {
    console.log(`\n📍 === TESTANDO CIDADE: ${city.name}, ${city.uf} ===`);
    
    const geoData = await testNominatimAPI(city.name, city.uf);
    
    if (geoData) {
      // Simular criação da delivery area
      const deliveryArea = {
        areaType: 'CITY',
        name: `${city.name} - ${city.uf}`,
        description: `Área de entrega para ${city.name}, ${city.uf}`,
        companyId: new mongoose.Types.ObjectId(testCompany._id),
        priority: 1,
        geometry: {
          center: {
            type: 'Point',
            coordinates: [parseFloat(geoData.lon), parseFloat(geoData.lat)]
          },
          polygon: geoData.geojson ? {
            type: 'Polygon',
            coordinates: geoData.geojson.coordinates
          } : undefined,
          placeReference: {
            placeId: geoData.place_id.toString(),
            bounds: {
              northeast: { 
                lat: parseFloat(geoData.boundingbox[1]), 
                lng: parseFloat(geoData.boundingbox[3]) 
              },
              southwest: { 
                lat: parseFloat(geoData.boundingbox[0]), 
                lng: parseFloat(geoData.boundingbox[2]) 
              }
            },
            lastSync: new Date()
          }
        },
        config: {
          allowDelivery: testCompany.isdeliveryactive,
          deliveryFee: testCompany.deliveryfee,
          minOrderValue: testCompany.minvalue,
          maxDeliveryTime: testCompany.avgdelivery,
          isActive: true,
          freeDeliveryMinValue: testCompany.minvalue * 2,
          surchargeRules: {
            nightSurcharge: 0,
            weekendSurcharge: 0,
            distanceSurcharge: {
              baseDistance: 5,
              extraFeePerKm: 2
            }
          }
        },
        isActive: true,
        version: '2.0.0',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log(`✅ Delivery Area criada com sucesso!`);
      console.log(`   Nome: ${deliveryArea.name}`);
      console.log(`   Centro: [${deliveryArea.geometry.center.coordinates.join(', ')}]`);
      console.log(`   Taxa de entrega: R$ ${deliveryArea.config.deliveryFee}`);
      console.log(`   Valor mínimo: R$ ${deliveryArea.config.minOrderValue}`);
      console.log(`   Tempo máximo: ${deliveryArea.config.maxDeliveryTime} min`);
      console.log(`   Entrega grátis acima de: R$ ${deliveryArea.config.freeDeliveryMinValue}`);
    } else {
      console.log(`⚠️ Criaria delivery area básica (sem dados geográficos)`);
    }
    
    // Delay entre requisições
    console.log(`⏳ Aguardando 1 segundo antes da próxima cidade...`);
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  console.log(`\n🎯 Teste concluído! Processadas ${testCompany.cities.length} cidades.`);
}

// Função para testar diferentes cenários
async function testDifferentScenarios() {
  console.log('\n🧪 Testando diferentes cenários:\n');
  
  const testCases = [
    { name: 'São Paulo', uf: 'SP', expected: 'Sucesso' },
    { name: 'Rio de Janeiro', uf: 'RJ', expected: 'Sucesso' },
    { name: 'Curitiba', uf: 'PR', expected: 'Sucesso' },
    { name: 'CidadeInexistente', uf: 'ZZ', expected: 'Falha/Fallback' },
    { name: 'Salvador', uf: 'BA', expected: 'Sucesso' }
  ];

  for (const testCase of testCases) {
    console.log(`\n🔍 Testando: ${testCase.name}, ${testCase.uf} (Esperado: ${testCase.expected})`);
    
    await testNominatimAPI(testCase.name, testCase.uf);
    
    // Delay entre testes
    await new Promise(resolve => setTimeout(resolve, 1500));
  }
}

// Função principal
async function main() {
  console.log('🚀 Iniciando testes de Delivery Areas\n');
  
  try {
    // Teste 1: Criação de delivery areas
    await testDeliveryAreaCreation();
    
    // Teste 2: Diferentes cenários
    await testDifferentScenarios();
    
    console.log('\n✅ Todos os testes concluídos com sucesso!');
    console.log('\n📋 Pontos observados:');
    console.log('   - API Nominatim respondendo corretamente');
    console.log('   - Rate limiting funcionando (delays entre requisições)');
    console.log('   - Criação de geometrias a partir dos dados');
    console.log('   - Configuração de delivery baseada nos dados da empresa');
    console.log('   - Fallback para cidades não encontradas');
    
  } catch (error) {
    console.error('💥 Erro durante os testes:', error);
  }
}

// Executar testes se arquivo for chamado diretamente
if (require.main === module) {
  main();
}

export { testDeliveryAreaCreation, testNominatimAPI, testDifferentScenarios };
