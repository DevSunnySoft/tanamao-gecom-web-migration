import mongoose, { ObjectId } from "mongoose"

type TMeasure = 'UN' | 'KG' | 'LT';
export type OldProductType = 'N' | 'C' | 'A' | 'I';

interface ProductPrices {
  cashpayment: number;
  defpayment?: number;
}

type TCategoryType = 'D' | 'F' | '';

export interface OldCategory {
  _id: mongoose.Types.ObjectId
  companyid: mongoose.Types.ObjectId
  sunnyid?: number
  name: string
  qtdselection: number
  qtdselchargehigher: number
  categorytype: TCategoryType
  parentcategory?: mongoose.Types.ObjectId
  version: string
  createdat: Date
  updatedat?: Date
  uriicon?: string
  isvisible: boolean
  catalogindex: number
  isdeliveryactive: boolean
  islocalactive: boolean
  idx: number
}

export interface OldProduct {
  _id: mongoose.Types.ObjectId
  categoryid: mongoose.Types.ObjectId
  companyid: mongoose.Types.ObjectId
  sunnyid: number
  product: string
  description: string
  barcode: string
  measure: TMeasure
  isactive: boolean
  producttype: OldProductType
  prices: ProductPrices
  supplymanagement: boolean
  stock: number
  images: Array<string>
  wildcards: Array<string>
  createdat: Date
  updatedat?: Date
  version: string
  isavailable: boolean
  isdeliveryactive: boolean
  islocalactive: boolean
  productsettingsid?: mongoose.Types.ObjectId

  //virutal
  settings?: {
    _id: mongoose.Types.ObjectId
    companyid: mongoose.Types.ObjectId
    productid: mongoose.Types.ObjectId
    specifications?: string
    version: string
    createdat: Date
    updatedat?: Date
    minqtd: number
    obs?: Array<{
      name: string
      group: string
      data: Array<string>
    }>
  }

  category?: OldCategory
  parentcategory?: OldCategory
  hasdiscount?: number
}

export interface OldProductAdditional {
  _id: ObjectId
  settingsid: ObjectId
  additionalid: ObjectId
  additionaltype: 'B' | 'Q' | 'N'
  maxqtd: number
  createdat: Date
  updatedat?: Date
  version: string
}

export interface OldProductComponent {
  _id: ObjectId
  settingsid: ObjectId
  name: string
  qtdselection: number
  selected: Array<ObjectId>
  idx: number
  action: 'N' | 'R' | 'A' | 'C'
  data: Array<{
    componentid: ObjectId
    qtd: number
    isdefault: boolean
    isvisible: boolean
    iseditable: boolean
    product?: any
  }> 
  createdat: Date
  updatedat?: Date
  version: string
}