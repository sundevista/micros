export const encryptMetadataKey = Symbol('encrypt');

export function Encrypt() {
  return Reflect.metadata(encryptMetadataKey, true);
}
