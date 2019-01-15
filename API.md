# API

## Note

This library is super-new and therefore highly liable to change. That's the downside. The upside is that if you have ideas for improvements, I can easily add them! Raise an issue in Github and I'll take a look.

## Classes

All types inherit from `Perhaps`, which is a catch-call container for values which may not exist or be erroneous. There are three subtypes:

1. `Something` for values that do exist
2. `None` for values that don't
3. `Problem` for errors

You can query the type of a Perhaps using `instanceof`:

```typescript
const isSomething = perhaps instanceof Something;
const isNothing = perhaps instanceof None;
const isProblem = perhaps instanceof Problem;
```

There is also a helper value `Nothing` - this is a single instance of `None`. All Nones are functionally identical, so it's handy to have a single value for use in comparisons etc., e.g.

```typescript
const isNothing = perhaps === Nothing;
```

## Perhaps.of

Static method.

`Perhaps.of(T) = Something<T> | Problem | Nothing`;

Creates a new `Perhaps` (`Something` or `Nothing`) using the provided value, according to the following rules:

1. If the value is null, undefined or an empty string, Perhaps.of returns `Nothing`
2. If the value is another `Perhaps`, that will be returned directly
3. Otherwise, returns a `Something`

e.g.

```typescript
let a: Perhaps<number> = Perhaps.of(123);
let b: None = Perhaps.of(null | undefined | '');
let c: Perhaps<string> = Perhaps.of( Perhaps.of('hello') );
```

## Perhaps.from

Static method.

`Perhaps.from(Function) = Something<T> | Problem | Nothing`;

Creates a new `Perhaps` from the provided function, according to the following rules:

1. If the function returns a null, undefined or empty string, Perhaps.from returns `Nothing`
2. If the function returns another `Perhaps`, that will be returned directly
3. If the function throws an error, Perhaps.from returns a `Problem` wrapping the exception
4. Otherwise, returns a `Something`

e.g.

```typescript
let something =   Perhaps.from(()=> 123);
let nothing =     Perhaps.from(()=> null);
let problem =     Perhaps.from(()=> {throw new Error});
```

## Perhaps.junction

Static method.

`Perhaps.junction(Perhaps, Perhaps, Perhaps... Function) = Something | Problem | Nothing`

Given _n_ input Perhaps objects and one combination function, tries to construct a new Perhaps using the values wrapped in the inputs. If any of the inputs are `Nothing` or a `Problem`, then `Nothing` or the `Problem` are returned.

Imagine you have a user object (which may or may not be null) with firstName and lastName fields (which may also be or not be null). Junction lets you wrap both values in a perhaps, then construct a new perhaps when and only when both inputs are valid, as so:

```typescript
const firstName = Perhaps.of(user).map(user => user.firstName);
const lastName = Perhaps.of(user).map(user => user.lastName);
const fullName = Perhaps.junction(firstName, lastName, (first: string, last: string) => first + ' ' + last);
```

The result of the combination function is passed through `Perhaps.of` before being returned, so functions are allowed to spit out null, undefineds, wrapped Perhaps-es or even throw errors.

## perhaps.catch

Instance method.

`Perhaps.of(input).catch(Error => T | void) = Something<T> | Nothing | Problem`

If the Perhaps is a `Problem` - meaning it wraps an error - this method will call the passed function with that error. The function may either return a value (which will create a Something or Nothing) or throw again (creating another Problem). It's a lot like `promise.catch`.

Note that the function just won't be called if the Perhaps is Something or Nothing.

If a wrapped error in a Problem isn't handled by `catch`, it will get thrown the next time the Problem is `unwrap`ped.

e.g.

```typescript
const userName = Perhaps
    .of(localStorage.getItem('user'))
    .map(json => JSON.parse(json)) // might throw error
    .map(user => user.name) // ignored if Problem
    .catch(e => {
        console.error(e);
        return 'Invalid user'; // omit return to create a Nothing
    });
```

## perhaps.forOne

Instance method.

`Perhaps.of(input).forOne(T => void) = Something<T> | Problem`

If the Perhaps is a Something (not Nothing or a Problem), calls the passed function with the inner value, and discard the result.

This method will either return the original `Perhaps` or, if the passed function throws an error, a `Problem` wrapping that error.

```typescript
let a: Perhaps<any> = Perhaps.of(null).forOne(willNotBeCalled);
let b: Perhaps<number> = Perhaps.of(1234).forOne(willBeCalled);
```

## perhaps.map

Instance method.

`Perhaps.of(input).map(T => U | Perhaps<U>) = Something<U> | Nothing | Problem`

If the Perhaps is a Something (not Nothing or a Problem), calls the passed function with the inner value, and returns the result wrapped in a new Perhaps.

If the map function returns an empty value or throws an error, the return value will be Nothing or a Problem respectively.

Finally, if a map function itself returns a `Perhaps`, the result will be automatically 'flattened' - Perhaps objects will never contain another Perhaps inside.

Note that after mapping, the _original_ Perhaps is unchanged (all Perhaps objects are immutable).

Examples:

```typescript
const something: Perhaps<number> = Perhaps.of(100);
const nothing: None = Perhaps.of(null);
const problem: Problem = Perhaps.from(()=> new Error);

function double(x: number) {
    return x * 2;
}

something.map(double); // is a Something wrapping 200
nothing.map(double); // is a Nothing. Double was not called.
problem.map(double); // is a Problem. Double was not called.

function returnEmpty(x: number) {
    return undefined;
}

something.map(returnEmpty); // is a Nothing
nothing.map(returnEmpty); // still a Nothing. ReturnEmpty was not called.
problem.map(returnEmpty); // still a Problem. ReturnEmpty was not called.

function returnSomething(x: number) {
    return Perhaps.of(number + 1);
}

something.map(returnSomething); // is a Something wrapping 101
nothing.map(returnSomething); // still a Nothing. ReturnSomething was not called.
problem.map(returnSomething); // still a Problem. ReturnSomething was not called.

function returnNothing(x: number) {
    return Perhaps.of(null);
}

something.map(returnNothing); // is a Nothing
```

## perhaps.or

Instance method.

`Perhaps.from(fn).or(T | null) = Something<T> | Nothing | Problem`

If the Perhaps is a Nothing, attempt to construct a new Perhaps using an alternate value. If the alternate value is 'empty' (null / undefined / an empty string), the result will still be Nothing.

## perhaps.orFrom

Instance method.

`Perhaps.from(fn).orFrom(()=> T | null) = Something<T> | Nothing | Problem`

If the Perhaps is a Nothing, attempt to construct a new Perhaps using the provided function. If the function returns an empty value, the result will be Nothing again. If the function throws an exception, the result will be a Problem.

## perhaps.peek

Instance method.

`Perhaps.from(fn).peek() = T | null | Error`

Unwraps the value for inspection, debugging etc. `Problem`s will unwrap to their `Error` objects; `Nothing` and `None`s unwrap to null, even if they were created by other empty values (e.g. undefined).

You probably want to use unwrap instead.

## perhaps.unwrap

Instance method.

`Perhaps.from(fn).unwrap() = T | null | <throws error>`

Unwraps the value for use, following these rules:

1. If the Perhaps is a Something, will unwrap to its value
2. If the Perhaps is a Nothing, will unwrap to `null`
3. If the Perhaps is a Problem, will throw its Error

Note that in TypeScript, you can narrow the class of a Perhaps using instanceof checks:

```typescript
if (myPerhaps instanceof Something) {
    myPerhaps.unwrap(); // typescript will know this value cannot be null
}
```

## perhaps.unwrapOr

Instance method.

`Perhaps.from(fn).unwrapOr(T) = T | null | <throws error>`

Equivalent to calling `perhaps.or` and then `perhaps.unwrap`.

## perhaps.unwrapOrThrow

Instance method.

`Perhaps.from(fn).unwrapOrThrow(Error) = T | null | <throws provided error>`

Unwraps the value for use, following these rules:

1. If the Perhaps is a Something, will unwrap to its value
2. If the Perhaps is a Nothing, will throw provided error
3. If the Perhaps is a Problem, will throw provided error

## Nothing

An instance of `None`. All Nones are functionally identical, so it's simpler and more efficient to use just a singleton.

## None

Represents a Perhaps that wraps an empty value.

"Empty values" are:

1. null
2. undefined
3. the empty string `''`
4. the number `NaN`

## Problem

Represents a Perhaps that wraps an exception. Used mainly to handle errors thrown by mapping functions.

Can be constructed directly with an Error object:

```typescript
const myProblem = new Problem(new Error('Oh no!'));
```