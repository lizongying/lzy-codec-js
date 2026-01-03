import {
    encodeFromString,
    decodeToString,
    encodeFromBytes,
    decodeToBytes,
} from './main.js'

// 测试代码（可选，验证功能正确性）
if (typeof window !== 'undefined' || typeof process !== 'undefined') {
    // 浏览器/Node.js环境均可运行测试
    ;(function testLZY() {
        const testStr = 'Hello 世界！LZY编码测试😀' // 包含emoji（大于0xFFFF的字符）
        console.log(`原始字符串: ${testStr}`)

        // 编码流程
        const lzyBytes = encodeFromString(testStr)
        console.log(`LZY编码字节: `, lzyBytes)

        // 解码流程
        const decodedStr = decodeToString(lzyBytes)
        console.log(`解码后字符串: ${decodedStr}`)

        // 验证一致性
        if (testStr === decodedStr) {
            console.log('✅ 编码解码一致性验证通过')
        } else {
            console.error('❌ 编码解码一致性验证失败')
        }

        // 测试字节流编码解码
        const utf8Bytes = new TextEncoder().encode(testStr)
        const lzyBytes2 = encodeFromBytes(utf8Bytes)
        const decodedUtf8Bytes = decodeToBytes(lzyBytes2)

        // 比较Uint8Array是否相等
        let isEqual = true
        if (utf8Bytes.length !== decodedUtf8Bytes.length) {
            isEqual = false
        } else {
            for (let i = 0; i < utf8Bytes.length; i++) {
                if (utf8Bytes[i] !== decodedUtf8Bytes[i]) {
                    isEqual = false
                    break
                }
            }
        }

        if (isEqual) {
            console.log('✅ 字节流编码解码一致性验证通过')
        } else {
            console.error('❌ 字节流编码解码一致性验证失败')
        }
    })()
}
