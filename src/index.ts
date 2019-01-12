export interface IPerhaps<T> {
    catch(handler: (err: Error) => T): IPerhaps<T>,
    flatMap<U=T>(mapper: (input: T) => IPerhaps<U> | U): IPerhaps<U>,
    map<U=T>(mapper: (input: T) => U): IPerhaps<U>,
    or(alt: T): IPerhaps<T>,
    orFrom(fn: ()=> T | never): IPerhaps<T> | Problem,
    peek(): any,
    unwrap(): T,
    unwrapOr(alt: T): T,
    unwrapOrThrow(err: Error): T | never
}

export const Perhaps = {
    of<T>(input: any): IPerhaps<T> {
        if (input === Nothing) {
            return input;

        } else if (input instanceof Problem) {
            return input;

        } else if (input instanceof Something) {
            return input as IPerhaps<T>;

        } else if (isEmpty(input)) {
            return Nothing as IPerhaps<T>;

        } else {
            return new Something<T>(input);
        }
    },

    from<T>(fn: ()=> T): IPerhaps<T> {
        try {
            const value = fn();
            return Perhaps.of(value);
        } catch (err) {
            return Problem.of(err);
        }
    }
};

export const Nothing: IPerhaps<any> = {
    catch() {
        return Nothing;
    },

    flatMap() {
        return Nothing;
    },

    map<U>(mapper: (input: any) => U): IPerhaps<U> {
        const result = mapper(null);
        return Perhaps.of(result);
    },

    or<U>(alt: U): IPerhaps<U> {
        return Perhaps.of(alt);
    },

    orFrom<U>(fn: ()=> U | never) {
        return Perhaps.from(fn);
    },

    peek() {
        return null;
    },

    unwrap() {
        return null;
    },

    unwrapOr<T>(alt: T) {
        return alt;
    },

    unwrapOrThrow(err: Error) {
        throw err;
    }
}

export class Problem implements IPerhaps<any> {
    private err: Error;

    constructor(err: Error) {
        this.err = err;
    }

    static of(err: Error): Problem {
        return new Problem(err);
    }

    static from(fn: ()=> Error) {
        try {
            return new Problem(fn());
        } catch (err) {
            return new Problem(err);
        }
    }

    public catch<T>(handler: (err: Error) => T): IPerhaps<T> {
        const result = handler(this.err);
        return Perhaps.of(result);
    }

    public flatMap() {
        return this;
    }

    public map() {
        return this;
    }

    public or<U>(alt: U): IPerhaps<U> {
        return Perhaps.of(alt);
    }

    public orFrom<U>(fn: ()=> U | never) {
        return Perhaps.from(fn);
    }

    public peek() {
        return this.err;
    }

    public unwrap(): never {
        throw this.err;
    }

    public unwrapOr<T>(alt: T) {
        return alt;
    }

    public unwrapOrThrow(err: Error): never {
        throw err;
    }
}

class Something<T> implements IPerhaps<T> {
    private value: T;

    constructor(input: T) {
        this.value = input;
    }

    public catch(handler: any) {
        return this as IPerhaps<T>;
    }

    public flatMap<U>(mapper: (input: T) => IPerhaps<U> | U): IPerhaps<U> {
        try {
            const result = mapper(this.value);
            return Perhaps.of(result);
        } catch (err) {
            return Problem.of(err);
        }
    }

    public map<U>(mapper: (input: T) => U): IPerhaps<U> {
        try {
            const result = mapper(this.value);
            return Perhaps.of(result);
        } catch (err) {
            return Problem.of(err);
        }
    }

    public or() {
        return this;
    }

    public orFrom() {
        return this;
    }

    public peek() {
        return this.value;
    }

    public unwrap() {
        return this.value;
    }

    public unwrapOr() {
        return this.value;
    }

    public unwrapOrThrow() {
        return this.value;
    }
}

function isEmpty(val: any) {
    return val === null
        || val === undefined
        || val === ''
        || isNaN(val);
}