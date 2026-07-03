import { Interceptor } from '../types';

const cleanPayloadInPlace = (data: any): any => {
  if (data === null || data === undefined) {
    return data;
  }
  if (typeof data === 'string') {
    if (data.includes('?X-Amz-') || data.includes('?X-Amz-Algorithm')) {
      return data.split('?')[0];
    }
    return data;
  }
  if (Array.isArray(data)) {
    for (let i = 0; i < data.length; i++) {
      data[i] = cleanPayloadInPlace(data[i]);
    }
    return data;
  }
  if (typeof data === 'object') {
    if (data.constructor && data.constructor.name === 'FormData') {
      return data;
    }
    for (const key of Object.keys(data)) {
      data[key] = cleanPayloadInPlace(data[key]);
    }
    return data;
  }
  return data;
};

/**
 * Interceptor that recursively strips query parameters (such as S3 signed URL params)
 * from string values in request payloads in-place before they are sent to the backend.
 */
export const cleanS3Interceptor: Interceptor = async (ctx, next) => {
  if (ctx.data) {
    cleanPayloadInPlace(ctx.data);
  }
  return next(ctx);
};
