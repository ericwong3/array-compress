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
    },
    
    'while treating null, undefined and not defined properly': {
        config: undefined,
        expanded: [
            {a: 1,         b: 2,  c: 5},
            {a: 1,                         d: 3},
            {a: undefined, b: 7,           d: 8},
            {              b: 4,                  i: 11, j: undefined, k: 13},
            {a: 50,        b: 51, c: null, d: 53, i: 54, j: 55,        k: 56},
        ],
        compact: {
            ks: ['a','b','c','d','i','j','k'],
            vs: [
                { c: [1, 2, 5], m: '07' },
                { c: [1, 3], m: '09' },
                { c: [undefined, 7, 8], m: '0b' },
                { c: [4, 11, undefined, 13], m: '72'},
                { c: [50, 51, null, 53, 54, 55, 56] },
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

describe('ArrayCompress.helpers', function(){
    describe('hexToBoolArray', function(){
        it('"2c" => [false, false, true, true, false, true, false, false]', function(){
            assert.deepStrictEqual(
                ArrayCompress.helpers.hexToBoolArray('2c'),
                [false, false, true, true, false, true, false, false]
            );
        });
    });

    describe('boolArrayToHex', function(){
        it('[false, false, true, true, false, true, false, false] => "2c"', function(){
            assert.deepStrictEqual(
                ArrayCompress.helpers.boolArrayToHex([false, false, true, true, false, true, false, false]),
                '2c'
            );
        });
    });
});
