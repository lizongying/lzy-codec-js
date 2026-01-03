/*
https://github.com/lizongying/lzy-codec-js
*/

// 定义常量
const SURROGATE_MIN = 0xd800
const SURROGATE_MAX = 0xdfff
const UNICODE_MAX = 0x10ffff
const ERROR_UNICODE = new Error('invalid unicode')

/**
 * 验证一个Unicode码点是否有效（排除代理区字符）
 * @param {number} r - Unicode码点
 * @returns {boolean} 有效性标识
 */
function validUnicode(r) {
    return (
        (0 <= r && r < SURROGATE_MIN) || (SURROGATE_MAX < r && r <= UNICODE_MAX)
    )
}

/**
 * 将Unicode码点数组（对应Go的rune切片）转换为LZY编码的Uint8Array
 * @param {number[]} inputRunes - 整数数组，每个元素是有效的Unicode码点
 * @returns {Uint8Array} LZY编码的字节序列
 */
function encode(inputRunes) {
    // 先创建临时数组存储字节，最后转换为Uint8Array
    const outputArr = []

    for (const r of inputRunes) {
        if (r < 0x80) {
            // 单字节编码：0xxxxxxx
            outputArr.push(r & 0xff)
        } else if (r < 0x4000) {
            // 双字节编码：高7位 + 0x80 | 低7位
            outputArr.push((r >> 7) & 0xff)
            outputArr.push((0x80 | (r & 0x7f)) & 0xff)
        } else {
            // 三字节编码：高7位 + 0x80|中间7位 + 0x80|低7位
            outputArr.push((r >> 14) & 0xff)
            outputArr.push((0x80 | ((r >> 7) & 0x7f)) & 0xff)
            outputArr.push((0x80 | (r & 0x7f)) & 0xff)
        }
    }

    // 转换为Uint8Array（JS中对应Go的[]byte和Python的bytes）
    return new Uint8Array(outputArr)
}

/**
 * 将UTF-16字符串（JS原生字符串）转换为LZY编码的Uint8Array
 * @param {string} inputStr - JS原生字符串（UTF-16编码，自动兼容Unicode字符）
 * @returns {Uint8Array} LZY编码的字节序列
 */
function encodeFromString(inputStr) {
    // 将JS字符串转换为Unicode码点数组（对应Go的[]rune和Python的ord列表）
    // 处理大于0xFFFF的字符（代理对），确保完整获取码点
    const runes = []
    for (let i = 0; i < inputStr.length; i++) {
        const charCode = inputStr.charCodeAt(i)
        // 检测代理对（高代理）
        if (
            charCode >= SURROGATE_MIN &&
            charCode <= SURROGATE_MAX &&
            i + 1 < inputStr.length
        ) {
            const lowCharCode = inputStr.charCodeAt(i + 1)
            // 计算完整Unicode码点
            const fullRune =
                ((charCode - SURROGATE_MIN) << 10) +
                (lowCharCode - 0xdc00) +
                0x10000
            runes.push(fullRune)
            i++ // 跳过低代理
        } else {
            runes.push(charCode)
        }
    }
    return encode(runes)
}

/**
 * 将UTF-8字节序列（Uint8Array）转换为LZY编码的Uint8Array
 * @param {Uint8Array} inputBytes - UTF-8编码的字节序列
 * @returns {Uint8Array} LZY编码的字节序列
 */
function encodeFromBytes(inputBytes) {
    // 先将UTF-8 Uint8Array解码为JS原生字符串
    // 使用TextDecoder（浏览器/Node.js均支持）
    const decoder = new TextDecoder('utf-8')
    const inputStr = decoder.decode(inputBytes)
    return encodeFromString(inputStr)
}

/**
 * 将LZY编码的Uint8Array解码为Unicode码点数组
 * @param {Uint8Array} inputBytes - LZY编码的字节序列
 * @returns {number[]} Unicode码点数组
 * @throws {Error} 无效LZY编码或Unicode码点时抛出错误
 */
function decode(inputBytes) {
    const l = inputBytes.length
    if (l === 0) {
        throw ERROR_UNICODE
    }

    // 寻找第一个最高位为0的字节（有效起始位置）
    let startIdx = -1
    for (let i = 0; i < l; i++) {
        if ((inputBytes[i] & 0x80) === 0) {
            startIdx = i
            break
        }
    }

    if (startIdx === -1) {
        throw ERROR_UNICODE
    }

    const validLen = l - startIdx
    if (validLen === 0) {
        throw ERROR_UNICODE
    }

    const output = []
    // JS数组无需手动预分配，push自动扩容，此处保持逻辑对齐

    let r = 0
    for (let i = startIdx; i < l; i++) {
        const b = inputBytes[i]
        if (b >> 7 === 0) {
            // 遇到单字节标记，处理上一个累积的码点（非起始位置）
            if (i > startIdx) {
                if (!validUnicode(r)) {
                    throw ERROR_UNICODE
                }
                output.push(r)
            }
            // 重置为当前单字节值
            r = b
        } else {
            // 累积码点：左移7位 + 低7位（排除0x80标记位）
            if (r > UNICODE_MAX >> 7) {
                throw ERROR_UNICODE
            }
            r = (r << 7) | (b & 0x7f)
        }
    }

    // 处理最后一个累积的码点
    if (!validUnicode(r)) {
        throw ERROR_UNICODE
    }
    output.push(r)

    return output
}

/**
 * 将LZY编码的Uint8Array解码为JS原生字符串（UTF-16）
 * @param {Uint8Array} inputBytes - LZY编码的字节序列
 * @returns {string} JS原生字符串
 * @throws {Error} 无效LZY编码或Unicode码点时抛出错误
 */
function decodeToString(inputBytes) {
    const runes = decode(inputBytes)
    // 将Unicode码点数组转换为JS字符串（处理代理对）
    let outputStr = ''
    for (const r of runes) {
        if (r <= 0xffff) {
            // 普通字符，直接转换
            outputStr += String.fromCharCode(r)
        } else {
            // 大于0xFFFF的字符，需要转换为代理对
            const offset = r - 0x10000
            const highSurrogate = SURROGATE_MIN + (offset >> 10)
            const lowSurrogate = 0xdc00 + (offset & 0x3ff)
            outputStr += String.fromCharCode(highSurrogate, lowSurrogate)
        }
    }
    return outputStr
}

/**
 * 将LZY编码的Uint8Array解码为UTF-8字节序列（Uint8Array）
 * @param {Uint8Array} inputBytes - LZY编码的字节序列
 * @returns {Uint8Array} UTF-8编码的字节序列
 * @throws {Error} 无效LZY编码或Unicode码点时抛出错误
 */
function decodeToBytes(inputBytes) {
    const outputStr = decodeToString(inputBytes)
    const encoder = new TextEncoder('utf-8')
    return encoder.encode(outputStr)
}

export {
    encode,
    encodeFromString,
    encodeFromBytes,
    decode,
    decodeToString,
    decodeToBytes,
}
