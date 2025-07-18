import { ClsStore } from 'nestjs-cls';
import DataLoader from 'dataloader';
import { Request, Response } from 'express';

import { ClsStoreKey } from '../constants/cls.constant';

export interface AppClsStore extends ClsStore {
  [ClsStoreKey.DATA_LOADERS]: Record<string, DataLoader<string, any>>;
  [ClsStoreKey.REQUEST]?: Request;
  [ClsStoreKey.RESPONSE]?: Response;
  [key: string]: any;
}
