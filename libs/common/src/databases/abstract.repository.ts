import {
  Connection,
  FilterQuery,
  Model,
  SaveOptions,
  Types,
  UpdateQuery,
} from 'mongoose';
import { AbstractDocument } from './abstract.schema';
import { Logger, NotFoundException } from '@nestjs/common';

/**
 * Used to create basic mongo repository
 */
export abstract class AbstractRepository<TDocument extends AbstractDocument> {
  protected readonly logger: Logger;

  constructor(
    protected readonly model: Model<TDocument>,
    private readonly connection: Connection,
  ) {}

  /**
   * Used to create a new document
   *
   * @param document document to save
   * @param options save options
   * @returns saved document
   */
  async create(
    document: Omit<TDocument, '_id'>,
    options?: SaveOptions,
  ): Promise<TDocument> {
    const createdDocument = new this.model({
      ...document,
      _id: new Types.ObjectId(),
    });
    return (
      await createdDocument.save(options)
    ).toJSON() as unknown as TDocument;
  }

  /**
   * Used to find single document that matches filters
   *
   * @param filterQuery filter to search for document
   * @returns single document
   */
  async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
    const document = await this.model.findOne(filterQuery, {}, { lean: true });

    if (!document) {
      this.logger.warn(
        `Document not found with filterQuery: ${JSON.stringify(filterQuery)}`,
      );
      throw new NotFoundException('Document not found');
    }

    return document as TDocument;
  }

  /**
   * Used to find and update existing document
   *
   * @param filterQuery filters to search for document
   * @param update update document
   * @returns updated document
   */
  async findOneAndUpdate(
    filterQuery: FilterQuery<TDocument>,
    update: UpdateQuery<TDocument>,
  ): Promise<TDocument> {
    const document = await this.model.findOneAndUpdate(filterQuery, update, {
      lean: true,
      new: true,
    });

    if (!document) {
      this.logger.warn(`Document not found with filterQuery: ${filterQuery}`);
      throw new NotFoundException('Document not found');
    }

    return document as TDocument;
  }

  /**
   * Used to create (if not exists) or update document
   *
   * @param filterQuery filters to search for document
   * @param update update document
   * @returns updated document
   */
  async upsert(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ): Promise<TDocument> {
    return (await this.model.findOneAndUpdate(filterQuery, document, {
      lean: true,
      upsert: true,
      new: true,
    })) as TDocument;
  }

  /**
   * Used to find documents
   *
   * @param filterQuery filter to search for documents
   * @returns documents
   */
  async find(filterQuery: FilterQuery<TDocument>) {
    return this.model.find(filterQuery, {}, { lean: true });
  }

  /**
   * Used to delete single document
   *
   * @param filterQuery filter to search for document
   */
  async delete(filterQuery: FilterQuery<TDocument>): Promise<void> {
    return this.model.findOneAndDelete(filterQuery);
  }

  /**
   * Used to start mongodb transaction
   *
   * @returns transaction session
   */
  async startTransaction() {
    const session = await this.connection.startSession();
    session.startTransaction();
    return session;
  }
}
