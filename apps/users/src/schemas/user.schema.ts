import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { AbstractDocument, Encrypt, encryptMetadataKey } from '@app/common';
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

  @Encrypt()
  @Prop({ default: 'xxx' })
  key?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
/**
 * Array of encrypted (by {@link Encrypt} decorator) keys
 */
export const encryptedUserFields = (() => {
  const fakeEntity = new User();

  return Object.keys(UserSchema.obj).filter((key) =>
    Reflect.getMetadata(encryptMetadataKey, fakeEntity, key),
  );
})();
