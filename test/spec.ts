import {Perhaps, None, Nothing, Problem, Something} from '../src';

describe('Nothing', ()=> {
    describe('catch', ()=> {
        const handler = jest.fn();
        const result = Nothing.catch(handler);

        test('handler not invoked - there is no error', ()=> {
            expect(handler).not.toHaveBeenCalled();
        });

        test('returns Nothing again', ()=> {
            expect(result).toBe(Nothing);
        });
    });

    describe('flatmap', ()=> {
        const mapper = jest.fn();
        const result = Nothing.flatMap(mapper);

        test('mapper is not invoked', ()=> {            
            expect(mapper).not.toHaveBeenCalled();
        });

        test('returns Nothing again', ()=> {
            // "Nothing will come of nothing. Speak again" - King Lear
            expect(result).toBe(Nothing);
        });
    });

    describe('map', ()=> {
        const mapper = jest.fn();
        const result = Nothing.flatMap(mapper);

        test('mapper is not invoked', ()=> {            
            expect(mapper).not.toHaveBeenCalled();
        });

        test('returns Nothing again', ()=> {
            expect(result).toBe(Nothing);
        });
    });

    describe('or', ()=> {
        test('empty input returns Nothing', ()=> {
            expect(Nothing.or(null)).toBe(Nothing);
        });
        
        test('nonempty input returns Something', ()=> {
            expect(Nothing.or(123)).toBeInstanceOf(Something);
        });
    });

    describe('orFrom', ()=> {
        test('if passed function produces empty result, returns Nothing', ()=> {
            const fn = jest.fn();
            fn.mockImplementation(()=> null);
            expect(Nothing.orFrom(fn)).toBe(Nothing);
        });

        test('if passed function produces non-empty result, returns Something', ()=> {
            const fn = jest.fn();
            fn.mockImplementation(()=> 345);
            expect(Nothing.orFrom(fn)).toBeInstanceOf(Something);
        });
    });

    describe('peek', ()=> {
        test('returns null', ()=> {
            expect(Nothing.peek()).toBe(null);
        });

        test('...even if the Nothing came from None.of(someOtherEmptyType)', ()=> {
            const nothing = None.of('');
            expect(nothing.peek()).toBe(null);
        });
    });

    describe('unwrap', ()=> {
        test('returns null', ()=> {
            expect(Nothing.unwrap()).toBe(null);
        });

        test('...even if the Nothing came from None.of(someOtherEmptyType)', ()=> {
            const nothing = None.of('');
            expect(nothing.unwrap()).toBe(null);
        });
    });

    describe('unwrapOr', ()=> {
        test('if alt value nonempty, returns alt', ()=> {
            expect(Nothing.unwrapOr(456)).toBe(456);
        });

        test('if alt value empty, returns null, even if alt a different empty kind', ()=> {
            expect(Nothing.unwrapOr('')).toBe(null);
        });
    });

    describe('unwrapOrThrow', ()=> {
        test('always throws the error', ()=> {
            const exc = new Error;
            const action = ()=> {
                Nothing.unwrapOrThrow(exc)
            };
            expect(action).toThrow(exc);
        });
    });

})