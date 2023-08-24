import { AIM_VERSION, getBasePath } from 'config/config';

import { fetchPackages } from 'modules/core/api/projectApi';

import { search } from 'pages/Board/serverAPI/search';
import { runFunction } from 'pages/Board/serverAPI/runFunction';
import { find } from 'pages/Board/serverAPI/find';

import pyodideEngine from './store';

declare global {
  interface Window {
    search: Function;
    runFunction: Function;
    findItem: Function;
    updateLayout: Function;
    setState: Function;
    pyodideEngine: typeof pyodideEngine;
  }
}

window.search = search;
window.runFunction = runFunction;
window.findItem = find;

let queryResultsCacheMap: Map<string, any> = new Map();
let pendingQueriesMap: Map<string, Map<string, any>> = new Map();

export function getQueryResultsCacheMap() {
  return queryResultsCacheMap;
}

export function clearQueryResultsCache(key?: string) {
  let pyodide = pyodideEngine.getPyodideCurrent();
  let namespace = pyodideEngine.getPyodideNamespace();

  if (pyodide) {
    if (key) {
      pyodide.runPython(`query_results_cache.pop('${key}', None)`, {
        globals: namespace,
      });

      queryResultsCacheMap.delete(key);
    } else {
      pyodide.runPython('query_results_cache.clear()', { globals: namespace });
      queryResultsCacheMap = new Map();
    }
  }
}

export function getPendingQueriesMap() {
  return pendingQueriesMap;
}

export function clearPendingQueriesMap(boardPath: string) {
  if (pendingQueriesMap.has(boardPath)) {
    let queriesMap = pendingQueriesMap.get(boardPath);
    if (queriesMap) {
      for (let [key, cancel] of queriesMap) {
        cancel();
        queriesMap.delete(key);
      }
    }
    pendingQueriesMap.delete(boardPath);
  }
}

export function resetBoardState(boardPath: string) {
  let pyodide = pyodideEngine.getPyodideCurrent();
  let namespace = pyodideEngine.getPyodideNamespace();

  if (pyodide) {
    pyodide.runPython(`state.pop('${boardPath}', None)`, {
      globals: namespace,
    });
  }
}

let layoutUpdateTimer: number;
let prevBoardPath: undefined | string;

window.updateLayout = (items: any, boardPath: undefined | string) => {
  let layout = pyodideJSProxyMapToObject(items.toJs());
  items.destroy();

  let elements: Record<string, any[]> = {};

  for (let item of layout) {
    let boardPath = item.board_path;
    if (!elements.hasOwnProperty(boardPath)) {
      elements[boardPath] = [];
    }
    if (item.element === 'block') {
      elements[boardPath].push(item);
    } else {
      if (item.parent_block?.type === 'table_cell') {
        let tabelCell = null;
        for (let elem of elements[boardPath]) {
          if (
            elem.element === 'block' &&
            elem.block_context.id === item.parent_block.id
          ) {
            tabelCell = elem;
          }
        }

        if (tabelCell) {
          for (let elem of layout) {
            if (elem.key === tabelCell.options.table) {
              elem.data[tabelCell.options.column][tabelCell.options.row] = item;
            }
          }
        }
      }

      elements[boardPath].push(item);
    }
  }

  if (prevBoardPath === boardPath) {
    window.clearTimeout(layoutUpdateTimer);
  }

  prevBoardPath = boardPath;

  layoutUpdateTimer = window.setTimeout(() => {
    const treeMap = new Map();

    treeMap.set('root', {
      id: 0,
      elements: new Map(),
    });

    const tree = constructTree(elements[boardPath!], treeMap);

    pyodideEngine.events.fire(
      boardPath as string,
      { layoutTree: tree },
      { savePayload: false },
    );
  }, 50);
};

window.setState = (update: any, boardPath: string, persist = false) => {
  let stateUpdate = update.toJs();
  update.destroy();
  let state = pyodideJSProxyMapToObject(stateUpdate);

  // This section add persistence for state through saving it to URL and localStorage

  if (persist && boardPath === window.location.pathname.slice(5)) {
    // TODO: remove hardcoded '/app/' from pathname
    const stateStr = encodeURIComponent(JSON.stringify(state[boardPath]));

    const url = new URL(window.location as any);

    const prevStateStr = url.searchParams.get('state');

    if (stateStr !== prevStateStr) {
      url.searchParams.set('state', stateStr);
      window.history.pushState({}, '', url as any);
    }
  }

  pyodideEngine.events.fire(
    boardPath as string,
    {
      state: state[boardPath],
    },
    { savePayload: false },
  );
};

export async function loadPyodideInstance() {
  pyodideEngine.setPyodide({
    current: null,
    namespace: null,
    isLoading: true,
    registeredPackages: [],
  });
  // @ts-ignore
  const pyodide = await window.loadPyodide({
    stdout: (...args: any[]) => {
      window.requestAnimationFrame(() => {
        const terminal = document.getElementById('console');
        if (terminal) {
          terminal.innerHTML! += `<p>${args.join(', ')}</p>`;
          terminal.scrollTop = terminal.scrollHeight;
        } else {
          // eslint-disable-next-line no-console
          console.log(...args);
        }
      });
    },
    stderr: (...args: any[]) => {
      // eslint-disable-next-line no-console
      console.log(...args);
    },
  });

  const namespace = pyodide.toPy({});
  const coreFile = await fetch(
    `${getBasePath()}/static-files/aim_ui_core.py?v=${AIM_VERSION}`,
  );
  const coreCode = await coreFile.text();
  pyodide.runPython(coreCode, { globals: namespace });

  const availablePackages = await fetchPackages();

  Object.keys(availablePackages).forEach((packageName) => {
    let packageData = availablePackages[packageName];

    let jsModule: Record<string, {}> = {};
    packageData.sequences.forEach((sequenceType: string) => {
      let dataTypeName = sequenceType.slice(`${packageName}.`.length);

      jsModule[dataTypeName] = {
        filter: (...args: any[]) => {
          let queryArgs: Record<string, string | number> = {
            query: '',
          };
          for (let i = 0; i < args.length; i++) {
            if (typeof args[i] === 'object') {
              Object.assign(queryArgs, args[i]);
            } else {
              queryArgs[i] = args[i];
            }
          }

          let val = pyodide.runPython(
            `query_filter('${sequenceType}', ${JSON.stringify(
              queryArgs[0] ?? queryArgs['query'],
            )}, ${queryArgs[1] ?? queryArgs['count'] ?? 'None'}, ${
              queryArgs[2] ?? queryArgs['start'] ?? 'None'
            }, ${queryArgs[3] ?? queryArgs['stop'] ?? 'None'}, True)`,
            { globals: namespace },
          );

          return val;
        },
        find: (...args: any[]) => {
          let queryArgs: Record<string, string | number> = {};
          for (let i = 0; i < args.length; i++) {
            if (
              typeof args[i] === 'object' &&
              (args[i].hasOwnProperty('hash_') ||
                args[i].hasOwnProperty('name') ||
                args[i].hasOwnProperty('context'))
            ) {
              Object.assign(queryArgs, args[i]);
            } else {
              queryArgs[i] = args[i];
            }
          }

          let hash_ = queryArgs[0] ?? queryArgs['hash_'];
          let name = queryArgs[1] ?? queryArgs['name'];
          let ctx = queryArgs[2] ?? queryArgs['context'];

          let val = pyodide.runPython(
            `find_item('${sequenceType}', True, ${JSON.stringify(
              hash_,
            )}, ${JSON.stringify(name)}, ${ctx})`,
            { globals: namespace },
          );

          return val;
        },
      };
    });

    packageData.containers.forEach((containerType: string) => {
      let dataTypeName = containerType.slice(`${packageName}.`.length);

      jsModule[dataTypeName] = {
        filter: (query: string = '') => {
          let val = pyodide.runPython(
            `query_filter('${containerType}', ${JSON.stringify(
              query,
            )}, None, None, None, False)`,
            { globals: namespace },
          );
          return val;
        },
        find: (hash_: string) => {
          let val = pyodide.runPython(
            `find_item('${containerType}', False, ${JSON.stringify(hash_)})`,
            { globals: namespace },
          );
          return val;
        },
      };
    });

    packageData.functions.forEach((func_name: string) => {
      let funcName = func_name.slice(`${packageName}.`.length);

      jsModule[funcName] = (...args: any[]) => {
        let funcArgs: Record<string, unknown> = {};
        for (let i = 0; i < args.length; i++) {
          if (typeof args[i] === 'object') {
            Object.assign(funcArgs, args[i]);
          } else {
            funcArgs[i] = args[i];
          }
        }
        let val = pyodide.runPython(
          `run_function('${func_name}', ${JSON.stringify(funcArgs)})`,
          { globals: namespace },
        );
        return val;
      };
    });

    pyodide.registerJsModule(packageName, jsModule);
  });

  pyodideEngine.setPyodide({
    current: pyodide,
    namespace,
    isLoading: false,
    registeredPackages: Object.keys(availablePackages),
  });
}

export async function loadPandas() {
  const pyodide = pyodideEngine.getPyodideCurrent();
  await pyodide.loadPackage('pandas');
}

export async function loadPlotly() {
  const pyodide = pyodideEngine.getPyodideCurrent();
  await pyodide.loadPackage('micropip');
  try {
    const micropip = pyodide.pyimport('micropip');
    await micropip.install('plotly');
  } catch (ex) {
    // eslint-disable-next-line no-console
    console.log(ex);
  }
}

window.pyodideEngine = pyodideEngine;

const toObjectDict = {
  [Map.name]: (x: Map<any, any>) =>
    Object.fromEntries(
      Array.from(x.entries(), ([k, v]) => [k, pyodideJSProxyMapToObject(v)]),
    ),
  [Array.name]: (x: Array<any>) => x.map(pyodideJSProxyMapToObject),
};
export function pyodideJSProxyMapToObject(x: any): any {
  const cb = toObjectDict[x?.constructor.name];
  return cb ? cb(x) : x;
}

function constructTree(elems: any, tree: any) {
  for (let i = 0; i < elems.length; i++) {
    let elem = elems[i];
    if (elem.element === 'block') {
      if (!elem.parent_block) {
        let root = tree.get('root');
        root.elements.set(elem.block_context.id, {
          ...elem.block_context,
          elements: new Map(),
          ...elem,
        });
      } else {
        if (!tree.has(elem.parent_block.id)) {
          tree.set(elem.parent_block.id, {
            id: elem.parent_block.id,
            elements: new Map(),
            ...elem,
          });
        }
        let block = tree.get(elem.parent_block.id);
        block.elements.set(elem.block_context.id, {
          ...elem.block_context,
          elements: new Map(),
          ...elem,
        });
      }
      tree.set(elem.block_context.id, {
        ...elem.block_context,
        elements: new Map(),
        ...elem,
      });
    } else {
      if (!elem.parent_block) {
        let root = tree.get('root');
        root.elements.set(elem.key, elem);
      } else {
        if (!tree.has(elem.parent_block.id)) {
          tree.set(elem.parent_block.id, {
            id: elem.parent_block.id,
            elements: new Map(),
            data: elem.data,
          });
        }
        let block = tree.get(elem.parent_block.id);
        block.elements.set(elem.key, elem);
      }
    }
  }

  return tree;
}
