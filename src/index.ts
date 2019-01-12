export abstract class Perhaps<T> {
    abstract catch(handler: (err: Error) => T): Perhaps<T>

    abstract isNothing(): this is None;

    abstract isProblem(): this is Problem;

    abstract isSomething(): this is Something<T>

    abstract map<U=T>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U>

    abstract or(alt: T): Perhaps<T>

    abstract orFrom(fn: ()=> T | never): Perhaps<T>

    abstract pass(fn: (input: T) => any): Perhaps<T>

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

            if (maybe.isSomething()) {
                joinInputs.push(maybe.unwrap());

            } else if (maybe.isProblem()) {
                return maybe;
            
            } else if (maybe.isNothing()) {
                return maybe;

            } else {
                throw new Error('Illegal junction parameter');
            }
        }

        try {
            const result = join(...joinInputs);
            return Perhaps.of(result);
        } catch (err) {
            return Problem.of(err);
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
            return new Something<U>(input);
        }
    }

    static from<U>(fn: ()=> U): Perhaps<U> {
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

    public catch(handler: any) {
        return Nothing;
    }

    public isNothing() {
        return true;
    }

    public isProblem() {
        return false;
    }

    public isSomething() {
        return false;
    }

    public map(mapper: any): None {
        return Nothing;
    }

    public or<U>(alt: U): Perhaps<U> {
        return Perhaps.of(alt);
    }

    public orFrom<U>(fn: ()=> U | never) {
        return Perhaps.from(fn);
    }

    public pass(fn: any) {
        return Nothing;
    }

    public peek(): null {
        return null;
    }

    public unwrap(): null {
        return null;
    }

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

    public isNothing() {
        return false;
    }

    public isProblem() {
        return true;
    }

    public isSomething() {
        return false;
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

    public pass(fn: any) {
        return this;
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

    public catch() {
        return this;
    }

    public isNothing() {
        return false;
    }

    public isProblem() {
        return false;
    }

    public isSomething() {
        return true;
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

    public pass(fn: (input: T) => any) {
        try {
            fn(this.value);
            return this;
        } catch (err) {
            return Problem.of(err);
        }
    }

    public peek(): T {
        return this.value;
    }

    public unwrap(): T {
        return this.value;
    }

    public unwrapOr(): T {
        return this.value;
    }

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