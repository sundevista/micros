import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class HttpCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async clearCache(keys: string[]): Promise<void> {
    const storedKeys = await this.cacheManager.store.keys();
    storedKeys.forEach((key) => {
      if (keys.some((v) => key.startsWith(v))) {
        this.cacheManager.del(key);
      }
    });
  }
}
