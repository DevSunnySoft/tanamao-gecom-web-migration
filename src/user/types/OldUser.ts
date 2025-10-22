import { Types } from "mongoose"

export type ICity = {
  _id: string
  cityid: number
  ibgeid: string
  name: string
  uf: string
  countryid: number
  utcoffset: number
}

export type TMethod = 'self' | 'facebook' | 'gmail';

export interface OldUser {
  _id: Types.ObjectId
  companyid?: string
  customerid?: string
  sunnyid?: number
  name: string
  username: string
  password: string
  isactive: boolean
  isadmin: boolean
  isconfirmed: boolean
  method: TMethod
  photourl?: string
  updatedat?: Date
  createdat: Date
  version: string
  cpf?: string
  istemporary: boolean
  phone?: string
  expireat?: Date
  dashboardpushsubscription?: {
    endpoint: string,
    expirationTime: Date
    keys: {
      p256dh: string
      auth: string
    }
  }
  pushsubscription?: Array<{
    endpoint: string,
    expirationTime: Date
    keys: {
      p256dh: string
      auth: string
    }
  }>
  addresses?: Array<{
    street: string,
    number: string,
    reference: string,
    complement: string
    city: ICity
    zipcode: string,
    neighborhood: string
  }>
}