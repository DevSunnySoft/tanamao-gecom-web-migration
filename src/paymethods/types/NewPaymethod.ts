import mongoose, { Schema, model, Types, Model } from 'mongoose';

export interface IPaymethod {
  _id: mongoose.Types.ObjectId
  description: string;
  isOnline: boolean;
  isLocal: boolean;
  code: 'CDD' | 'CDC' | 'DIN' | 'PIX';
  isActive: boolean;
  createdAt: Date;
  updatedAt?: Date;
  version: string;
}