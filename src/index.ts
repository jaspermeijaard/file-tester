import * as fs from "fs";
// @ts-ignore
import { getArrayBuffer, calculateCRC } from "fit-file-parser/dist/binary";

type FileType = "tsc" | "gpx" | "fit";
type FileTester = (content: Buffer) => Promise<boolean>;

/**
 * https://developer.garmin.com/fit/protocol/
 */
const fitTester: FileTester = async (content) => {
    const blob = new Uint8Array(getArrayBuffer(content));

    if (blob.length < 12) {
        throw new Error("File to small to be a FIT file");
    }

    const headerLength = blob[0];
    if (headerLength !== 14 && headerLength !== 12) {
        throw new Error("Incorrect header size");
    }

    let fileTypeString = "";
    for (let i = 8; i < 12; i++) {
        fileTypeString += String.fromCharCode(blob[i]);
    }

    if (fileTypeString !== ".FIT") {
        throw new Error("Missing '.FIT' in header");
    }

    if (headerLength === 14) {
        const crcHeader = blob[12] + (blob[13] << 8);
        const crcHeaderCalc = calculateCRC(blob, 0, 12);
        if (crcHeader !== crcHeaderCalc) {
            throw new Error("Header CRC mismatch");
        }
    }

    const dataLength = blob[4] + (blob[5] << 8) + (blob[6] << 16) + (blob[7] << 24);
    const crcStart = dataLength + headerLength;
    const crcFile = blob[crcStart] + (blob[crcStart + 1] << 8);
    const crcFileCalc = calculateCRC(blob, headerLength === 12 ? 0 : headerLength, crcStart);

    if (crcFile !== crcFileCalc) {
        throw new Error("File CRC mismatch");
    }

    return true;
};

const testers: Record<FileType, FileTester> = {
    fit: fitTester,
    gpx: async () => false,
    tsc: async () => false,
};

const test = (type: FileType, path: string): Promise<FileType | "unknown"> => {
    return new Promise((resolve) => {
        fs.readFile(path, async (_, content) => {
            await testers[type](content)
                .then((positive) => {
                    positive ? resolve(type) : resolve("unknown");
                })
                .catch(() => resolve("unknown"));
        });
    });
};

const application = async () => {
    return [
        await test("fit", "./data/COURSE_24609884.fit"),
        await test("fit", "./data/COURSE_24609884"),
        await test("fit", "./data/SpeedCoachGPSJustGo.fit"),
        await test("fit", "./data/png"),
    ];
};

application().then(console.log).catch(console.error);
