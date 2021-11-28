<template>
  <div class="about">
    <h1 @click="showSomething">This is an about page</h1>
    <div>{{ data?.name }}</div>
  </div>
</template>
<script>
import { useResource } from '../hooks/useResource';
import { fackApi } from '../api/index';
import { useStore } from 'vuex';
import { computed } from '@vue/reactivity';

export default {
  setup() {
    const store = useStore();

    const { loading, data, reLoading } = useResource('temp', fackApi);

    return {
      loading,
      data: data,
      reLoading,
      ppp: computed(()=>store.state.RESOURCE_CACHE_MODULE.RESOURCE_CACHE_MODULE),
      showSomething(){
        console.log(this.data, this.ppp);
        this.reLoading(2);
      }
    }
  },
}
</script>
