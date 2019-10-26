import xxhash from 'xxhashjs'
import fs from 'fs'

export async function getXXHash(...chunks) {
    const calc32 = xxhash.h32(0)

    for(let chunkIndex in chunks) {
        const chunk = chunks[chunkIndex]

        calc32.update(chunk)
    }

    return calc32.digit().toString()
}

export function getXXHashSync() {
    const calc32 = xxhash.h32(0)

    for(let chunkIndex in chunks) {
        const chunk = chunks[chunkIndex]

        calc32.update(chunk)
    }

    return calc32.digit().toString()
}

export async function getXXFileHash(filePath) {
    fs.readFile(filePath, (err, buffer) => {
        if(err)
            throw new Error(`unable to read file: ${filePath}`)

        return calc32 = xxhash.h32(buffer, 0).toString()
    })
}