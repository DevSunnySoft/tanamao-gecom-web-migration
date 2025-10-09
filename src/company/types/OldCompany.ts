type City = {
  cityid: number;
  ibgeid: string;
  name: string;
  uf: string;
  countryid: number;
}

type BusinessCategory = {
  _id: string;
  createdat: Date;
  category: string;
  version: string;
  updatedat?: Date;
  urlicon?: string;
  homescreen: boolean;
  idx: number;
}

export interface OldCompany {
  _id: string
  createdat: Date
  updatedat?: Date
  isvisible: boolean
  name: string
  cities: Array<City>
  phone?: string
  uri?: string
  urilogo?: string
  cnpj: string
  minvalue: number
  businesscategoryid: Array<string>
  version: string
  deliveryfee: number
  isactive: boolean
  wildcards?: Array<string>
  paymethods?: Array<string>
  location: {
    address: string,
    utcoffset: string,
    geo?: {
      type: 'Point',
      coordinates: [number, number]
    }
  }
  avgdelivery: number
  isdeliveryactive: boolean
  islocalactive: boolean
  islocalreadonly: boolean
  avglocal: number
  usespotcash: boolean
  useonlinecash: boolean
  isclosed: boolean
  stylecolor: string
  businessscore?: number
  admphone?: string
  allowtemporaryusers: boolean
  allowtempusersdelivery: boolean
  banner?: {
    _id: string
    path: string
  }

  // new changes
  pingexpireat?: Date
  catalogindex: number
  catalogname?: string
  closeat?: Date
  businesshours?: string
  usemenu: boolean

  //virtual
  isopened?: boolean
  closeatwithtz?: string
  businesscategories?: Array<BusinessCategory>
  lastcommunicationat?: Date
  openedindex?: number

  // PIX
  pixtype?: string
  pixkey?: string
  pixkeytype?: string
  pixcontact?: string
  pixname?: string
}