## Javascript tricks

```javascript


// exists and invoking
console.clear && console.clear()
obj.func && obj.func()

//
if (variable1 !== null || variable1 !== undefined || variable1 !== '') let variable2 = variable1;
// use the following:
let variable2 = variable1 || 'new';
console.log(variable2 === 'new'); // print true
variable1 = 'foo';
variable2 = variable1 || 'new';
console.log(variable2); // print foo

// 
Math.floor(4.9) === 4 // true
// use the following:
~~4.9 === 4 // true


// remove return in lambda
(x, y) => (x + y)
// return object
() => ({a: 1})

// 
Math.pow(2, 3)
2**3

// parserInt and parseFloat
const x_int = +"100"
const y_float = +"100.01"

//
if(~arr.indexOf(item)) { // found item

}
if(!~arr.indexOf(item)) { // didn't find item

}

```
