import { Interceptor } from '../types';

const cleanPayload = (data: any): any => {
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
    return data.map(cleanPayload);
  }
  if (typeof data === 'object') {
    // Avoid traversing FormData instances in React Native
    if (data.constructor && data.constructor.name === 'FormData') {
      return data;
    }
    const cleanObj: any = {};
    for (const key of Object.keys(data)) {
      cleanObj[key] = cleanPayload(data[key]);
    }
    return cleanObj;
  }
  return data;
};

/**
 * Interceptor that recursively strips query parameters (such as S3 signed URL params)
 * from string values in request payloads before they are sent to the backend.
 */
export const cleanS3Interceptor: Interceptor = async (ctx, next) => {
  if (ctx.data) {
    ctx.data = cleanPayload(ctx.data);
  }
  return next(ctx);
};
