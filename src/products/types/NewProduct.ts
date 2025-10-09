import { Types } from "mongoose";

export enum ProductType {
  NORMAL,
  VARIATION,
  COMBO,
  PIZZA,
  INGREDIENT,
  SUB_PRODUCT,
  ADDITIONAL,
  BORDER,
  DOUGH
};

export type ProductMeasure = 'UN' | 'KG' | 'LT';

export interface IProductVariationOption {
  name: string;
  price: number;
  pdvId: string;
  variationItemPdvId: string;
  qtdSelection: number;
  qtdSelectionChargeHigher: number;
}

export interface IProductVariation {
  pdvId: string;
  name: string;
  options: IProductVariationOption[];
}

export interface IProductComplementItem {
  pdvId: string;
  product: string;
  description: string;
  barCode?: string | null;
  variations?: IProductVariation;
  price?: number;
  thumbnails: string[];
  modifiers?: any;
  isSelected?: boolean;
}

export interface IProductComplement {
  pdvId?: string;
  name: string;
  qtdSelection: number;
  isRequired: boolean;
  groupId: string;
  items: IProductComplementItem[];
}

export interface ICategory {
  _id?: Types.ObjectId;
  companyId: Types.ObjectId;
  pdvId?: string;
  name: string;
  index: number;
  urlIcon?: string;
  isVisible?: boolean;
  catalogIndex?: number;
  isDeliveryActive?: boolean;
  isLocalActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IProduct {
  _id?: Types.ObjectId;
  categoriesIds: Types.ObjectId[];
  companyId: Types.ObjectId;
  pdvId: string;
  product: string;
  description: string;
  barCode: string;
  measure: ProductMeasure;
  isActive: boolean;
  variations: IProductVariation;
  supplyManagement: boolean;
  images: string[];
  thumbnails: string[];
  wildcards: string[];
  isAvailable: boolean;
  isDeliveryActive: boolean;
  isLocalActive: boolean;
  catalogIndex?: number;
  productType: ProductType;
  maxQtd: number;
  ifoodId?: string;
  complements: IProductComplement[];
  createdAt?: Date;
  updatedAt?: Date;
  version: string;
}

export interface ICatalogShortcut {
  companyId: Types.ObjectId;
  productId?: Types.ObjectId;
  name: string;
  photo: string;
  description: string;
  prices: number[];
  productType: ProductType;
  isActive: boolean;
  isAvailable: boolean;
  isDeliveryActive: boolean;
  isLocalActive: boolean;
  categoryId: Types.ObjectId;
  variationId?: string;
  variationItemsPdvId: string[];
  wildcards?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}