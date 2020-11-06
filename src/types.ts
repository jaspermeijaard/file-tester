export type FileType = "fit" | "gpx" | "tcx";

type ValidateResultBase<T extends FileType> =
    | {
          type: T;
          valid: true;
      }
    | {
          type: T | "unknown";
          valid: false;
          error?: string;
      };

type FitValidateResult = ValidateResultBase<"fit">;
type GpxValidateResult = ValidateResultBase<"gpx">;
type TscValidateResult = ValidateResultBase<"tcx">;

export type FileValidateResult = FitValidateResult | GpxValidateResult | TscValidateResult;

export type FileValidator = (content: Buffer) => Promise<FileValidateResult>;
