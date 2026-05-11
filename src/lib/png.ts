const PASSWORD_TO_EMBED = 's6915113!'

function crc32(data: Uint8Array): number {
  const table = new Uint32Array(256)
  for (let i = 0; i < 256; i++) {
    let c = i
    for (let j = 0; j < 8; j++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    }
    table[i] = c
  }
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc = table[(crc ^ data[i]) & 0xff] ^ (crc >>> 8)
  }
  return (crc ^ 0xffffffff) >>> 0
}

function buildTextChunk(keyword: string, value: string): Uint8Array {
  const encoder = new TextEncoder()
  const keyBytes = encoder.encode(keyword)
  const valBytes = encoder.encode(value)

  // Data = keyword + null byte + value
  const data = new Uint8Array(keyBytes.length + 1 + valBytes.length)
  data.set(keyBytes, 0)
  data[keyBytes.length] = 0
  data.set(valBytes, keyBytes.length + 1)

  const typeBytes = encoder.encode('tEXt')
  const crcInput = new Uint8Array(4 + data.length)
  crcInput.set(typeBytes, 0)
  crcInput.set(data, 4)
  const crc = crc32(crcInput)

  // 청크 = Length(4) + Type(4) + Data + CRC(4)
  const chunk = new Uint8Array(12 + data.length)
  const view = new DataView(chunk.buffer)
  view.setUint32(0, data.length)
  chunk.set(typeBytes, 4)
  chunk.set(data, 8)
  view.setUint32(8 + data.length, crc)

  return chunk
}

export function embedPassword(buffer: ArrayBuffer): Uint8Array {
  const src = new Uint8Array(buffer)
  const view = new DataView(buffer)

  // IHDR 청크 끝 위치 계산 (시그니처 8 + Length 4 + Type 4 + Data 13 + CRC 4 = 33)
  const ihdrEnd = 33
  const textChunk = buildTextChunk('password', PASSWORD_TO_EMBED)

  const result = new Uint8Array(src.length + textChunk.length)
  result.set(src.slice(0, ihdrEnd), 0)
  result.set(textChunk, ihdrEnd)
  result.set(src.slice(ihdrEnd), ihdrEnd + textChunk.length)

  // view 참조 유지를 위한 더미 사용
  void view

  return result
}
