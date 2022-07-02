import { useStore } from "vuex";
import { ref,  computed, onUnmounted, watch } from 'vue'
import localforage, { key } from "localforage";

export const RESOURCE_CACHE_MODULE = 'RESOURCE_CACHE_MODULE';
export const RESOURCE_CACHE_DELETE = 'RESOURCE_CACHE_DELETE';
export const RESOURCE_CACHE_SAVE = 'RESOURCE_CACHE_SAVE';
export const LOAD_ALL_PERSISTENCE_DATA = 'LOAD_ALL_PERSISTENCE_DATA';

export const PERSISTENCE_DATA_KEYS = []

export const resourceModule = {
  name: RESOURCE_CACHE_MODULE,
  state:()=>{
    return {
      [RESOURCE_CACHE_MODULE]:{}
    }
  },
  mutations:{
    [RESOURCE_CACHE_DELETE]: (state, payload)=>{
      if(!payload.realKey||!payload.realKey[0]) return;
      delete state[RESOURCE_CACHE_MODULE][payload.realKey[0]];
    },
    [RESOURCE_CACHE_SAVE]: (state, payload)=>{
      const { realKey=[], data} = payload ||{};
      if(!realKey || !realKey.length) return;
      let armObj = state[RESOURCE_CACHE_MODULE];
      realKey.forEach((key, index)=>{
        if(index===realKey.length-1){
          armObj[key] = data;
          return;
        }
        if(!armObj[key]){
          armObj[key] = {};
          armObj = armObj[key];
          return;
        }
        if(armObj[key]){
          armObj = armObj[key];
        }
      });
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

function getRealKey(serviceName, params) {
  const keyArr = [serviceName]
  if(params){
    keyArr.push(JSON.stringify(params));
  }
  return keyArr;
}

function getCache(store, realKey) {
  let keyArr = [];
  if(typeof realKey === "string"){
    keyArr.push(realKey);
  }
  if(Array.isArray(realKey)){
    keyArr = realKey;
  }

  let result = store.state?.[RESOURCE_CACHE_MODULE]?.[RESOURCE_CACHE_MODULE];
  keyArr.forEach(key=>{
    result = result?.[key];
  })

  return result;
}

function deleteCache(store, realKey) {
  store.commit(RESOURCE_CACHE_DELETE, {
    realKey,
  });
}

function setCache(store, realKey, data) {
  store.commit(RESOURCE_CACHE_SAVE, {
    realKey,
    data,
  })
}

function createPagerParams(params) {
  if(!params?.page){
    return params;
  }

  const {page} = params;
  return {...params, page:page+1 }
}

function mergePageData(old, newData) {
  return [...old, ...newData];
}

/**
 * @typedef {Object} ResourceDef
 * @property {bool} loading 请求是否结束
 * @property {import('vue').ComputedRef} data 请求结束
 * @property {Error} err 请求错误
 * @property {Function} reLoading 重新请求
 * @property {Function} setData 设置数据
 * @property {Function} loadMore 加载下一页
 */

/**
 * 缓存值请求
 * @param {Function} service 返回值为Promise的接口
 * @param {Object} options 配置项
 * @param {import("vue").Ref<Object>} params 请求相关参数
 * @param {Boolean} options.cleanAfter 组件卸载后清除数据
 * @param {Boolean} options.noFatch 不直接进行请求
 * @returns {ResourceDef}
 */
export function useResource(service, params, options={cleanAfter:false, noFatch:false}){
  const realKey = computed(()=>getRealKey(service.name, params));
  const store = useStore();
  let resultValue = computed(()=>getCache(store, realKey.value));
  let error = ref(null);
  let loading = ref(false);

  if(params){
    watch(params, ()=>{
      reLoading(params);
    })
  }
 

  const fetchData = async (realParams)=>{
    loading.value = true;
    try {
      const data = await service(realParams);
      return data;
    } catch (err) {
      error.value = err;
    } finally {
      loading.value = false;
    }
    return null;
  }

  const reLoading = async (reloadParams=params)=>{
    const data = await fetchData(reloadParams);
    setCache(store, realKey.value, data);
  }

  const setData = (newData)=>{
    setCache(store, realKey.value, newData);
  }

  const loadMore = async (reloadParams=params, merge=mergePageData)=>{
    const data = await fetchData(createPagerParams(reloadParams));
    setCache(store, realKey.value, merge(resultValue, data));
  }

  const onFetch = (callBack)=>{
    
  }

  if((!resultValue.value)&&!options.noFatch) {
    reLoading();
  }

  if(options.cleanAfter) {
    onUnmounted(()=>{
      deleteCache(store, realKey.value);
    })
  }

  return {
    loading,
    data: resultValue,
    err: error,
    reLoading,
    setData,
    loadMore
  }
}