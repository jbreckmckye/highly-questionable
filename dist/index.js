"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Perhaps {
    static from(fn) {
        try {
            const value = fn();
            return Perhaps.of(value);
        }
        catch (err) {
            return new Problem(err);
        }
    }
    static junction(...args) {
        const join = args.pop();
        const maybes = args;
        const joinInputs = [];
        for (let i = 0; i < maybes.length; i++) {
            const maybe = maybes[i];
            if (maybe instanceof Something) {
                joinInputs.push(maybe.unwrap());
            }
            else if (maybe instanceof Problem) {
                return maybe;
            }
            else if (maybe instanceof None) {
                return maybe;
            }
            else {
                throw new Error('Illegal junction parameter');
            }
        }
        try {
            const result = join(...joinInputs);
            return Perhaps.of(result);
        }
        catch (err) {
            return new Problem(err);
        }
    }
    static of(input) {
        if (input instanceof None) {
            return input;
        }
        else if (input instanceof Problem) {
            return input;
        }
        else if (input instanceof Something) {
            return input;
        }
        else if (isEmpty(input)) {
            return exports.Nothing;
        }
        else {
            return new Something(input);
        }
    }
}
exports.Perhaps = Perhaps;
;
class None extends Perhaps {
    constructor() {
        super(...arguments);
        this.catch = (fn) => exports.Nothing;
        this.forEach = (fn) => exports.Nothing;
        this.forOne = (fn) => exports.Nothing;
        this.map = (fn) => exports.Nothing;
        this.mapEach = (fn) => exports.Nothing;
        this.mapEachFlat = (fn) => exports.Nothing;
        this.peek = () => null;
        this.unwrap = () => null;
    }
    or(alt) {
        return Perhaps.of(alt);
    }
    orFrom(fn) {
        return Perhaps.from(fn);
    }
    unwrapOr(alt) {
        return alt;
    }
    unwrapOrThrow(err) {
        throw err;
    }
}
None.of = (input) => exports.Nothing;
None.from = (fn) => exports.Nothing;
exports.None = None;
exports.Nothing = new None();
class Problem {
    constructor(err) {
        this.forEach = (fn) => this;
        this.forOne = (fn) => this;
        this.map = (fn) => this;
        this.mapEach = (fn) => this;
        this.mapEachFlat = (fn) => this;
        this.err = err;
    }
    static of(err) {
        return new Problem(err);
    }
    static from(fn) {
        return new Problem(fn());
    }
    catch(handler) {
        return Perhaps.from(() => handler(this.err));
    }
    or(alt) {
        return Perhaps.of(alt);
    }
    orFrom(fn) {
        return Perhaps.from(fn);
    }
    peek() {
        return this.err;
    }
    unwrap() {
        throw this.err;
    }
    unwrapOr(alt) {
        return alt;
    }
    unwrapOrThrow(err) {
        throw err;
    }
}
exports.Problem = Problem;
class Something {
    constructor(input) {
        this.catch = (fn) => this;
        this.mapEach = (mapper) => {
            if (Array.isArray(this.value)) {
                const results = [];
                for (let i = 0; i < this.value.length; i++) {
                    try {
                        const result = mapper(this.value[i]);
                        if (result instanceof Problem) {
                            return result;
                        }
                        else if (result instanceof Something) {
                            results.push(result.unwrap());
                        }
                        else if (result instanceof None) {
                            continue;
                        }
                        else if (isEmpty(result)) {
                            continue;
                        }
                        else {
                            results.push(result);
                        }
                    }
                    catch (err) {
                        return new Problem(err);
                    }
                }
                if (results.length) {
                    return Perhaps.of(results);
                }
                else {
                    return exports.Nothing;
                }
            }
            else {
                return this.map(mapper);
            }
        };
        this.or = (alt) => this;
        this.orFrom = (fn) => this;
        this.peek = () => this.value;
        this.unwrap = () => this.value;
        this.unwrapOr = (alt) => this.value;
        this.value = input;
    }
    static of(input) {
        return new Something(input);
    }
    static from(fn) {
        try {
            return new Something(fn());
        }
        catch (err) {
            return new Problem(err);
        }
    }
    forEach(fn) {
        if (Array.isArray(this.value)) {
            for (let i = 0; i < this.value.length; i++) {
                try {
                    fn(this.value[i]);
                }
                catch (err) {
                    return new Problem(err);
                }
            }
        }
        else {
            try {
                fn(this.value);
            }
            catch (err) {
                return new Problem(err);
            }
        }
        return this;
    }
    forOne(fn) {
        try {
            fn(this.value);
            return this;
        }
        catch (err) {
            return new Problem(err);
        }
    }
    map(mapper) {
        try {
            const result = mapper(this.value);
            return Perhaps.of(result);
        }
        catch (err) {
            return new Problem(err);
        }
    }
    unwrapOrThrow() {
        return this.value;
    }
}
exports.Something = Something;
function isEmpty(val) {
    switch (typeof val) {
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
