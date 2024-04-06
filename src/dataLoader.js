/**
 * @param {Number} cacheTime Cache Time (Second)
 */
export function Loader(cacheTime) {
  const namespace = "ImkenDataLoader";

  Object.assign(this, {
    cacheTime,

    async get(src, refresh = false) {
      const cacheKey = `${namespace}:${src}`;
      const cachedData = localStorage.getItem(cacheKey);
      if (!refresh && cachedData !== null) {
        const { data, timestamp } = JSON.parse(cachedData);
        if (Date.now() - timestamp < this.cacheTime * 1000) {
          return data;
        }
      }

      const newData = await import(src);
      this.updateCache(cacheKey, newData);
      return newData;
    },

    updateCache(cacheKey, data) {
      const timestamp = Date.now();
      const cacheData = {
        data,
        timestamp,
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    },

    async clear() {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith(namespace + ":")) {
          localStorage.removeItem(key);
        }
      }
    },
  });
}
