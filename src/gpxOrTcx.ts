import { FileValidator } from "./types";

/**
 * https://www.topografix.com/gpx/1/1/
 *
 */
export const validateGpxOrTcxFile: FileValidator = async (buffer) => {
    const head: string = buffer.toString().slice(0, 100).trim();

    if (head.indexOf("<?xml") !== 0 && head.indexOf("<gpx") !== 0) {
        return {
            type: "unknown",
            valid: false,
            error: `Missing <?xml AND <gpx`,
        };
    }

    if (head.indexOf("<TrainingCenterDatabase") > 0) {
        return {
            type: "tcx",
            valid: true,
            error: "Missing <TrainingCenterDatabase",
        };
    }

    return {
        type: "gpx",
        valid: true,
    };
};
