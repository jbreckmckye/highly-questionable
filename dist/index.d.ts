export declare abstract class Perhaps<T> {
    abstract catch(handler: (err: Error) => T): Perhaps<T>;
    abstract forOne(fn: (input: T) => any): Perhaps<T>;
    abstract map<U = T>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U>;
    abstract or(alt: T): Perhaps<T>;
    abstract orFrom(fn: () => T | never): Perhaps<T>;
    abstract peek(): T | null | Error;
    abstract unwrap(): T | null;
    abstract unwrapOr(alt: T): T;
    abstract unwrapOrThrow(err: Error): T | never;
    static from<U>(fn: () => U): Perhaps<U>;
    static junction<U>(...args: Array<Perhaps<U> | Function>): Perhaps<U>;
    static of<U>(input: any): Perhaps<U>;
}
export declare class None extends Perhaps<null> {
    catch: (fn: any) => None;
    forOne: (fn: any) => None;
    map: (fn: any) => None;
    or<U>(alt: U): Perhaps<U>;
    orFrom<U>(fn: () => U | any): Perhaps<any>;
    peek: () => null;
    unwrap: () => null;
    unwrapOr<T>(alt: T): T;
    unwrapOrThrow(err: Error): never;
}
export declare const Nothing: None;
export declare class Problem extends Perhaps<any> {
    private err;
    constructor(err: Error);
    catch<T>(handler: (err: Error) => T): Perhaps<T>;
    forOne: (fn: any) => Problem;
    map: (fn: any) => Problem;
    or<U>(alt: U): Perhaps<U>;
    orFrom<U>(fn: () => U | never): Perhaps<U>;
    peek(): Error;
    unwrap(): never;
    unwrapOr<T>(alt: T): T;
    unwrapOrThrow(err: Error): never;
}
export declare class Something<T> extends Perhaps<T> {
    private value;
    constructor(input: T);
    catch: (fn: any) => this;
    forEach(fn: (input: any) => any): Problem | this;
    forOne(fn: (input: T) => any): Problem | this;
    map<U>(mapper: (input: T) => Perhaps<U> | U): Perhaps<U>;
    or: (alt: any) => this;
    orFrom: (fn: any) => this;
    peek: () => T;
    unwrap: () => T;
    unwrapOr: (alt: any) => T;
    unwrapOrThrow(): T;
}
