import { createStore } from 'vuex';
import { resourceModule } from '../hooks/useResource'

export default createStore({
  state: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    [resourceModule.name]: resourceModule
  }
})
