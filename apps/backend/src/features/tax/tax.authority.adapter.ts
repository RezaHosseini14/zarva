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

  isLiveConfigured(): boolean {
    const mode = this.config.get<string>('TAX_AUTHORITY_ADAPTER') ?? 'mock';
    const apiKey = this.config.get<string>('TAX_AUTHORITY_API_KEY') ?? '';
    return mode === 'live' && apiKey.trim().length > 0;
  }

  async submit(input: ITaxAuthoritySubmitInput): Promise<ITaxAuthoritySubmitResult> {
    if (!this.isLiveConfigured()) {
      throw new HttpException(
        'Tax authority adapter is not configured. Set TAX_AUTHORITY_ADAPTER=live and TAX_AUTHORITY_API_KEY.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    // Live protocol integration is infrastructure work; refuse fabricated receipts.
    throw new HttpException(
      'Tax authority live protocol is not implemented for this deployment',
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}
