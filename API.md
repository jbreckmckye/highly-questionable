# API

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

`Perhaps.of(input).catch(Function) = Something | Nothing`

If the Perhaps is a `Problem` - meaning it wraps an error - this method will call the passed function with that error. The function may either return a value (which will create a Something or Nothing) or throw again (creating another Problem). It's a lot like `promise.catch`.

Note that the function just won't be called if the Perhaps is Something or Nothing.

If a wrapped error in a Problem isn't handled by `catch`, it will get thrown the next time the Problem is `unwrap`ped.

## perhaps.forEach

Instance method.

`Perhaps.of(array).forEach(Function) = Perhaps`

If the Perhaps is a Something wrapping an array, the function passed to `forEach` will be called with each array value. The results will be ignored.

This method will either return the original `Perhaps` or, if the function throws an error, a `Problem` wrapping that error.

If the Something wraps a non-array value, this method will act identically to `forOne`.

## perhaps.forOne

Instance method.

`Perhaps.of(input).forOne(Function) = Perhaps`

If the Perhaps is a Something - not Nothing and not a Problem - call the passed function with the inner value, and discard the result.

This method will either return the original `Perhaps` or, if the passed function throws an error, a `Problem` wrapping that error.

## perhaps.map

## perhaps.mapEach

## perhaps.or

## perhaps.orFrom

## perhaps.peek

## perhaps.unwrap

## perhaps.unwrapOr

## perhaps.unwrapOrThrow

## Nothing

## None

## Problem
