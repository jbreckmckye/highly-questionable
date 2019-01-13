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

    describe('forOne', ()=> {
        test('does not invoke function', ()=> {
            const fn = jest.fn();
            Nothing.forOne(fn);
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('is-checks', ()=> {
        test('is nothing', ()=> {
            expect(Nothing.isNothing()).toBe(true);
        });

        test('is not a error', ()=> {
            expect(Nothing.isProblem()).toBe(false)
        });

        test('is not a something', ()=> {
            expect(Nothing.isSomething()).toBe(false);
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

        test('if passed function throws exception, return Problem', ()=> {
            const fn = ()=> {throw new Error};
            expect(Nothing.orFrom(fn)).toBeInstanceOf(Problem);
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
});

describe('Problem', ()=> {
    const err = new Error;
    const problem = Problem.of(err);

    describe('Problem.of', ()=> {
        test('wraps given error', ()=> {
            const err = new Error();
            const result = Problem.of(err);
            expect(result).toBeInstanceOf(Problem);
        });
    });

    describe('Problem.from', ()=> {
        test('wraps error returned from function', ()=> {
            const fn = ()=> new Error();
            const result = Problem.from(fn);
            expect(result).toBeInstanceOf(Problem);
        });

        test('will NOT handle error thrown by function', ()=> {
            const fn = ()=> {throw new Error()};
            const create = ()=> Problem.from(fn);
            expect(create).toThrow();
        });
    });

    describe('catch', ()=> {
        test('passes error to the handler', ()=> {
            const handler = jest.fn();
            problem.catch(handler);
            expect(handler).toHaveBeenCalledWith(err);
        });

        test('creates new Perhaps using handler response', ()=> {
            const getSomething = ()=> 123;
            const getNothing = ()=> null;
            expect(problem.catch(getSomething)).toBeInstanceOf(Something);
            expect(problem.catch(getNothing)).toBeInstanceOf(None);
        });

        test('handler may itself throw (or throw back original error) - should produce problem', ()=> {
            const getErr = ()=> {throw err};
            expect(problem.catch(getErr)).toBeInstanceOf(Problem);
        });
    });

    describe('forOne', ()=> {
        test('does not invoke function', ()=> {
            const fn = jest.fn();
            problem.forOne(fn);
            expect(fn).not.toHaveBeenCalled();
        });
    });

    describe('is-checks', ()=> {
        test('is not nothing', ()=> {
            expect(problem.isNothing()).toBe(false);
        });

        test('is not something', ()=> {
            expect(problem.isSomething()).toBe(false);
        });

        test('is a problem', ()=> {
            expect(problem.isProblem()).toBe(true);
        });
    });

    describe('map', ()=> {
        const mapper = jest.fn();
        const result = problem.map(mapper);

        test('mapper is not called', ()=> {            
            expect(mapper).not.toHaveBeenCalled();
        });

        test('returns the original problem', ()=> {
            expect(result).toBeInstanceOf(Problem);
        });
    });

    describe('or', ()=> {
        test('empty input returns Nothing', ()=> {
            expect(problem.or(null)).toBe(Nothing);
        });
        
        test('nonempty input returns Something', ()=> {
            expect(problem.or(123)).toBeInstanceOf(Something);
        });
    });

    describe('orFrom', ()=> {
        test('if passed function produces empty result, returns Nothing', ()=> {
            const fn = ()=> null;
            expect(problem.orFrom(fn)).toBe(Nothing);
        });

        test('if passed function produces non-empty result, returns Something', ()=> {
            const fn = ()=> 345;
            expect(problem.orFrom(fn)).toBeInstanceOf(Something);
        });

        test('if passed function throws exception, return Problem', ()=> {
            const fn = ()=> {throw new Error};
            expect(problem.orFrom(fn)).toBeInstanceOf(Problem);
        });
    });

    test('peek returns wrapped error', ()=> {
        expect(problem.peek()).toBe(err);
    });

    test('unwrap throws wrapped error', ()=> {
        const unwrap = ()=> problem.unwrap();
        expect(unwrap).toThrow(err);
    });

    test('unwrapOr returns alternate value', ()=> {
        expect(problem.unwrapOr(123)).toBe(123);
    });

    test('unwrapOrThrow throws alternate exception', ()=> {
        const altError = new Error;
        const action = ()=> problem.unwrapOrThrow(altError);
        expect(action).toThrow(altError);
    });
});

describe('Something', ()=> {
    const something = Perhaps.of(123);
    
    describe('catch', ()=> {
        test('returns the something', ()=> {
            const handler = jest.fn();
            expect(something.catch(handler)).toBe(something);
        });
    });

    describe('forOne', ()=> {
        const handler = jest.fn();
        handler.mockImplementation((input: number) => input + 1);

        const result = something.forOne(handler);

        test('calls handler with inner value', ()=> {            
            expect(handler).toHaveBeenCalledWith(123);
        });

        test('returns same something, unchanged', ()=> {
            expect(result).toBeInstanceOf(Something);
            expect(result.peek()).toBe(123);
        });
    });

    describe('is-checks', ()=> {
        test('is not nothing', ()=> {
            expect(something.isNothing()).toBe(false);
        });

        test('is something', ()=> {
            expect(something.isSomething()).toBe(true);
        });

        test('is not a problem', ()=> {
            expect(something.isProblem()).toBe(false);
        });
    });

    describe('map', ()=> {
        const start = Perhaps.of(123);

        const mapper = jest.fn();
        mapper.mockImplementation((input: number) => input + 1);

        const end = something.map(mapper);

        test('mapper is called with wrapped value', ()=> {            
            expect(mapper).toHaveBeenCalledWith(123);
        });

        test('returns a new something', ()=> {
            expect(end).toBeInstanceOf(Something);
            expect(end).not.toBe(start);
        });

        test('new something wraps result of map function', ()=> {
            expect(end.unwrap()).toBe(124);
        });
    });

    describe('or', ()=> {
        const start = Perhaps.of(123);
            const end = start.or(456);

        test('input disregarded and original returned', ()=> {
            expect(end).toBe(start);
            expect(end.unwrap()).toBe(123);
        });
    });

    describe('orFrom', ()=> {
        const start = Perhaps.of(123);

        const altFn = jest.fn();
        altFn.mockImplementation(()=> 456);

        const end = start.orFrom(altFn);

        test('original returned unchanged', ()=> {
            expect(end).toBe(start);
            expect(end.unwrap()).toBe(123);
        });

        test('altFn is not called', ()=> {
            expect(altFn).not.toHaveBeenCalled();
        });
    });

    test('peek returns wrapped value', ()=> {
        expect(something.peek()).toBe(123);
    });

    test('unwrap returns wrapped value', ()=> {
        expect(something.unwrap()).toBe(123);
    });

    test('unwrapOr returns original value', ()=> {
        expect(something.unwrapOr(456)).toBe(123);
    });

    test('unwrapOrThrow returns original value', ()=> {
        const result = something.unwrapOrThrow(new Error);
        expect(result).toBe(123);
    });
});