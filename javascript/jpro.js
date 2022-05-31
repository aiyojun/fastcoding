class Wrapper {
	_el = null;
	wrap(el)	 { this._el = el; return this; }
	create(tag)  { this._el = document.createElement(tag); return this; }
	prop(k, v)   { this._el.setAttribute(k, v); return this; }
	append(el)   { this._el.appendChild(el); return this; }
	get()        { return this._el; }
}

const loadDependency = url => {
	new Wrapper()
		.wrap(document.body)
		.append(
			new Wrapper()
				.create('script')
				.prop('type', 'text/json')
				.prop('src', url)
				.get()
			);
};

loadDependency('https://blog.luckly-mjw.cn/tool-show/m3u8-downloader/mux-mp4.js');
loadDependency('https://blog.luckly-mjw.cn/tool-show/m3u8-downloader/aes-decryptor.js');

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

const m3u8 = {
    mp4: { toMap4: false, duration: 0, },
    aes: { url: '', key: '', iv: '', method: '', decrypt: null,
        stringToBuffer: str => new TextEncoder().encode(str),},
    protoFrags: [],
    mediaFrags: [],
    getAesKey() {
        return new Promise(resolve => {
            if (m3u8.aes.url !== '') {
                restful.get({type: 'file', url: m3u8.aes.url}).then(key => {
                    m3u8.aes.key = key;
                    m3u8.aes.decrypt = new AESDecryptor();
                    m3u8.aes.decrypt.constructor();
                    m3u8.aes.decrypt.expandKey(m3u8.aes.key);
                    resolve();
                });
            } else {
                resolve();
            }
        });
    },
    /* AES decryption */
    decrypt(data, index) {
        return new Promise(resolve => {
            if (m3u8.aes.url !== '') {
                let iv = m3u8.aes.iv || new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, index]);
                data = m3u8.aes.decrypt.decrypt(data, 0, iv.buffer || iv, true);
            }
            resolve(data);
        });
    },
    /* Use mux.js decode to mp4 format. */
    wrapMp4(data, index) {
        return new Promise(resolve => {
            if (m3u8.mp4.toMap4) {
                let transmuxer = new muxjs.Transmuxer({keepOriginalTimestamps: true, duration: parseInt(m3u8.mp4.duration)});
                transmuxer.on('data', segment => {
                    if (index === 0) {
                        let cache = new Uint8Array(segment.initSegment.byteLength + segment.data.byteLength);
                        cache.set(segment.initSegment, 0);
                        cache.set(segment.data, segment.initSegment.byteLength);
                        resolve(cache.buffer);
                    } else {
                        resolve(segment.data)
                    }
                });
                transmuxer.push(new Uint8Array(data));
                transmuxer.flush();
            } else {
                resolve(data);
            }
        });
    },
    /* The main interface exposed to outside */
    download(url, filename='video', toMp4=false) {
		console.info("[m3u8] url: " + url);
		let applyUrl = (fragUrl, baseUrl) => fragUrl.indexOf('http') > -1 ? fragUrl : `${baseUrl}/${fragUrl}`;
		let urlPath = url.split('/');
		{let last = urlPath.pop(); let arr = last.split('.'); arr.pop(); if (filename === 'video') { filename = arr.join('.'); } }
		let baseUrl = urlPath.join('/');
        m3u8.mp4.toMap4 = toMp4;
        restful.get({url}).then(protocol => {
            protocol.split('\n').forEach(line => {
                // here can be *.ts/*.image/http*
				if (line.toLowerCase().indexOf('ts') > -1
						|| line.toLowerCase().indexOf('image') > -1
						|| line.toLowerCase().indexOf('http') > -1
				) {
					m3u8.protoFrags.push({url: applyUrl(line, baseUrl), state: ''});
				}
                if (line.toUpperCase().indexOf('#EXTINF:') > -1 && toMp4) {
                    m3u8.mp4.duration += parseFloat(line.toUpperCase().split('#EXTINF:')[1]);
                }
            });
            if (protocol.indexOf('#EXT-X-KEY') > -1) {
                m3u8.aes.method = (protocol.match(/(.*METHOD=([^,\s]+))/) || ['', '', ''])[2];
                m3u8.aes.url    = (protocol.match(/(.*URI="([^"]+))"/) || ['', '', ''])[2];
                m3u8.aes.iv     = (protocol.match(/(.*IV=([^,\s]+))/) || ['', '', ''])[2];
                m3u8.aes.iv     = m3u8.aes.iv ? m3u8.aes.stringToBuffer(m3u8.aes.iv) : '';
            }
            m3u8.getAesKey().then(() => m3u8.main(filename));
        });
    },
    pull(index) {
        return new Promise(resolve =>
            restful.get({type: 'file', url: m3u8.protoFrags[index].url}).then(tsFile =>
                resolve(tsFile)));
    },
    main(filename) {
    	let timer = setInterval(() => {
    		let finished = 0;
    		for (let i = 0; i < m3u8.protoFrags.length; i++) {
    			if (m3u8.protoFrags[i].state === 'Finish') {
    				finished++;
    			}
    		}
    		console.info(`[m3u8] Finished ${m3u8.protoFrags.length}\\${finished}`);
    		if (finished === m3u8.protoFrags.length) {
		        disk.write(
		            m3u8.mediaFrags,
		            m3u8.mp4.toMap4 ? `${filename}.mp4` : `${filename}.ts`,
		            m3u8.mp4.toMap4 ? `video/mp4` : `video/MP2T`
		        );
		        clearInterval(timer);
    		}

    	}, 1000);
        /* TODO: Do more detection. */
        for (let i = 0; i < m3u8.protoFrags.length; i++) {
            m3u8.pull(i)
                .then(ts => m3u8.decrypt(ts, i))
                .then(ts => m3u8.wrapMp4(ts, i))
                .then(mediaFrag => {
                    m3u8.protoFrags[i].state = 'Finish';
                    m3u8.mediaFrags[i] = mediaFrag;
                });
        }
    },
};

// Demo
// m3u8.parse('http://1257120875.vod2.myqcloud.com/0ef121cdvodtransgzp1257120875/3055695e5285890780828799271/v.f230.m3u8');