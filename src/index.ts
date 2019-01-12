export abstract class Perhaps<T> {
    abstract catch(handler: (err: Error) => T): Perhaps<T>

    abstract map<U=T>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U>

    abstract or(alt: T): Perhaps<T>

    abstract orFrom(fn: ()=> T | never): Perhaps<T>

    abstract peek(): any

    abstract unwrap(): T | null

    abstract unwrapOr(alt: T): T | null

    abstract unwrapOrThrow(err: Error): T | never

    static of<T>(input: any): Perhaps<T> {
        if (input === Nothing) {
            return input;

        } else if (input instanceof Problem) {
            return input;

        } else if (input instanceof Something) {
            return input as Perhaps<T>;

        } else if (isEmpty(input)) {
            return Nothing as Perhaps<T>;

        } else {
            return new Something<T>(input);
        }
    }

    static from<T>(fn: ()=> T): Perhaps<T> {
        try {
            const value = fn();
            return Perhaps.of(value);
        } catch (err) {
            return Problem.of(err);
        }
    }
};

export class None extends Perhaps<any> {
    static of(input: any) {
        return Nothing;
    }

    static from(fn: ()=> any) {
        return Nothing;
    }

    catch(handler: any) {
        return Nothing;
    }

    map(mapper: any) {
        return Nothing;
    }

    or<U>(alt: U): Perhaps<U> {
        return Perhaps.of(alt);
    }

    orFrom<U>(fn: ()=> U | never) {
        return Perhaps.from(fn);
    }

    peek() {
        return null;
    }

    unwrap() {
        return null;
    }

    unwrapOr<T>(alt: T) {
        return isEmpty(alt) ? null : alt;
    }

    unwrapOrThrow(err: Error): never {
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
        try {
            const result = fn();
            return new Problem(result);
        } catch (err) {
            return new Problem(err);
        }
    }

    public catch<T>(handler: (err: Error) => T): Perhaps<T> {
        const result = handler(this.err);
        return Perhaps.of(result);
    }

    public map() {
        return this;
    }

    public or<U>(alt: U): Perhaps<U> {
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

export class Something<T> implements Perhaps<T> {
    private value: T;

    constructor(input: T) {
        this.value = input;
    }

    public catch() {
        return this;
    }

    public map<U>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U> {
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