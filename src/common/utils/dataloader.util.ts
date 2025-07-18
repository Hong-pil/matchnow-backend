import * as DataLoader from 'dataloader';
import { Document, FilterQuery, Types } from 'mongoose';
import { indexBy } from '@fxts/core';

export type ContextDataLoaders = Record<string, DataLoader<string, any>>;

interface BatchRepository<DocumentType extends Document> {
  find: (filter: FilterQuery<DocumentType>) => DocumentType[] | Promise<DocumentType[]>;
}

export enum DataLoaderKeyFieldType {
  string = 'string',
  objectId = 'ObjectId',
}

export interface DataLoaderOptions<DocumentType extends Document> {
  keyFieldType?: DataLoaderKeyFieldType;
  keyField?: string;
  filter?: FilterQuery<DocumentType>;
  dataLoaderName?: string;
  batchCallback?: (keys: readonly any[]) => Promise<DocumentType[]>;
}

export function createBatchFunction<DocumentType extends Document<any>>(repository: BatchRepository<DocumentType>) {
  return async (ids: readonly string[]) => {
    const filter: FilterQuery<DocumentType> = {
      _id: { $in: ids.map((id) => new Types.ObjectId(id)) },
    };

    const entities: DocumentType[] = await repository.find(filter);
    const entityMap = indexBy((entity) => entity._id.toString(), entities);

    return ids.map((id) => entityMap[id] ?? null);
  };
}

export function createKeyFilterBatchFunction<DocumentType extends Document<any>>(
  repository: BatchRepository<DocumentType>,
  dataLoaderOptions: DataLoaderOptions<DocumentType>,
) {
  const { keyField = '', filter: _filter, keyFieldType } = dataLoaderOptions;

  return async (keys: readonly (string | number)[]) => {
    const keyFilter: FilterQuery<unknown> = {
      [keyField]: {
        $in: keyFieldType === DataLoaderKeyFieldType.objectId ? keys.map((key) => new Types.ObjectId(key)) : keys,
      },
    };
    const filter: FilterQuery<DocumentType> = _filter ? { $and: [keyFilter, _filter] } : keyFilter;

    const entities: DocumentType[] = await repository.find(filter);
    const entityMap = indexBy((entity) => entity[keyField as any]?.toString(), entities);

    return keys.map((key) => entityMap[key] ?? null);
  };
}

function getBatchFunction<DocumentType extends Document>(
  repository: BatchRepository<DocumentType>,
  dataLoaderOptions?: DataLoaderOptions<DocumentType>,
) {
  if (dataLoaderOptions?.batchCallback) {
    return dataLoaderOptions.batchCallback;
  }

  if (dataLoaderOptions?.keyField) {
    return createKeyFilterBatchFunction<DocumentType>(repository, dataLoaderOptions);
  }

  return createBatchFunction<DocumentType>(repository);
}

export function getDataLoader<DocumentType extends Document>(
  dataLoaders: ContextDataLoaders,
  repository: BatchRepository<DocumentType>,
  dataLoaderOptions?: DataLoaderOptions<DocumentType>,
) {
  const { keyField } = dataLoaderOptions || {};

  // UsersRepository -> usersLoader
  const dataLoaderName =
    dataLoaderOptions?.dataLoaderName ||
    repository.constructor.name.toLocaleLowerCase().replace('repository', '') +
      'Loader' +
      (keyField ? `_${keyField}` : '');

  if (!dataLoaders?.[dataLoaderName]) {
    dataLoaders[dataLoaderName] = new DataLoader<string, DocumentType>(
      getBatchFunction<DocumentType>(repository, dataLoaderOptions),
    );
  }

  return dataLoaders[dataLoaderName];
}
