# Highly Questionable

A TypeScript / JavaScript library for paranoid developers.

**Caution, experimental!**

Highly Questionable allows you to safely and elegantly handle values that might be null, undefined or Errors, without writing tedious null checks and try-catches everywhere. It is loosely based on the `Option`, `Maybe` and `Result` monads from other languages.

Think of it like a synchronous `Promise`, with `map/catch` methods equivalent to `then/catch`. 'Map' won't be called if the value doesn't exist, and you can handle errors with `catch`.

## Concept

Values are wrapped in a `Perhaps` object. When you want to use the value, you pass perhaps 'mapping' functions that are only run if the value is valid. The output of the 'mapping' gets wrapped in a new `Perhaps`, and so on, so forth, like so:

```typescript
const userName = Perhaps.of(userJSON)
    .map(json => JSON.parse(json))
    .map(user => user.details)
    .map(details => details.name);
```

There are three things that could normally fail here: JSON.parse might throw an error; the user may not have details; or details may not have a name. `Perhaps` will handle each one gracefully.

When you need to actually use a value, there are various methods and checks to make this safe:

```typescript
userName.forOne(name => {
    // This only runs if userName exists and contains no errors
    print(name);
});

if (userName instanceof Something) {
    // If using TypeScript, the compiler will now know the unwrapped value is safe
    print(userName.unwrap());
}

if (userName !== Nothing) {
    // 'catch' is another way to handle errors, and works like Promise.catch
    const unwrapped = userName.catch(error => 'Unretrievable').unwrap();
    print(unwrapped);
}

print(userName.unwrapOr('Anonymous'));
```

You can also catch exceptions at your leisure:

```typescript
userName.catch(err => {
    logException(err);
    return 'Anonymous'; //  can pass a default to use
});
```

And throw exceptions when values don't exist:

```typescript
userName.unwrapOrThrow(new Error('Could not retrieve user name'));
```

Note that every `Perhaps` object is immutable: mapping one will create a new instance, unless the output is Nothing (which is a singleton, as all Nothings are the same).

For more details, consult the [API docs](API.md).

## Setup & usage

Installing the package:

```bash
npm install highly-questionable
```

Importing the code:

```typescript
// TypeScript / ESNext
import {Perhaps, Something, Nothing, Problem} from 'highly-questionable';
```

```javascript
// Node
const {Perhaps, Something, Nothing, Problem} = require('highly-questionable');
```

TypeScript should work out of the box.

## API

See [API.md](API.md).

## Due dilligence

### License

This library is provided under an Apache 2.0 license. For more details, see [LICENSE.md];

### Dependencies

This project has no production dependencies.

### Library size

At v1.1, the whole library minified and gzipped amounted to 1018 bytes.

## Contributing / developing

1. Check out the code and install Node
2. Use `npm install` to install project dependencies
3. Write your TypeScript
4. Test with `npm test`
5. Build the bundle with `npm run build`
6. Raise a pull request