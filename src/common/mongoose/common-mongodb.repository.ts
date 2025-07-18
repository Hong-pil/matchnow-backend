import { Model, RootFilterQuery, UpdateQuery, PipelineStage, Document } from 'mongoose';
import { ObjectId } from 'mongodb';

import { FindOptions } from './common-mongodb.type';

export class CommonMongodbRepository<DocumentType extends Document> {
  constructor(private readonly model: Model<DocumentType>) {}

  private getDefaultDeleteFilter() {
    return {
      $or: [{ deletedAt: { $exists: false } }, { deletedAt: null }, { deletedAt: { $gt: new Date() } }],
    };
  }

  async create<T extends object>(entity: T): Promise<DocumentType> {
    return this.model.create(entity);
  }

  async updateOne(filter: RootFilterQuery<DocumentType>, updated: UpdateQuery<DocumentType>) {
    return this.model.updateOne(filter, updated, { new: true }).exec();
  }

  async updateById(id: ObjectId, updated: UpdateQuery<DocumentType>) {
    return this.model.findByIdAndUpdate(id, updated, { new: true }).exec();
  }

  async find(filter: RootFilterQuery<DocumentType>) {
    return this.model.find(filter).exec();
  }

  async findById(id: ObjectId) {
    return this.model.findById(id).exec();
  }

  async findAll({ filter: _filter = {}, sort, skip, limit, deletedFilter = false }: FindOptions<DocumentType>) {
    let filter = _filter;

    if (deletedFilter) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      filter = { ...filter, ...this.getDefaultDeleteFilter() };
    }

    const query = this.model.find(filter);

    if (sort) {
      query.sort(sort);
    }

    if (skip) {
      query.skip(skip);
    }

    if (limit) {
      query.limit(limit);
    }

    const [results, totalCount] = await Promise.all([query.exec(), this.model.countDocuments(filter)]);

    return { results, totalCount };
  }

  async aggregate(pipeline: PipelineStage[]): Promise<any[]> {
    return this.model.aggregate(pipeline).exec();
  }
}
