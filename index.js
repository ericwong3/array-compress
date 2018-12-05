function ArrayCompress(config){
    this.config = config;
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
            var compressed = [];
            var fieldMap = [];
            var needFieldMap = false;

            keys.forEach(function(key, keyIndex){
                if(item.hasOwnProperty(key)){
                    compressed.push(item[key]);
                    fieldMap[keyIndex] = true;
                } else {
                    fieldMap[keyIndex] = false;
                    needFieldMap = true;
                }
            });

            if(needFieldMap){
                return {
                    c: compressed,
                    m: ArrayCompress.helpers.boolArrayToHex(fieldMap),
                }
            } else {
                return {
                    c: compressed,
                }
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
        var ret = {};

        if(item.r){
            ret = item.r;
        } else if(item.m) { // if containing field map
            var map = ArrayCompress.helpers.hexToBoolArray(item.m);
            var counter = 0; // count progress in processing `c` array
            map.forEach(function(bool, keyIndex){
                if(bool){
                    ret[keys[keyIndex]] = item.c[counter++];
                }
            });
        } else {
            keys.forEach(function(key, i){
                ret[key] = item.c[i];
            });
        }

        return ret;
    });

    return decompressed;
}

ArrayCompress.helpers = {
    /**
     * Convert a hex string to an array of boolean, with less significant bit becomes start of array
     * E.g. '2c' (hex) => '00101100' (bin) => [f,f,t,f,t,t,f,f] (bool) => [f,f,t,t,f,t,f,f] (reversed, LSB first)
     */
    hexToBoolArray: function(hexString){
        return hexString.split('').reduce(function(acc, char){
            return acc.concat( ('0000' + parseInt(char, 16).toString(2)).substr(-4).split('').map(function(c){return c == '1'}) );
        }, []).reverse();
    },

    /**
     * Inverse of hexToBoolArray. Convert an array of boolean to hex string, with start of array becomes less significant bit
     * E.g. [f,f,t,t,f,t,f,f] => '2c'
     */
    boolArrayToHex: function(_boolArray){
        var boolArray = _boolArray.slice(); // copy
        for(var i = 0; i < ( 4 - boolArray.length % 4 ) % 4; i++){ // pad the array with false(0), at rightmost MSB, to 4n fields
            boolArray.push(false);
        }
        boolArray = boolArray.reverse(); // MSB to the left
        var ret = '';
        for(var i = 0; i < boolArray.length; i += 4){
            ret += parseInt( boolArray.slice(i, i + 4).map(function(b){return b ? '1' : '0'}).join(''), 2).toString(16);
        }
        return ret;
    },
}

if(typeof module === 'object'){
    module.exports = ArrayCompress;
} else {
    this['ArrayCompress'] = ArrayCompress;
}
