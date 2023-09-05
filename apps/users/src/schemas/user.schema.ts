import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument } from '@app/common';
import { Exclude } from 'class-transformer';

@Schema({ versionKey: false })
export class User extends AbstractDocument {
  @Prop()
  firstName: string;

  @Prop()
  lastName: string;

  @Prop({ unique: true, index: true })
  email: string;

  @Exclude()
  @Prop()
  password: string;

  @Exclude()
  @Prop()
  partnerKey: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
