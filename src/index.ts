export class TimeoutError extends Error {
  constructor(message?: string) {
    super(message ?? 'timeout error');
    this.name = 'TimeoutError';
  }
}

export class CancellationError extends Error {
  constructor(message?: string) {
    super(message ?? 'cancellation error');
    this.name = 'CancellationError';
  }
}

interface BreakablePromiseWithResolvers<T> {
  promise: BreakablePromise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

export class BreakablePromise<T = unknown> extends Promise<T> {
  abortController: AbortController;
  abortSignal: AbortSignal;
  #timeout?: NodeJS.Timeout;

  constructor(
    executor: (
      resolve: (value: T | PromiseLike<T>) => void,
      reject: (reason?: unknown) => void
    ) => void
  ) {
    const abortController = new AbortController();

    super((resolve, reject) => {
      const handleAbort = () => {
        if (this.#timeout) {
          clearTimeout(this.#timeout);
        }
        reject(abortController.signal.reason);
        abortController.signal.removeEventListener('abort', handleAbort);
      };

      abortController.signal.addEventListener('abort', handleAbort);

      executor(resolve, reject);
    });

    this.abortController = abortController;
    this.abortSignal = abortController.signal;
  }

  then<TResult1 = T, TResult2 = never>(
    onfulfilled?:
      | ((value: T) => TResult1 | PromiseLike<TResult1>)
      | undefined
      | null,
    onrejected?:
      | ((reason: unknown) => TResult2 | PromiseLike<TResult2>)
      | undefined
      | null
  ): BreakablePromise<TResult1 | TResult2> {
    return Promise.prototype.then.call(
      this,
      onfulfilled,
      onrejected
    ) as BreakablePromise<TResult1 | TResult2>;
  }

  catch<TResult = never>(
    onrejected?:
      | ((reason: unknown) => TResult | PromiseLike<TResult>)
      | null
      | undefined
  ): BreakablePromise<T | TResult> {
    return Promise.prototype.catch.call(this, onrejected) as BreakablePromise<
      T | TResult
    >;
  }

  finally(onfinally?: (() => void) | null | undefined): BreakablePromise<T> {
    return Promise.prototype.finally.call(
      this,
      onfinally
    ) as BreakablePromise<T>;
  }

  cancel() {
    this.abortController.abort(CancellationError);
  }

  timeout(milliseconds: number) {
    if (this.#timeout) {
      clearTimeout(this.#timeout);
    }
    this.#timeout = setTimeout(() => {
      this.abortController.abort(TimeoutError);
    }, milliseconds);

    return this;
  }

  isCancelled() {
    return (
      this.abortSignal.aborted &&
      (this.abortSignal.reason as Error).name === 'CancellationError'
    );
  }

  isTimedOut() {
    return (
      this.abortSignal.aborted &&
      (this.abortSignal.reason as Error).name === 'TimeoutError'
    );
  }

  static isCancellationError(error: unknown): error is CancellationError {
    return (error as Error).name === 'CancellationError';
  }

  static isTimeoutError(error: unknown): error is TimeoutError {
    return (error as Error).name === 'TimeoutError';
  }

  static withResolvers<T>(): BreakablePromiseWithResolvers<T> {
    let resolve: BreakablePromiseWithResolvers<T>['resolve'] = () => {};
    let reject: BreakablePromiseWithResolvers<T>['reject'] = () => {};

    const promise = new BreakablePromise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });

    return {
      promise,
      reject,
      resolve,
    };
  }
}
