// let handler ={
//   get: function(target, name){
//     if(name in target){
//       if(typeof(target[name] == 'function')){
//         return (...args) => {

//         }
//       }

//     }
//   }
// }

// var config ={
//   name: {data: '', async: false, timeout: 0}
// }

var ProxyService = function(obj, config){
    const FakeSuffix = 'Fake';

    const handler = {
      get: function(target, prop){
        if(prop in target){
          return typeof(target[prop]) == "function" ? function(...args){
            let start = performance.now();
            let result = target[prop].apply(target, ...args);
            if(result instanceof Promise || result && result.then){
              result.then(() => {
                let end = performance.now();
                console.info(`finish executing ${prop}(), ${end - start}ms`);
              })
            }
            else{
              let end = performance.now();
              console.info(`finish executing ${prop}(), ${end - start}ms`);
            }

            return result;
          } : target[prop];
        }
        else{
          if(prop.endsWith(FakeSuffix) && prop.replace(FakeSuffix, '') in target ){
            let fakeProp = prop.replace(FakeSuffix, '');
            let xxx = config[fakeProp].async ? () => new Promise((res, rej) => setTimeout(() => res(config[fakeProp].data), config[fakeProp].timeout)) : (...args) => config[fakeProp].data;
            return xxx;
          }
          
          throw(`no delegate found for ${name}`);
        }
      }
    }

    return new Proxy(obj, handler);
}

let o = {
  a: '123',
  b: '234',
  hello: function(fake, second){
    console.log('hello' + this.a, this.b);
    return 'hello real';
  },
  getUser: function(){
    return new Promise((res,rej) =>{
      setTimeout(() => {
        res(['realUser1', 'realUser2']);
      }, 3000);
    });
  }
}


//let p = new Proxy(o, handler);

var fakeMethod = {
  hello: {data: 'hello fake', async: false},
  getUser: {data: ['fakeUser1', 'fakeUser2'], async: true, timeout: 3000 }
}

o = ProxyService(o, fakeMethod);


console.log(o.a);
//console.log(o.c);
o.getUser().then((users) =>{
  console.log(users);
})

o.getUserFake().then((users) =>{
  console.log(users);
})