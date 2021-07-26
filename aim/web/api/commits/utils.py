import numpy as np
import struct

from typing import Iterator, Tuple, Optional

from aim.storage.context import Context
from aim.storage.run import Run
from aim.storage.trace import Trace
from aim.storage.trace import QueryTraceCollection


def collect_x_axis_data(x_trace: Trace, iters: np.ndarray) -> Tuple[np.ndarray, np.ndarray]:
    x_axis_values = []
    x_axis_iters = []
    for idx in iters:
        x_val = x_trace.values[idx.item()]
        if x_val:
            x_axis_iters.append(idx.item())
            x_axis_values.append(x_val)

    return np.array(x_axis_iters, dtype='int64',), np.array(x_axis_values, dtype='float64')


def sliced_np_array(array: np.ndarray, _slice: slice) -> np.ndarray:
    last_step_needed = (_slice.stop - 1) % _slice.step != 0
    if last_step_needed:
        return np.append(array[_slice], array[-1])
    else:
        return array[_slice]


def numpy_to_encodable(array: np.ndarray) -> dict:
    return {
        "_type": "numpy",
        "shape": array.shape[0],
        "dtype": str(array.dtype),
        "blob": array.tobytes()
    }


def aligned_traces_dict_constructor(requested_runs: list, x_axis: str) -> dict:
    processed_runs_dict = {}
    for run_data in requested_runs:
        run_name = run_data.get('name')
        requested_traces = run_data.get('traces')
        run = Run(run_name)

        traces_list = []
        for trace_data in requested_traces:
            context = Context(trace_data.get('context'))
            trace = run.get_trace(metric_name=trace_data.get('metric_name'),
                                  context=context)
            x_axis_trace = run.get_trace(metric_name=x_axis,
                                         context=context)
            if not (trace and x_axis_trace):
                continue

            _slice = slice(*trace_data.get('slice'))
            iters = trace.values.sparse_numpy()[0]
            sliced_iters = sliced_np_array(iters, _slice)
            x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, sliced_iters)
            traces_list.append({
                'metric_name': trace.name,
                'context': trace.context.to_dict(),
                'x_axis_values': numpy_to_encodable(x_axis_values),
                'x_axis_iters': numpy_to_encodable(x_axis_iters)
            })

        processed_runs_dict[run_name] = traces_list

    return processed_runs_dict


def query_traces_dict_constructor(traces: QueryTraceCollection, steps_num: int, x_axis: Optional[str]) -> dict:
    query_runs_collection = {}
    for trace in traces:
        if query_runs_collection.get(trace.run.name):
            query_runs_collection[trace.run.name].append(trace)
        else:
            query_runs_collection[trace.run.name] = [trace]

    runs_dict = {}
    for run_name in query_runs_collection.keys():
        run = Run(run_name)
        query_run_traces = query_runs_collection[run_name]
        traces_list = []
        for trace in query_run_traces:
            values, iters = trace.values.sparse_numpy()
            num_records = len(values)
            step = (num_records // steps_num) or 1
            _slice = slice(0, num_records, step)
            sliced_iters = sliced_np_array(iters, _slice)
            x_axis_trace = run.get_trace(x_axis, trace.context) if x_axis else None
            if x_axis_trace:
                x_axis_iters, x_axis_values = collect_x_axis_data(x_axis_trace, sliced_iters)

            traces_list.append({
                    'metric_name': trace.name,
                    'context': trace.context.to_dict(),
                    'slice': [0, num_records, step],
                    'values': numpy_to_encodable(sliced_np_array(values, _slice)),
                    'iters': numpy_to_encodable(sliced_iters),
                    'epochs': numpy_to_encodable(sliced_np_array(trace.epochs.values_numpy(), _slice)),
                    'timestamps': numpy_to_encodable(sliced_np_array(trace.timestamps.values_numpy(), _slice)),
                    'x_axis_values': x_axis_values if x_axis_trace and x_axis_values else None,
                    'x_axis_iters': x_axis_iters if x_axis_trace and x_axis_iters else None,
                })

        runs_dict[run.name] = {
            'params': run[...],
            'traces': traces_list
        }

    return runs_dict


async def encoded_tree_streamer(encoded_runs_tree: Iterator[Tuple[bytes, bytes]]) -> bytes:
    for key, val in encoded_runs_tree:
        yield struct.pack('I', len(key))
        yield key
        yield struct.pack('I', len(val))
        yield val
