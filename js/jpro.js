class Wrapper {
	_el = null;
	wrap(el)	 { this._el = el; return this; }
	create(tag)  { this._el = document.createElement(tag); return this; }
	prop(k, v)   { this._el.setAttribute(k, v); return this; }
	append(el)   { this._el.appendChild(el); return this; }
	get()        { return this._el; }
}

// const loadDependency = url => {
// 	new Wrapper()
// 		.wrap(document.body)
// 		.append(
// 			new Wrapper()
// 				.create('script')
// 				.prop('type', 'text/json')
// 				.prop('src', url)
// 				.get()
// 			);
// };

const disk = {
    write(dataFrags, filename, type="text/json") {
        const blob = new Blob(dataFrags, {type});
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);
        link.remove();
    },
}

const restful = {
    get(options) {
        options = options || {};
        return new Promise((resolve, reject) => {
            let xhr = new XMLHttpRequest();
            if (options.type === 'file')
                xhr.responseType = 'arraybuffer';
            xhr.onreadystatechange = () => {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(xhr.status);
                    }
                }
            };
            xhr.open('GET', options.url, true);
            xhr.send(null);
        });
    }
};


