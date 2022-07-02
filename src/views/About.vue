<script setup >
import { useResource } from '../hooks/useResource';
import { fackApi, fackNoCatchApi } from '../api/index';
import { reactive } from '@vue/reactivity';

const params = reactive({page:1,pageSize:2});

const { data, reLoading, setData } = useResource(fackApi, params, {cleanAfter:true});
const { data:noCacheData, reLoading: noCacheReload } = useResource(fackNoCatchApi);

const showSomething = ()=>{
  params.page = 2;
}
const reSetData = ()=>{
  setData({
          name: 333,
          msg: '成功'
        })
}
</script>

<template>
  <div class="about">
    <h1 @click="showSomething">This is an about page</h1>
    <h2 @click="reSetData">手动设置</h2>
    <div>{{ data?.name }}</div>
    <div @click="noCacheReload">{{noCacheData?.name }}</div>
    <div>
      <span @click="reLoading()">参数：{{params}}</span>
    </div>
  </div>
</template>
