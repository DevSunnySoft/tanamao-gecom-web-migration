import mongoose, { Schema, model, Types, Model } from 'mongoose';

export interface ICompany {
  _id: mongoose.Types.ObjectId;
  cpsId?: string;
  name: string;
  isVisible: boolean;
  phone?: string;
  uri?: string;
  urlLogo?: string;
  urlBanner?: string;
  cnpj: string;
  minValue: number;
  isActive: boolean;
  wildcards?: Array<string>;
  payMethods?: Array<Types.ObjectId>;
  location: {
    address: string;
    timezone: string;
    center?: {
      type: string;
      coordinates: [number, number];
    };
  };
  deliveryTime: number;
  deliveryFee?: number;
  pickupTime: number;
  isPickupActive: boolean;
  allowTemporaryUsers?: boolean;
  useMenu?: boolean;
  admPhone?: string;
  useLocalCash?: boolean;
  useOnlineCash?: boolean;
  isDeliveryActive?: boolean;
  isDeliveryPaused?: boolean;
  isLocalActive?: boolean;
  businessHours?: any;
  businessCategories?: {name: string, _id: Types.ObjectId}[];
  catalogUpdatedAt?: Date;
  catalogIndex?: number;
  catalogName?: string;
  pingExpireAt?: Date;
  isLocalReadonly: boolean;

  // ifood
  merchantId?: string;
  useIfood: boolean;

  //Pix
  pixType?: string
  pixKey?: string
  pixKeyType?: string
  pixContact?: string
  pixName?: string

  // Rating/Avaliação
  rating?: number; // Nota de 0 a 5
  reviewCount?: number; // Quantidade de avaliações

  // Virtual fields
  stats?: {
    totalDeliveries: number;
    averageDeliveryTime: number;
    customerSatisfaction: number;
    lastDelivery: Date;
  };
  isOpened?: boolean;
  isOpenedIndex?: number;
  closeAtWithTz?: Date;
  closeAt?: Date;
  isClosed?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export type SalesChannel = "ifood" | "tanamao";
export type CompanyStatusState = "OK" | "ERROR" | "WARNING" | "CLOSED";
export type CompanyStatusOperation = "delivery" | "takeout" | "indoor";
export type CompanyStatusMessage = {
  title: string;
  subtitle: string;
  description: string;
  priority: number;
}

export class CompanyStatus {
  salesChannel: SalesChannel;
  available: boolean;
  state: CompanyStatusState;
  validations: Array<any> = [];
  reopenable?: any
  message?: CompanyStatusMessage;
  operation: CompanyStatusOperation;
  catalogUpdatedAt: Date | undefined;

  constructor({ available, state, salesChannel, operation, validations, message, reopenable, catalogUpdatedAt }: Omit<CompanyStatus, "validations"> & Partial<Pick<CompanyStatus, "validations">>) {
    this.salesChannel = salesChannel;
    this.available = available;
    this.state = state;
    this.operation = operation;
    this.validations = validations || [];
    this.message = message;
    this.reopenable = reopenable;
    this.catalogUpdatedAt = catalogUpdatedAt;
  }
}

export interface DeliveryAreaGeometry {
  center: {
    type: 'Point';
    coordinates: [number, number];
  };
  polygon: {
    type: 'Polygon';
    coordinates: number[][][];
  };
  placeReference?: {
    placeId: string;
    timeZone?: string;
    lastSync?: Date;
  };
}

export interface GeospatialQueryOptions {
  maxDistance?: number;
  onlyActive?: boolean;
  sortBy?: 'distance' | 'priority' | 'deliveryFee' | 'name';
  limit?: number;
  pageIndex?: number;
}

export interface DeliveryConfig {
  allowDelivery: boolean;
  deliveryFee: number;
  minOrderValue: number;
  maxDeliveryTime: number;
  isActive: boolean;
  freeDeliveryMinValue?: number;
  surchargeRules?: {
    nightSurcharge?: number;
    weekendSurcharge?: number;
    distanceSurcharge?: {
      baseDistance: number;
      extraFeePerKm: number;
    };
  };
};

export enum DeliveryAreaType {
  City = 'city',
  Exception = 'exception'
};

export interface IDeliveryArea {
  areaType: DeliveryAreaType; // Tipo do documento (cidade de atendimento ou exceção)
  companyId: Types.ObjectId; // ID da empresa proprietária da área de entrega
  name: string; // Nome da área de entrega (ex: "Centro", "Zona Sul")
  description?: string; // Descrição opcional da área
  priority: number; // Prioridade da área (1 = mais alta)
  geometry: DeliveryAreaGeometry; // Dados geoespaciais da área de entrega
  config: DeliveryConfig; // Configurações de entrega específicas desta área
  isActive: boolean; // Indica se a área está ativa
  createdAt: Date;
  updatedAt?: Date;
  version: string;
}