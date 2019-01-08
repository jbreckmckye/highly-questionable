# Highly Questionable

(todo)

## Ideas

### Obtaining a WebGL context with Perhaps

```typescript
import {Perhaps, None, Some, Any} from 'highly-questionable';

const canvas = document.createElement('canvas');
const context = Perhaps
    .of(canvas.getContext('webgl2'))
    .or(canvas.getContext('webgl'))
    .orFrom(()=> canvas.getContext('experimental-webgl'));

context.case(
    Some, ctx => console.log('We have a context'),
    None, ()=> throw new Error('No context available')
);

context.catch(
    Any, err => console.error(`Failed: ${err.message}`)
);
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