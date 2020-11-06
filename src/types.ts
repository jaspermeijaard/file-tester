export type FileType = "fit" | "gpx" | "tcx";

type FileValidateResultBase<T extends FileType> =
    | {
          type: T;
          valid: true;
      }
    | {
          type: T;
          valid: false;
          error?: string;
      };

type FitValidateResult = FileValidateResultBase<"fit">;
type GpxValidateResult = FileValidateResultBase<"gpx">;
type TscValidateResult = FileValidateResultBase<"tcx">;

export type FileValidateResult = FitValidateResult | GpxValidateResult | TscValidateResult;

export type FileValidator = (content: Buffer) => Promise<FileValidateResult>;
