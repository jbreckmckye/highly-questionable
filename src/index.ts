export abstract class Perhaps<T> {
    abstract catch(handler: (err: Error) => T): Perhaps<T>

    abstract forOne(fn: (input: T) => any): Perhaps<T>

    abstract map<U=T>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U>

    abstract or(alt: T): Perhaps<T>

    abstract orFrom(fn: ()=> T | never): Perhaps<T>

    abstract peek(): T | null | Error

    abstract unwrap(): T | null

    abstract unwrapOr(alt: T): T

    abstract unwrapOrThrow(err: Error): T | never

    static from<U>(fn: ()=> U): Perhaps<U> {
        try {
            const value = fn();
            return Perhaps.of(value);
        } catch (err) {
            return new Problem(err);
        }
    }

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

    static of<U>(input: any): Perhaps<U> {
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
};

export class None extends Perhaps<null> {
    public catch = (fn: any): None => Nothing;

    public forOne = (fn: any): None => Nothing;

    public map = (fn: any): None => Nothing;

    public or<U>(alt: U): Perhaps<U> {
        return Perhaps.of(alt);
    }

    public orFrom<U>(fn: ()=> U | any) {
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

export class Problem extends Perhaps<any> {
    private err: Error;

    constructor(err: Error) {
        super();
        this.err = err;
    }

    public catch<T>(handler: (err: Error) => T): Perhaps<T> {
        return Perhaps.from(()=> handler(this.err));
    }

    public forOne = (fn: any): Problem => this;

    public map = (fn: any): Problem => this;

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

export class Something<T> extends Perhaps<T> {
    private value: T;

    constructor(input: T) {
        super();
        this.value = input;
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