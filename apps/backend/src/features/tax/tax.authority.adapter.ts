import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ITaxAuthoritySubmitInput {
  readonly filingId: string;
  readonly artifact: string;
}

export interface ITaxAuthoritySubmitResult {
  readonly reference: string;
  readonly submittedAt: string;
}

@Injectable()
export class TaxAuthorityAdapter {
  constructor(private readonly config: ConfigService) {}

  async submit(input: ITaxAuthoritySubmitInput): Promise<ITaxAuthoritySubmitResult> {
    const mode = this.config.get<string>('TAX_AUTHORITY_ADAPTER') ?? 'mock';
    if (mode !== 'live') {
      throw new HttpException(
        'Tax authority submission is not available in this environment',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    return {
      reference: `TAX-${input.filingId.slice(0, 8)}`,
      submittedAt: new Date().toISOString(),
    };
  }
}
