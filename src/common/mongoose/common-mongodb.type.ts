import { Document, RootFilterQuery, SortOrder } from 'mongoose';

export interface FindOptions<T extends Document> {
  filter?: RootFilterQuery<T>;
  sort?: { [key: string]: SortOrder };
  limit?: number;
  skip?: number;
  deletedFilter?: boolean;
}
