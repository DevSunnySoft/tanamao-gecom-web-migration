# Tanamao Migration Tool

Script de migração de dados entre bancos MongoDB para o sistema Tanamao.

## Funcionalidades

- ✅ Conecta com dois bancos MongoDB (origem e destino)
- ✅ **Migra dados de usuários** do modelo `OldUser` para `NewUser`
- ✅ **Migra dados de empresas** do modelo `OldCompany` para `NewCompany`
- ✅ Transforma campos conforme nova estrutura
- ✅ Adiciona campos de conformidade LGPD (usuários)
- ✅ Processa em lotes para melhor performance
- ✅ Evita duplicações verificando registros existentes
- ✅ Logs detalhados do processo de migração
- ✅ Suporte a migração seletiva (apenas usuários ou apenas empresas)

## Entidades Suportadas

### 👥 Usuários (Users)
- **Origem**: `OldUser` (snake_case)
- **Destino**: `NewUser` (camelCase)
- **Campos especiais**: Conformidade LGPD adicionada
- **Arquivo**: `src/user/index.ts`

### 🏢 Empresas (Companies)
- **Origem**: `OldCompany` (snake_case)
- **Destino**: `NewCompany` (camelCase)
- **Campos especiais**: Reestruturação de categorias e localização
- **Arquivo**: `src/company/index.ts`

## Estrutura dos Dados

### OldUser (Banco Origem)
- Campos em snake_case (ex: `isactive`, `companyid`)
- Campo `zipcode` nos endereços
- Sem campos de LGPD

### NewUser (Banco Destino)
- Campos em camelCase (ex: `isActive`, `companyId`)
- Campo `zipCode` nos endereços
- Campos de conformidade LGPD adicionados

## Configuração

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   # Copiar arquivo de exemplo
   copy .env.example .env
   
   # Editar .env com suas configurações
   OLD_DB_URI=mongodb://localhost:27017/old_tanamao
   NEW_DB_URI=mongodb://localhost:27017/new_tanamao
   ```

3. **Compilar TypeScript:**
   ```bash
   npm run build
   ```

## Uso

### Verificar Conectividade
```bash
npm run start check
```

### Ver Estatísticas dos Bancos
```bash
npm run start stats
```

### Executar Migração Completa (Usuários + Empresas)
```bash
npm run start migrate
```

### Migrar Apenas Usuários
```bash
npm run start migrate-users
```

### Migrar Apenas Empresas
```bash
npm run start migrate-companies
```

### Modo Desenvolvimento (TypeScript)
```bash
npm run dev migrate
```

## Transformações Aplicadas

### Usuários

| Campo Antigo | Campo Novo | Observações |
|--------------|------------|-------------|
| `companyid` | `companyId` | Renomeação |
| `customerid` | `pdvId` | Renomeação |
| `isactive` | `isActive` | CamelCase |
| `isadmin` | `isAdmin` | CamelCase |
| `isconfirmed` | `isConfirmed` | CamelCase |
| `photourl` | `photoUrl` | CamelCase |
| `istemporary` | `isTemporary` | CamelCase |
| `expireat` | `expireAt` | CamelCase |
| `createdat` | `createdAt` | CamelCase |
| `updatedat` | `updatedAt` | CamelCase |
| `addresses[].zipcode` | `addresses[].zipCode` | CamelCase |
| - | `sendWsNotification` | Novo campo (padrão: true) |
| - | `privacySettings` | Configurações LGPD |
| - | `lgpdConsent` | Consentimento LGPD |

### Empresas

| Campo Antigo | Campo Novo | Observações |
|--------------|------------|-------------|
| `isvisible` | `isVisible` | CamelCase |
| `urilogo` | `urlLogo` | Renomeação |
| `minvalue` | `minValue` | CamelCase |
| `businesscategoryid` | `businessCategories` | Array de objetos |
| `deliveryfee` | `deliveryFee` | CamelCase |
| `avgdelivery` | `deliveryTime` | Renomeação |
| `avglocal` | `pickupTime` | Renomeação |
| `isdeliveryactive` | `isDeliveryActive` | CamelCase |
| `islocalactive` | `isLocalActive` | CamelCase |
| `islocalreadonly` | `isLocalReadonly` | CamelCase |
| `usespotcash` | `useLocalCash` | Renomeação |
| `useonlinecash` | `useOnlineCash` | CamelCase |
| `location.utcoffset` | `location.timezone` | Conversão de timezone |
| `banner.path` | `urlBanner` | Extração do path |
| `businessscore` | `rating` | Renomeação |

### Novos Campos Empresas
- `cpsId`: ID da empresa no sistema antigo
- `isPickupActive`: Baseado em `islocalactive`
- `isDeliveryPaused`: false (padrão)
- `merchantId`: undefined (padrão)
- `useIfood`: false (padrão)
- `reviewCount`: 0 (padrão)

## Campos LGPD Adicionados

### privacySettings
- `allowDataCollection`: true (padrão)
- `allowMarketingEmails`: false (padrão)
- `allowLocationTracking`: false (padrão)
- `dataRetentionPeriod`: 365 dias (padrão)
- `consentGivenAt`: Data atual
- `consentUpdatedAt`: Data atual

### lgpdConsent
- `hasGivenConsent`: true (padrão)
- `consentDate`: Data atual
- `consentVersion`: "1.0"
- `ipAddress`: "127.0.0.1" (migração)
- `userAgent`: "Migration Script"

## Logs e Monitoramento

O script fornece logs detalhados:
- ✅ Conexões estabelecidas
- 📊 Contagem de registros
- ⚙️ Progresso por lotes
- ⚠️ Usuários já existentes (pulados)
- ❌ Erros durante a migração
- 📊 Resumo final

## Tratamento de Erros

- Verifica conectividade antes da migração
- Pula usuários já existentes (por username)
- Continua processamento mesmo com erros individuais
- Log detalhado de erros para investigação

## Performance

- Processamento em lotes de 100 registros
- Uso de `.lean()` para consultas mais rápidas
- Conexões separadas para cada banco
- Progress tracking a cada 50 registros migrados

## Segurança

- Senhas mantidas como no banco original
- Dados sensíveis preservados
- Configurações LGPD aplicadas com valores seguros por padrão

## Estrutura do Projeto

```
src/
├── index.ts              # Script principal de migração
├── user/
│   ├── index.ts          # Migração de usuários
│   └── types/
│       ├── OldUser.ts    # Interface do modelo antigo
│       └── NewUser.ts    # Interface do modelo novo
├── company/
│   ├── index.ts          # Migração de empresas
│   └── types/
│       ├── OldCompany.ts # Interface do modelo antigo
│       └── NewCompany.ts # Interface do modelo novo
└── data/
    └── *.json            # Dados de exemplo (se necessário)
```

## Documentação Adicional

- 📖 [USAGE_GUIDE.md](./USAGE_GUIDE.md) - Guia de uso detalhado
- 🏢 [COMPANY-MIGRATION-GUIDE.md](./COMPANY-MIGRATION-GUIDE.md) - Migração de empresas
- 🧪 [test-company-migration.ts](./test-company-migration.ts) - Script de validação
# tanamao-gecom-web-migration
