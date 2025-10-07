declare module 'resend' {
  export interface SendEmailOptions {
    from: string;
    to: string[];
    subject: string;
    html: string;
  }
  export class Resend {
    constructor(apiKey: string);
    emails: { send(opts: SendEmailOptions): Promise<any> };
  }
}
