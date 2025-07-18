import { Type } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

import { ResponseStatus } from '../constants/response.constant';

export function generateResponse<T>(classRef: Type<T> | Type<T>[] | null) {
  class CommonResponse {
    static ok(data: any): CommonResponse {
      return {
        status: ResponseStatus.SUCCESS,
        data,
        message: null,
        error: null,
      };
    }

    @ApiProperty({ required: true, enum: Object.values(ResponseStatus), example: ResponseStatus.SUCCESS })
    status: ResponseStatus;

    @ApiProperty({ required: false, type: classRef as any })
    data?: T;

    @ApiProperty({ required: false, example: null })
    message?: string | string[] | object | null;

    @ApiProperty({ required: false, example: null })
    error?: string | null;
  }

  return CommonResponse;
}

export class CommonErrorResponse {
  static error({ message, error }: { message?: string | string[] | object; error?: string }) {
    return {
      status: ResponseStatus.ERROR,
      message,
      error,
    };
  }
}
