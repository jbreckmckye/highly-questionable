# Highly Questionable

A TypeScript / JavaScript library for paranoid developers.

Highly Questionable allows you to safely and elegantly handle values that might be null, undefined or Errors, without writing tedious null checks and try-catches everywhere.

It is loosely based on the `Option`, `Maybe` and `Result` monads from other languages. You could also think of it as like a synchronous `Promise`.

## Concept

Values are wrapped in a `Perhaps` object. When you want to use the value, you pass perhaps 'mapping' functions that are only run if the value is valid. The output of the 'mapping' gets wrapped in another `Perhaps`, and so on, so forth, like so:

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

## Examples / recipes

See [EXAMPLES.md](EXAMPLES.md).

## Due dilligence

### License

This library is provided under an [TO FILL] license. This means... .

For more details, see [LICENSE.md];

### Library size

(to calculate)

## Contributing / developing