function ArrayCompress(config){
    this.config = config;s
}

ArrayCompress.prototype.compress = function(data){
    if(!Array.isArray(data)){
        throw new Error('compress expects array');
        return;
    }

    // collect all object keys
    var keys = [];
    data.forEach(function(item){
        if(typeof item === 'object'){
            keys = keys.concat(Object.keys(item));
        }
    });

    // unique keys
    keys = keys.filter(function(v,i){
        return keys.indexOf(v) === i
    });

    var compressed = data.map(function(item){
        if(typeof item === 'object'){
            return {
                c: keys.map(function(key){
                    return item[key];
                }),
            }
        } else {
            return {
                r: item,
            }
        }
    });

    return {
        ks: keys,
        vs: compressed,   
    };
}

ArrayCompress.prototype.decompress = function(data){
    if(typeof data !== 'object'){
        throw new Error('data must be object');
        return;
    }

    var keys = data.ks;

    var decompressed = data.vs.map(function(item){
        if(item.r){
            return item.r;
        } else {
            var ret = {};
            keys.forEach(function(key, i){
                ret[key] = item.c[i];
            });
            return ret;
        }
    });

    return decompressed;
}

if(typeof module === 'object'){
    module.exports = ArrayCompress;
} else {
    this['ArrayCompress'] = ArrayCompress;
}
