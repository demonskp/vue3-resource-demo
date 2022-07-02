export const name= 'api';

export function fackApi({page, pageSize}) {
  console.log("fackApi", {page, pageSize})
  return new Promise((resolve)=>{
    setTimeout(()=>{
      if(page===1) {
        resolve({
          name: 111,
          pageSize,
          msg: '成功'
        })
      } else {
        resolve({
          name: 222,
          pageSize,
          msg: '失败'
        })
      }
    }, 1000) 
  })
}

export function fackNoCatchApi(page=1) {
  console.log("fackNoCatchApi", page)
  return new Promise((resolve)=>{
    setTimeout(()=>{
      if(page===1) {
        resolve({
          name: 321,
          msg: '成功'
        })
      }else {
        resolve({
          name: 123,
          msg: '失败'
        })
      }
    }, 1000) 
  })
}

export function fackPageCathApi({pager}){
  return new Promise((resolve)=>{
    setTimeout(()=>{
      if(pager.page==1){
        resolve()
      }
    }, 1000)
  })
}