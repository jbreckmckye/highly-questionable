# Highly Questionable

A TypeScript / JavaScript library for paranoid developers.

Highly Questionable allows you to safely and elegantly handle values that might be null, undefined or Errors, without writing tedious null checks or try-catches everywhere.

If you're familiar with monads, `Perhaps` is heavily inspired by a combination of `Maybe/Option` and `Result`.

If not, the best way to describe `Perhaps` is just to show some code:

```typescript
// 1. Wrap a value, null or undefined in Perhaps
const maybeNumber: Perhaps<number> = Perhaps.of(someInput);

// maybeNumber might a Something<number> or a Nothing. Both are represented by the type Perhaps<number>

// 2. Pass a mapping function.
const maybeDouble = maybeNumber.map(double);

// 3. The function is only used if someInput was not null / undefined

// 4. At this point, maybeDouble might be 
// a) a Something<number> (if all went well)
// b) a Nothing (if maybeNumber was a Nothing, or if double returned null)
// c) a Problem (if double threw an exception)

// 4. When you need the inner value, call one of the unwrap methods, or a type-guard method

maybeDouble.unwrap();
// maybeDouble's type | will return
// ---------------------------------
// Nothing            | null
// Something          | number
// Problem            | throws error 

maybeDouble.unwrapOr(123);
// maybeDouble's type | will return
// ---------------------------------
// Nothing            | passed number (123)
// Something          | original number
// Problem            | throws error 

maybeDouble.unwrapOrThrow(new Error('The number does not exist'));
// maybeDouble's type | will return
// ---------------------------------
// Nothing            | throws passed error
// Something          | number
// Problem            | throws original error 

if (maybeDouble.isSomething()) {
    // Only true if contents valid
    return maybeDouble.unwrap(); // TypeScript will infer that this cannot be null
}

if (maybeQuadruple.isNothing()) {
    // Only true if contents empty
    // Equivalent to maybeDouble === Nothing
}

if (maybeQuadruple.isProblem()) {
    // Only true if contents erroneous
}
```

I recommend taking a look at the 'Tour of Features', below.

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