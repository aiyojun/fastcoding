# Browser technology

Purpose: To avoid being grabbed data from website


devtools state monitor


```javascript

// Mechanism:
// 1. When devtools in closing state, 0 / 0 will throw an exception;
// 2. When devtools in opening state, 0 / 0 will be NaN.
setInterval(function() { devtoolsListener() }, 100);
var devtoolsListener = function() {
	function trap(a) {
		if (("" + a / a)["length"] !== 1 || a % 20 === 0) {
			(function() {}["constructor"]("debugger")())
		} else {
			(function() {}["constructor"]("debugger")())
		}
		trap(++a)
	}
	try { trap(0) } catch (err) {}
};
devtoolsListener();

```

## Question

Some websites seems to be able to sense the CDP(chrome devtools protocol) tools, like puppeteer/pyppeteer. Why?

I test the js code above in pyppeteer, but chromium didn't trapped into debugger mode.

How do these websites implement it?

