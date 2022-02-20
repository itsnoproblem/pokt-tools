import { useMemo, useReducer } from 'react';
import { AsyncState } from 'react-use/lib/useAsync';

/** Function which makes a request */
export type RequestToMake = () => Promise<void>;

/**
 * Given an array of requestsToMake and a limit on the number of max parallel requests
 * queue up those requests and start firing them
 * - inspired by Rafael Xavier's approach here: https://stackoverflow.com/a/48007240/761388
 *
 * @param requestsToMake
 * @param maxParallelRequests the maximum number of requests to make - defaults to 6
 */
async function throttleRequests(requestsToMake: RequestToMake[], maxParallelRequests = 6) {
  // queue up simultaneous calls
  const queue: Promise<void>[] = [];
  for (let requestToMake of requestsToMake) {
    // fire the async function, add its promise to the queue,
    // and remove it from queue when complete
    const promise = requestToMake().then((res) => {
      queue.splice(queue.indexOf(promise), 1);
      return res;
    });
    queue.push(promise);

    // if the number of queued requests matches our limit then
    // wait for one to finish before enqueueing more
    if (queue.length >= maxParallelRequests) {
      await Promise.race(queue);
    }
  }
  // wait for the rest of the calls to finish
  await Promise.all(queue);
}

/**
 * The state that represents the progress in processing throttled requests
 */
export type ThrottledProgress<TData> = {
  /** the number of requests that will be made */
  totalRequests: number;
  /** the errors that came from failed requests */
  errors: Error[];
  /** the responses that came from successful requests */
  values: TData[];
  /** a value between 0 and 100 which represents the percentage of requests that have been completed (whether successfully or not) */
  percentageLoaded: number;
  /** whether the throttle is currently processing requests */
  loading: boolean;
};

function createThrottledProgress<TData>(totalRequests: number): ThrottledProgress<TData> {
  return {
    totalRequests,
    percentageLoaded: 0,
    loading: false,
    errors: [],
    values: [],
  };
}

/**
 * A reducing function which takes the supplied `ThrottledProgress` and applies a new value to it
 */
function updateThrottledProgress<TData>(
  currentProgress: ThrottledProgress<TData>,
  newData: AsyncState<TData>,
): ThrottledProgress<TData> {
  const errors = newData.error
    ? [...currentProgress.errors, newData.error]
    : currentProgress.errors;

  const values = newData.value
    ? [...currentProgress.values, newData.value]
    : currentProgress.values;

  const percentageLoaded =
    currentProgress.totalRequests === 0
      ? 0
      : Math.round(((errors.length + values.length) / currentProgress.totalRequests) * 100);

  const loading =
    currentProgress.totalRequests === 0
      ? false
      : errors.length + values.length < currentProgress.totalRequests;

  return {
    totalRequests: currentProgress.totalRequests,
    loading,
    percentageLoaded,
    errors,
    values,
  };
}

type ThrottleActions<TValue> =
  | {
      type: 'initialise';
      totalRequests: number;
    }
  | {
      type: 'requestSuccess';
      value: TValue;
    }
  | {
      type: 'requestFailed';
      error: Error;
    };

/**
 * Create a ThrottleRequests and an updater
 */
export function useThrottleRequests<TValue>() {
  function reducer(
    throttledProgressAndState: ThrottledProgress<TValue>,
    action: ThrottleActions<TValue>,
  ): ThrottledProgress<TValue> {
    switch (action.type) {
      case 'initialise':
        return createThrottledProgress(action.totalRequests);

      case 'requestSuccess':
        return updateThrottledProgress(throttledProgressAndState, {
          loading: false,
          value: action.value,
        });

      case 'requestFailed':
        return updateThrottledProgress(throttledProgressAndState, {
          loading: false,
          error: action.error,
        });
    }
  }

  const [throttle, dispatch] = useReducer(
    reducer,
    createThrottledProgress<TValue>(/** totalRequests */ 0),
  );

  const updateThrottle = useMemo(() => {
    /**
     * Update the throttle with a successful request
     * @param values from request
     */
    function requestSucceededWithData(value: TValue) {
      return dispatch({
        type: 'requestSuccess',
        value,
      });
    }

    /**
     * Update the throttle upon a failed request with an error message
     * @param error error
     */
    function requestFailedWithError(error: Error) {
      return dispatch({
        type: 'requestFailed',
        error,
      });
    }

    /**
     * Given an array of requestsToMake and a limit on the number of max parallel requests
     * queue up those requests and start firing them
     * - based upon https://stackoverflow.com/a/48007240/761388
     *
     * @param requestsToMake
     * @param maxParallelRequests the maximum number of requests to make - defaults to 6
     */
    function queueRequests(requestsToMake: RequestToMake[], maxParallelRequests = 6) {
      dispatch({
        type: 'initialise',
        totalRequests: requestsToMake.length,
      });

      return throttleRequests(requestsToMake, maxParallelRequests);
    }

    return {
      queueRequests,
      requestSucceededWithData,
      requestFailedWithError,
    };
  }, [dispatch]);

  return {
    throttle,
    updateThrottle,
  };
}
