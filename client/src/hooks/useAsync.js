import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * Load data on mount (and whenever `deps` change).
 * Returns { data, error, loading, reload, setData }.
 */
export function useAsync(loader, deps = []) {
  const [state, setState] = useState({ data: null, error: null, loading: true });
  const loaderRef = useRef(loader);
  useLayoutEffect(() => {
    loaderRef.current = loader;
  });

  const reload = useCallback(async () => {
    setState((s) => ({ ...s, loading: true }));
    try {
      const data = await loaderRef.current();
      setState({ data, error: null, loading: false });
      return data;
    } catch (error) {
      setState((s) => ({ ...s, error, loading: false }));
      return null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    loaderRef
      .current()
      .then((data) => active && setState({ data, error: null, loading: false }))
      .catch((error) => active && setState((s) => ({ ...s, error, loading: false })));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  const setData = useCallback(
    (update) => setState((s) => ({ ...s, data: typeof update === 'function' ? update(s.data) : update })),
    []
  );

  return { ...state, reload, setData };
}
