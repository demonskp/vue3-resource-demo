import { useStore } from "vuex";
import { ref,  computed, onUnmounted } from 'vue'
import localforage from "localforage";

export const RESOURCE_CACHE_MODULE = 'RESOURCE_CACHE_MODULE';
export const RESOURCE_CACHE_DELETE = 'RESOURCE_CACHE_DELETE';
export const RESOURCE_CACHE_SAVE = 'RESOURCE_CACHE_SAVE';
export const LOAD_ALL_PERSISTENCE_DATA = 'LOAD_ALL_PERSISTENCE_DATA';

export const PERSISTENCE_DATA_KEYS = [
  getRealKey('temp', 'fackApi'),
]

export const resourceModule = {
  name: RESOURCE_CACHE_MODULE,
  state:()=>{
    return {
      [RESOURCE_CACHE_MODULE]:{}
    }
  },
  mutations:{
    [RESOURCE_CACHE_DELETE]: (state, payload)=>{
      if(payload.realKey) return;
      state[RESOURCE_CACHE_MODULE][payload.realKey] = null;
    },
    [RESOURCE_CACHE_SAVE]: (state, payload)=>{
      const { realKey, data, isPersistence} = payload ||{};
      if(!realKey) return;
      state[RESOURCE_CACHE_MODULE][realKey] = data;
      if(isPersistence) {
        localforage.setItem(realKey, data);
      }
    },
  },
  actions:{
    // 加载所有持久化数据
    [LOAD_ALL_PERSISTENCE_DATA]: async (context)=>{
      PERSISTENCE_DATA_KEYS.forEach(async (realKey)=>{
        const realValue = await localforage.getItem(realKey);
        context.commit(RESOURCE_CACHE_SAVE,{
          realKey, data:realValue,
        })
      })
    }
  }
}

/**
 * 加载所有持久化的数据
 * @param {import('vuex').Store} store VuexStore
 */
export function loadAllPersistenceData(store) {
  store.dispatch(LOAD_ALL_PERSISTENCE_DATA);
}

function getRealKey(key, serviceName) {
  return key+'-'+serviceName;
}

function getCache(store, realKey) {
  const cacheValue = store.state?.[RESOURCE_CACHE_MODULE]?.[RESOURCE_CACHE_MODULE]?.[realKey];

  return cacheValue;
}

function deleteCache(store, realKey) {
  store.dispatch(RESOURCE_CACHE_DELETE, {
    realKey,
  });
}

function setCache(store, realKey, data, isPersistence) {
  store.commit(RESOURCE_CACHE_SAVE, {
    realKey,
    data,
    isPersistence
  })
}

/**
 * @typedef {Object} ResourceDef
 * @property {bool} loading 请求是否结束
 * @property {import('vue').ComputedRef} data 请求结束
 * @property {bool} err 请求错误
 * @property {Function} reLoading 重新请求
 */

/**
 * 缓存值请求
 * @param {String} key 缓存key
 * @param {Function} service 返回值为Promise的接口
 * @param {{save}} options 配置项
 * @returns {ResourceDef}
 */
export function useResource(key, service, params, options={save:false}){
  const realKey = getRealKey(key, service.name);
  const store = useStore();
  let resultValue = computed(()=>getCache(store, realKey));
  let error = ref(null);
  let loading = ref(false);

  const isPersistence = PERSISTENCE_DATA_KEYS.find((key)=>key===realKey);

  const fetchData = (realParams)=>{
    loading.value = true;
    service(realParams).then((data)=>{
      setCache(store, realKey, data, isPersistence);
    }).catch((err)=>{
      error.value = err;
    }).finally(()=>{
      loading.value = false;
    });
  }

  const reLoading = (reloadParams=params)=>{
    fetchData(reloadParams);
  }

  if(!resultValue.value || isPersistence) {
    fetchData(params);
  }

  if(options.save) {
    onUnmounted(()=>{
      deleteCache(store, realKey);
    })
  }

  return {
    loading,
    data: resultValue,
    err: error,
    reLoading,
  }
}