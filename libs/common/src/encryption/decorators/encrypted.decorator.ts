export const encryptMetadataKey = Symbol('encrypt');

/**
 * Used to mark schemas property for encryption
 */
export function Encrypt() {
  return Reflect.metadata(encryptMetadataKey, true);
}
