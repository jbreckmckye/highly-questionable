### Handling nullable values

```typescript
import {Perhaps} from 'highly-questionable';

// Choose one at random
const user = oneOf(
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

### Map functions may return Perhaps objects without any fuss

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
            if (user.age < 21) throw new Error('User is too young');
        })
        .map(user => user.creditCard);
}

const creditCardNumbers = Perhaps
    .of([userA, userB, userC])
    .mapEach(getUserCreditCard)
    .mapEach(sendToDodgyServer) // won't be called if getUserCreditCard throws errors
    .catch(err => loggingFramework(err));
```

### Arrays can be flat-mapped

```typescript
const user1 = {name: 'Alyx Vance'};
const user2 = {name: 'Gordon Freeman'};

const getLettersInString = (input: string): Array<Char> => {
    return removeDuplicates(input.toLowerCase().split(''));
}

const letters = Perhaps
    .of([user1, user2])
    .mapEach(user => user.name)
    .flatMapAll(getLettersInString)
    .map(letters => letters.sort())
    .unwrap(); // [a, c, d, f, e, g, l, m, n, o, r, v, x, y]

```

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