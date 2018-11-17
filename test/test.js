var assert = require('assert');
var chai = require('chai');
var ArrayCompress = require('../');

var expect = chai.expect;

var testCombinations = {
    'with default (undefined) config': {
        config: undefined,
        expanded: [{a: 1}, {a: null}, {a: '3'}],
        compact: {
            ks: ['a'],
            vs: [
                { c: [1] },
                { c: [null] },
                { c: [3] },
            ]
        }
    },
    
    'when data contains non-object': {
        config: undefined,
        expanded: [{a: 1}, 'haha'],
        compact: {
            ks: ['a'],
            vs: [
                { c: [1] },
                { r: 'haha' },
            ]
        }
    }
}

describe('ArrayCompress', function(){
    describe('compress', function(){
        it('should throw when non-array is passed', function(){
            var instance = new ArrayCompress();

            expect(function(){
                instance.compress('hello');
            }).to.throw();
            
        });

        Object.keys(testCombinations).forEach(function(testName){
            var test = testCombinations[testName];

            it(`should compress ${testName}`, function(){
                var instance = new ArrayCompress(test.config);
                assert.deepEqual(instance.compress(test.expanded), test.compact);
            });
        });
    });

    describe('decompress', function(){
        Object.keys(testCombinations).forEach(function(testName){
            var test = testCombinations[testName];

            it(`should decompress ${testName}`, function(){
                var instance = new ArrayCompress(test.config);
                assert.deepEqual(instance.decompress(test.compact), test.expanded);
            });
        });
    });
});
