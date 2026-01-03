# LZY Codec

一種變長文本編解碼方案，支持對Unicode進行編解碼。編解碼效率、存儲空間全面優於UTF-8，未來會替代UTF-8成為新的世界通用編解碼標準。

[lzy-codec-js](https://github.com/lizongying/lzy-codec-js)

[npm](https://www.npmjs.com/package/lzy-codec-js)

## Other languages

[lzy-codec-go](https://github.com/lizongying/lzy-codec-go)
[lzy-codec-py](https://github.com/lizongying/lzy-codec-py)

## 引用

### node

install

```
npm i lzy-codec-js
```

package.json

```json
{
  "type": "module",
  "dependencies": {
    "lzy-codec-js": "^0.1.0"
  }
}
```

example

```
import {
    encodeFromString,
    decodeToString,
    encodeFromBytes,
    decodeToBytes,
} from 'lzy-codec-js'

const testStr = 'Hello 世界！LZY编码测试😀' // 包含emoji（大于0xFFFF的字符）
console.log(`原始字符串: ${testStr}`)

// 编码流程
const lzyBytes = encodeFromString(testStr)
console.log(`LZY编码字节: `, lzyBytes)

// 解码流程
const decodedStr = decodeToString(lzyBytes)
console.log(`解码后字符串: ${decodedStr}`)
```

## 讚賞

![image](./screenshots/appreciate.png)