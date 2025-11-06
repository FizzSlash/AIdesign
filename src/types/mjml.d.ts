// Type definitions for MJML
declare module 'mjml' {
  interface MJMLParseResults {
    html: string;
    errors: Array<{
      line: number;
      message: string;
      tagName: string;
    }>;
  }

  interface MJMLParsingOptions {
    validationLevel?: 'strict' | 'soft' | 'skip';
    minify?: boolean;
    beautify?: boolean;
    filePath?: string;
  }

  function mjml2html(
    mjmlContent: string,
    options?: MJMLParsingOptions
  ): MJMLParseResults;

  export default mjml2html;
}

