import * as fs from "fs";
import { validateFitFile } from "./fit";
import { validateGpxFile } from "./gpx";
import { FileValidator, FileType } from "./types";

const validators: FileValidator[] = [
    validateGpxFile("gpx"),
    validateGpxFile("tcx"), // @TODO: Threat TCX not like GPX.
    validateFitFile,
];

const test = (path: string): Promise<FileType | "unknown"> => {
    return new Promise((resolve, reject) => {
        fs.readFile(path, async (error, content) => {
            if (error) {
                reject(error);
                return;
            }

            for (const validator of validators) {
                try {
                    const result = await validator(content);

                    if (result.valid) {
                        resolve(result.type);
                        return;
                    }
                } catch (error) {
                    reject(error);
                    return;
                }
            }

            resolve("unknown");
            return;
        });
    });
};

const application = async () => {
    const format = async (path: string) => ({ path, result: await test(path) });

    return [
        await format("./data/COURSE_24609884.fit"),
        await format("./data/COURSE_24609884.fit"),
        await format("./data/SpeedCoachGPSJustGo.fit"),
        await format("./data/png"),
        await format("./data/polar_51741794.gpx"),
        await format("./data/polar_53037570.gpx"),
        await format("./data/polar_fail_53274073.gpx"),
        await format("./data/polar_run_53134683.gpx"),
        await format("./data/polar_to_fixed_error_53323911.gpx"),
        await format("./data/264191_ridewithgps_ridewithgps_file.tcx"),
        await format("./data/439636_ridewithgps_ridewithgps_file.tcx"),
    ];
};

application().then(console.log).catch(console.error);
