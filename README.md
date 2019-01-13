# Highly Questionable

A TypeScript / JavaScript library for paranoid developers.

Highly Questionable allows you to safely and elegantly handle values that might be null, undefined or Errors, without writing tedious null checks or try-catches everywhere.

The core concept is simple:

1. You wrap a value, null, undefined or error in a `Perhaps`
2. You pass in 'mapping' functions, which only need to work with non-empty, non-error values
3. If the value exists / is not an error, it is applied to the operator
4. The resulting value / null / error comes back wrapped in a new `Perhaps`
5. When you need the inner value, call one of the unwrap methods, or a type-guard method

In code:

```typescript
// 1. Wrap a value, null or undefined in Perhaps
const maybeNumber: Perhaps<number> = Perhaps.of(someInput);

// 2. Pass a mapping function
const maybeDouble = maybeNumber.map(double);

// 3. The function is only called if someInput was not null / undefined

// 4. The resulting value comes back as a new perhaps
const maybeQuadruple: Perhaps<number> = maybeDouble.map(double)

// 5. When you need the inner value, call one of the unwrap methods, or a type-guard method

maybeQuadruple.unwrap(); // may be number or null
maybeQuadruple.unwrapOr(123); // will return 123 if contents invalid
maybeQuadruple.unwrapOrThrow(new Error('The number does not exist')); // throw error if contents invalid

if (maybeQuadruple.isSomething()) {
    // Only true if contents valid
    // TypeScript now knows maybeQuadruple.unwrap will never be null
}

if (maybeQuadruple.isNothing()) {
    // Only true if contents empty
}
```

I recommend taking a look at the 'Tour of Features', below.

If you're familiar with monads, `Perhaps` is heavily inspired by a combination of `Maybe/Option` and `Result`.

## Setup

```
npm install highly-questionable
```

TypeScript should work out of the box.

## Tour of features / examples

See [EXAMPLES.md](EXAMPLES.md)

## API

See [API.md](API.md) [TODO]

## Due dilligence

### License

This library is provided under an [TO FILL] license. This means... .

For more details, see [LICENSE.md];

### Library size

(to calculate)

## Contributing / developing