import {Perhaps, None, Nothing, Problem, Something} from '../src';

describe('Perhaps', ()=> {
    describe('Perhaps.of', ()=> {
        test('nonempty values produce Something', ()=> {
            expect(Perhaps.of(123)).toBeInstanceOf(Something);
        });

        test('nulls produce Nothing', ()=> {
            expect(Perhaps.of(null)).toBe(Nothing);
        });

        test('undefineds produce Nothing', ()=> {
            expect(Perhaps.of(undefined)).toBe(Nothing);
        });

        test('empty strings produce Nothing', ()=> {
            expect(Perhaps.of('')).toBe(Nothing);
        });

        test('errors produce Somethings wrapping Errors, not Problems', ()=> {
            expect(Perhaps.of(new Error)).toBeInstanceOf(Something);
        });
    });

    describe('Perhaps.from', ()=> {
        test('given function returning nonempty value, produces Something', ()=> {
            const fn = ()=> 123;
            expect(Perhaps.from(fn)).toBeInstanceOf(Something);
        });

        test('given function returning nulls, produces Something', ()=> {
            const fn = ()=> null;
            expect(Perhaps.from(fn)).toBe(Nothing);
        });

        test('given function returning undefineds, produces Something', ()=> {
            const fn = ()=> undefined;
            expect(Perhaps.from(fn)).toBe(Nothing);
        });

        test('given function returning empty string, produces Something', ()=> {
            const fn = ()=> '';
            expect(Perhaps.from(fn)).toBe(Nothing);
        });

        test('given function *returning* Errors, produces a Something wrapping an Error, not a Problem', ()=> {
            const fn = ()=> new Error;
            expect(Perhaps.from(fn)).toBeInstanceOf(Something);
        });

        test('given function that throws, produces Problem', ()=> {
            const fn = ()=> {throw new Error}
            expect(Perhaps.from(fn)).toBeInstanceOf(Problem);
        });
    });

    describe('Perhaps.junction', ()=> {
        const one = Perhaps.of(1);
        const two = Perhaps.of(2);
        const adder = (a: number, b: number) => a + b;
        const problem = Problem.of(new Error);

        test('if an initial parameter is Nothing, returns Nothing', ()=> {
            const result = Perhaps.junction(Nothing, one, two, adder);
            expect(result).toBe(Nothing);
        });

        test('if an initial parameter is a Problem, returns Problem', ()=> {
            const result = Perhaps.junction(one, two, problem, adder);
            expect(result).toBe(problem);
        });

        test('if all initial parameters are Something, passes to join function and wraps the result', ()=> {
            const result = Perhaps.junction(one, two, adder);
            expect(result.unwrap()).toBe(3);
        });

        test('if join function throws error, wrap that error as a Problem', ()=> {
            const result = Perhaps.junction(one, two, ()=> {
                throw new Error;
            });
            expect(result).toBeInstanceOf(Problem);
        });
    });
})

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

    describe('is-checks', ()=> {
        test('is nothing', ()=> {
            expect(Nothing.isNothing()).toBe(true);
        });

        test('is not a error', ()=> {
            expect(Nothing.isProblem()).toBe(false)
        });
    })

    describe('map', ()=> {
        const mapper = jest.fn();
        const result = Nothing.map(mapper);

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
        test('returns alt value', ()=> {
            expect(Nothing.unwrapOr(456)).toBe(456);
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