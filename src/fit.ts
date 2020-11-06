import { FileType, FileValidator } from "./types";

/**
 * https://developer.garmin.com/fit/protocol/
 * https://github.com/backfit/backfit/blob/master/src/fit-parser.js
 */
export const validateFitFile: FileValidator = async (buffer) => {
    const type: FileType = "fit";

    // @TODO only read header and not full file
    const blob: Uint8Array = new Uint8Array(getArrayBuffer(buffer));

    if (blob.length < 12) {
        return {
            type,
            valid: false,
            error: "File to small to be a FIT file.",
        };
    }

    const headerLength = blob[0];
    if (headerLength !== 14 && headerLength !== 12) {
        return {
            type,
            valid: false,
            error: "Incorrect header size.",
        };
    }

    let fileTypeString = "";
    for (let i = 8; i < 12; i++) {
        fileTypeString += String.fromCharCode(blob[i]);
    }

    if (fileTypeString !== ".FIT") {
        return {
            type,
            valid: false,
            error: "Missing '.FIT' in header",
        };
    }

    if (headerLength === 14) {
        const crcHeader = blob[12] + (blob[13] << 8);
        const crcHeaderCalc = calculateCRC(blob, 0, 12);
        if (crcHeader !== crcHeaderCalc) {
            return {
                type,
                valid: false,
                error: "Header CRC mismatch",
            };
        }
    }

    return {
        type: "fit",
        valid: true,
    };
};

// https://github.com/backfit/backfit/blob/master/src/binary.js
export function getArrayBuffer(buffer: Buffer) {
    if (buffer instanceof ArrayBuffer) {
        return buffer;
    }
    const ab = new ArrayBuffer(buffer.length);
    const view = new Uint8Array(ab);
    for (let i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

// https://github.com/backfit/backfit/blob/master/src/binary.js
export function calculateCRC(blob: Uint8Array, start: number, end: number) {
    const crcTable = [
        0x0000,
        0xcc01,
        0xd801,
        0x1400,
        0xf001,
        0x3c00,
        0x2800,
        0xe401,
        0xa001,
        0x6c00,
        0x7800,
        0xb401,
        0x5000,
        0x9c01,
        0x8801,
        0x4400,
    ];

    let crc = 0;
    for (let i = start; i < end; i++) {
        const byte = blob[i];
        let tmp = crcTable[crc & 0xf];
        crc = (crc >> 4) & 0x0fff;
        crc = crc ^ tmp ^ crcTable[byte & 0xf];
        tmp = crcTable[crc & 0xf];
        crc = (crc >> 4) & 0x0fff;
        crc = crc ^ tmp ^ crcTable[(byte >> 4) & 0xf];
    }

    return crc;
}
