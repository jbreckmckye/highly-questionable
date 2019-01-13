# Highly Questionable

A TypeScript / JavaScript library for paranoid developers.

Highly Questionable allows you to safely and elegantly handle values that might be null, undefined or Errors, without writing tedious null checks or try-catches everywhere.

The core concept is simple:

1. You wrap value, nulls or errors in a `Perhaps`
2. You pass the Perhaps operator functions, for use with non-null values
3. If the value exists / is not an error, it is applied to the operator
4. The resulting value / null / error comes back wrapped in a new `Perhaps`

If you're familiar with monads, `Perhaps` is heavily inspired by a combination of `Maybe/Option` and `Result`.

## Give me some examples

### Handling nullable values

```typescript
import {Perhaps} from 'highly-questionable';

const user = randomOf(
    null,

    {name: 'Simon'},

    {name: 'Alyx', contactDetails: {}},

    {name: 'Malcolm', contactDetails: {
        email: null
    }},

    {name: 'Clarissa', contactDetails: {
        email: 'clarissa@yahoo.com'
    }}
);

// Uses map functions only if last result != empty
const mailto = Perhaps.of(user)
    .map(user => user.contactDetails)
    .map(details => details.email)
    .map(email => 'mailto:' + email);

// Can set default values as you go
const name = Perhaps.of(user)
    .map(user => user.name)
    .or('Anonymous')
    .map(toUpperCase);

// Perhaps provides methods to check whether content is valid
if (mailto.isSomething()) {
    // TypeScript knows this value cannot be null, due to .isSomething type guard
    return mailto.unwrap();
}
```

### Map functions can return Perhaps values without any fuss

```typescript
function getUserName(user: User | null) {
    return Perhaps.of(user).map(user => user.name);
}

const user1 = {name: 'Alyx'};
const user2 = {name: 'Gordon'};
const user3 = {};
const user4 = null;

const userNames = Perhaps
    .of([user1, user2, user3, user4])
    .map(users => users.map(getUserName))
    .unwrap(); // ['Alyx', 'Gordon']
```

### Can perform mapEach / forEach on arrays

```typescript
const userName = Perhaps
    .of([user1, user2, user3, user4])
    .mapEach(getUserName)
    .forEach(name => console.log(name)) // 'Alyx', 'Gordon'
```

### Errors are handled like promise rejections

```typescript
function getUserCreditCard(user: User | null) {
    return Perhaps.of(user)
        .ifExists(user => {
            const age = Perhaps.of(user.age).unwrapOrThrow(new Error('Could not verify age'));
            if (age < 21) throw new Error('User is too young');
        })
        .map(user => user.creditCard);
}

const creditCardNumbers = Perhaps
    .of([userA, userB, userC])
    .mapEach(getUserCreditCard)
    .mapEach(sendToDodgyServer) // won't be called if getUserCreditCard throws errors
    .catch(err => loggingFramework(err));
```

(todo)

## Recipes

### Obtaining a WebGL context with Perhaps

```typescript
import {Perhaps} from 'highly-questionable';

const canvas = document.createElement('canvas');
const context = Perhaps
    .of(canvas.getContext('webgl2'))
    .or(canvas.getContext('webgl'))
    .orFrom(()=> canvas.getContext('experimental-webgl'));
```

### jQuery-like DOM selection using map & flatMap

```typescript
import {Perhaps} from 'highly-questionable';

function queryAll(el: HTMLElement, selector: string) {
    return Perhaps
        .of(el.querySelectorAll(selector))
        .map(results => Array.from(results));
}

const link = Perhaps
    .of(queryAll(document, 'div'))
    .flatMap(div => queryAll(div, 'li'))
    .flatMap(li => queryAll(li, 'a'));
```

### Case matching

```typescript
import {Perhaps, Some, None, Type, Same} from 'highly-questionable';

const isEmail = /^.+@.+$/g;

const userName = Perhaps
    .of(window.prompt('What is your name?'));

const result = userName.case(
    isEmail, x => 'mailto:' + x,
    Type(Error), e => 'error:' + e.message,
    Some, Same
    None, 'unnamed'
);
```

### Using promises

```typescript
import {Perhaps, Rejection} from 'highly-questionable';

const fetchUsers = async ()=> {...};

const userEmail = Perhaps
    .from(fetchUsers)
    .flatMap(
        user => Perhaps
            .of(user.email)
            .or(user.email_address)
            .or(Perhaps
                .of(user.metadata)
                .map(meta => meta.email || meta.email_address)
            )
            .map(m => 'mailto:' + m)
    );
```