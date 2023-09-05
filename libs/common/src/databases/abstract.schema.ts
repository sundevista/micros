import { Prop, Schema } from '@nestjs/mongoose';
import { Transform } from 'class-transformer';
import { SchemaTypes, Types } from 'mongoose';

@Schema()
export class AbstractDocument {
  @Transform((value) => value.obj._id.toString())
  @Prop({ type: SchemaTypes.ObjectId })
  _id: Types.ObjectId;
}
