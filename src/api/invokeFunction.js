export class ApiError extends Error {
  constructor(code, status = 0) {
    super(code || 'unavailable');
    this.name = 'ApiError';
    this.code = code || 'unavailable';
    this.status = status;
  }
}

const DEFAULT_TIMEOUT_MS = 10000;

async function requestOnce(url, options) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS);

  try {
    const res = await fetch(url, {
      ...options,
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      signal: controller.signal,
    });

    let data = null;
    try {
      data = await res.json();
    } catch {
      data = null;
    }

    if (!res.ok) {
      throw new ApiError(data?.code || 'unavailable', res.status);
    }

    if (data && data.ok === false) {
      throw new ApiError(data.code || 'unavailable', res.status);
    }

    return data;
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError('unavailable', 0);
  } finally {
    window.clearTimeout(timer);
  }
}

export async function invokeApi(url, { method = 'POST', body } = {}) {
  const options = {
    method,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  };

  try {
    return await requestOnce(url, options);
  } catch (err) {
    const retryable =
      err instanceof ApiError && (err.status === 0 || err.status === 503);
    if (!retryable) throw err;
    return requestOnce(url, options);
  }
}
