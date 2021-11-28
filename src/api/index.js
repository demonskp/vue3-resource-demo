export const name= 'api';

export function fackApi(page=1) {
  return new Promise((resolve)=>{
    setTimeout(()=>{
      console.log(11111111111)
      if(page===1) {
        resolve({
          name: 111,
          msg: '成功'
        })
      }else {
        resolve({
          name: 222,
          msg: '失败'
        })
      }
    }, 1000) 
  })
}