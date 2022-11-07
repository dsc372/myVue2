const strategies={}
const LIFECYCLE=['beforeCreate','created']

//生命周期函数的策略
LIFECYCLE.forEach(hook=>{
    strategies[hook]=function(parent,child){
        if(child){
            if(parent){
                return parent.concat(child)
            }else{
                return [child]
            }
        }else{
            return parent
        }
    }
})

//compontens的策略(child优先)
strategies.components=function(parent,child){
    const res=Object.create(parent)
    if(child){
        for(let key in child){
            res[key]=child[key]
        }
    }
    return res
}


export function mergeOptions(parent,child){
    function mergeField(key){
        if(strategies[key]){//策略模式，一种情况一个策略，减少ifelse
            options[key]=strategies[key](parent[key],child[key])
        }else{//默认合并，child优先级更高
            options[key]=child[key]||parent[key]
        }
    }
    const options={}
    for(let key in parent){
        mergeField(key)
    }
    for(let key in child){
        if(!parent.hasOwnProperty(key)){
            mergeField(key)
        }
    }
    return options
}