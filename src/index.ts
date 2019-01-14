export abstract class Perhaps<T> {
    abstract catch(handler: (err: Error) => T): Perhaps<T>

    abstract forEach(fn: (input: any) => any): Perhaps<T>

    abstract forOne(fn: (input: T) => any): Perhaps<T>

    abstract map<U=T>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U>

    abstract mapEach<U>(mapper: (input: any) => U | Perhaps<U>): Perhaps<Array<U>|U>

    abstract or(alt: T): Perhaps<T>

    abstract orFrom(fn: ()=> T | never): Perhaps<T>

    abstract peek(): T | null | Error

    abstract unwrap(): T | null

    abstract unwrapOr(alt: T): T

    abstract unwrapOrThrow(err: Error): T | never

    static junction<U>(...args: Array<Perhaps<U>|Function>): Perhaps<U> {
        const join = args.pop() as Function;
        const maybes = args as Array<Perhaps<U>>;
        const joinInputs: Array<U> = [];        

        for (let i = 0; i < maybes.length; i++) {
            const maybe = maybes[i];

            if (maybe instanceof Something) {
                joinInputs.push(maybe.unwrap());

            } else if (maybe instanceof Problem) {
                return maybe;
            
            } else if (maybe instanceof None) {
                return maybe;

            } else {
                throw new Error('Illegal junction parameter');
            }
        }

        try {
            const result = join(...joinInputs);
            return Perhaps.of(result);
        } catch (err) {
            return new Problem(err);
        }
    }

    static of<U>(input: U | Perhaps<U>): Perhaps<U> {
        if (input instanceof None) {
            return input;

        } else if (input instanceof Problem) {
            return input;

        } else if (input instanceof Something) {
            return input as Perhaps<U>;

        } else if (isEmpty(input)) {
            return Nothing as Perhaps<U>;

        } else {
            return new Something<U>(input as U);
        }
    }

    static from<U>(fn: ()=> U): Perhaps<U> {
        try {
            const value = fn();
            return Perhaps.of(value);
        } catch (err) {
            return new Problem(err);
        }
    }
};

export class None extends Perhaps<null> {
    static of = (input: any): None => Nothing;

    static from = (fn: any): None => Nothing;

    public catch = (fn: any): None => Nothing;

    public forEach = (fn: any): None => Nothing;

    public forOne = (fn: any): None => Nothing;

    public map = (fn: any): None => Nothing;

    public mapEach = (fn: any): None => Nothing;

    public or<U>(alt: U): Perhaps<U> {
        return Perhaps.of(alt);
    }

    public orFrom<U>(fn: ()=> U | never) {
        return Perhaps.from(fn);
    }

    public peek = (): null => null;

    public unwrap = (): null => null;

    public unwrapOr<T>(alt: T): T {
        return alt;
    }

    public unwrapOrThrow(err: Error): never {
        throw err;
    }
}

export const Nothing = new None();

export class Problem implements Perhaps<any> {
    private err: Error;

    constructor(err: Error) {
        this.err = err;
    }

    static of(err: Error): Problem {
        return new Problem(err);
    }

    static from(fn: ()=> Error) {
        return new Problem(fn());
    }

    public catch<T>(handler: (err: Error) => T): Perhaps<T> {
        return Perhaps.from(()=> handler(this.err));
    }

    public forEach = (fn: any) => this;

    public forOne = (fn: any) => this;

    public map = (fn: any) => this;

    public mapEach = (fn: any) => this;

    public or<U>(alt: U): Perhaps<U> {
        return Perhaps.of(alt);
    }

    public orFrom<U>(fn: ()=> U | never) {
        return Perhaps.from(fn);
    }

    public peek(): Error {
        return this.err;
    }

    public unwrap(): never {
        throw this.err;
    }

    public unwrapOr<T>(alt: T): T {
        return alt;
    }

    public unwrapOrThrow(err: Error): never {
        throw err;
    }
}

export class Something<T> implements Perhaps<T> {
    private value: T;

    constructor(input: T) {
        this.value = input;
    }

    static of<T>(input: T) {
        return new Something(input);
    }

    static from<T>(fn: ()=> T) {
        try {
            return new Something(fn());
        } catch (err) {
            return new Problem(err);
        }
    }

    public catch = (fn: any)=> this;

    public forEach(fn: (input: any) => any) {
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                try {
                    fn(this.value[i]);
                } catch (err) {
                    return new Problem(err);
                }
            }
        } else {
            try {
                fn(this.value);
            } catch (err) {
                return new Problem(err);
            }            
        }
        return this;
    }

    public forOne(fn: (input: T) => any) {
        try {
            fn(this.value);
            return this;
        } catch (err) {
            return new Problem(err);
        }
    }

    public map<U>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U> {
        try {
            const result = mapper(this.value);
            return Perhaps.of(result);
        } catch (err) {
            return new Problem(err);
        }
    }

    public mapEach = <U>(mapper: (input: any) => U | Perhaps<U>): Perhaps<Array<U>|U> => {
        if (Array.isArray(this.value)) {
            const results = [];
            for (let i = 0; i < this.value.length; i++) {
                try {
                    const result = mapper(this.value[i]);

                    if (result instanceof Problem) {
                        return result;

                    } else if (result instanceof Something) {
                        results.push(result.unwrap());

                    } else if (result instanceof None) {
                        continue;

                    } else if (isEmpty(result)) {
                        continue;
                        
                    } else {
                        results.push(result);
                    }
                } catch (err) {
                    return new Problem(err);
                }
            }

            if (results.length) {
                return Perhaps.of(results);
            } else {
                return Nothing;
            }

        } else {
            return this.map(mapper);
        }
    }

    public or = (alt: any)=> this;

    public orFrom = (fn: any)=> this;

    public peek = ()=> this.value;

    public unwrap = ()=> this.value;

    public unwrapOr = (alt: any)=> this.value;

    public unwrapOrThrow(): T {
        return this.value;
    }
}

function isEmpty(val: any) {
    switch(typeof val) {
        case 'undefined':
            return true;

        case 'object':
            return val === null;

        case 'string':
            return val.length === 0;

        case 'number':
            return isNaN(val);
            
        default:
            return false;
    }
}