import mongoose from "mongoose"

export interface OldPaymethod {
  _id: mongoose.Types.ObjectId
  createdat: Date
  updatedat?: Date
  version: string
  description: string
  onlinecash: boolean
  spotcash: boolean
  code: string
  isactive: boolean
}