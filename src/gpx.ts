import { FileType, FileValidator } from "./types";

/**
 * https://www.topografix.com/gpx/1/1/
 *
 */
export const validateGpxFile: (type: FileType) => FileValidator = (type) => async (buffer) => {
    let content: string = buffer.toString().slice(0, 300).trim();

    if (content.length < 9) {
        return {
            type,
            valid: false,
            error: "File to small to be a GPX file.",
        };
    }

    const noDeclaration = content.indexOf("<?xml") < 0;
    const noGpx = content.indexOf("<gpx") < 0;

    if (noDeclaration || noGpx) {
        const missingElements = [];

        if (noDeclaration) {
            missingElements.push("xml-declaration");
        }

        if (noGpx) {
            missingElements.push("gpx-opening");
        }

        return {
            type,
            valid: false,
            error: `File does not contain expected elements: ${missingElements.join(", ")}`,
        };
    }

    return {
        type,
        valid: true,
    };
};
