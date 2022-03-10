## Migrate from other tools

The Aim explorers add true superpowers to the AI engineer's arsenal. However not all training runs may have been tracked
by Aim. So it is important to be able to port existing training run logs. There might be 1000s of training runs tracked
with other tools. Aim has built-in converters to easily migrate logs from other tools. These migrations cover the most
common usage scenarios. In case of custom and complex scenarios you can use Aim SDK to implement your own conversion
script.

As of Aim `v3.6.0` the following converters are supported:

- [TensorFlow events converter](#show-tensorflow-events-in-aim)
- [MLFlow logs converter](#show-mlflow-logs-in-aim)

We are working to constantly improve existing converters and implement new ones.

### Show TensorFlow events in Aim

Aim gives you a possibility to convert [TensorFlow](https://www.tensorflow.org/api_docs/python/tf)
event files into native format and show them directly inside the Aim UI.

Before showing the events in Aim, the event files have to pass the conversion process.

Please note that only the following TF plugins are currently supported

- scalar
- image

To convert TensorFlow events, `aim convert` command must be run on your log directory.

```shell
aim convert tf --logdir ~/tensorflow/logdir
```

To make conversion process smooth please ensure that logs directory structure follows conventions below. Consider the
following directory hierarchy:

```
~/tensorflow/logdir/
    ├> run_1/
    │    ├> <tf_events_file_1>
    │    └> <tf_events_file_2>
    ├> group_1/
    │    ├> <tf_events_file_3> (THIS EVENT WILL BE IGNORED)
    │    ├> run_2/
    │    │    ├> train/
    │    │    │    ├> <tf_events_file_4>
    │    │    │    └> <tf_events_file_5>
    │    │    ├> validate/
    │    │    │    ├> <tf_events_file_6>
    │    │    │    └> <tf_events_file_7>
    │    │    ├> <tf_events_file_8> (IGNORED IF "--flat" IS ACTIVE)
    │    │    └> <tf_events_file_9> (IGNORED IF "--flat" IS ACTIVE)
    │    └> run_3/
    │        ├> <tf_events_file_10>
    │        └> <tf_events_file_11>
    ├> <tf_events_file_12> (THIS EVENT WILL BE IGNORED)
    └> <tf_events_file_13> (THIS EVENT WILL BE IGNORED)
```

Note that directory naming is not mandated and its up to you how to name them.

The conversion logic categorizes your hierarchy into one of `group`, `run` and `context`
categories where.

- group: Is a directory which has one or more run directories inside it,
- run: Is a directory which has either event files or context directory inside it,
- context: Is a directory inside of run directory which has an event file inside it.

Conversion process will scan and determine `run` directories for your hierarchy and will create a distinct run for each
of them.

From the hierarchy example above you can see that the following event files will be ignored since the converter treats
them as unorganized event files.

- `<logidr>/group_1/tf_events_file_3`
- `<logdir>/tf_events_file_12`
- `<logdir>/tf_events_file_13`

All other events will either have `Context` or `No Context`. Context of the event is the name of the parent directory if
the parent directory hasn't been categorized into neither as `run` nor `group` category.

For example:

- Events right underneath `run_1`, `run_2` and `run_3` will have no context
- Events under `run_2/train` and `run_2/validate` will have `train` and `validate` as context accordingly.

In case the converter finds unorganized event files in your hierarchy a warning message will be issued.

To make the converter process these events, consider re-structuring your directories so that it matches the sample
structure. (i.e. create a new directory and moving your unorganized events there)

You can make converter treat every directory as a distinct run by supplying `--flat` option. In this case the following
directories will be categorized as a `run` directory.

- `~/tensorflow/logdir/run_1/`
- `~/tensorflow/logdir/group_1/run_2/train/`
- `~/tensorflow/logdir/group_1/run_2/validate/`
- `~/tensorflow/logdir/group_1/run_3/`

The event files in all other directories will be ignored.

### Show MLflow logs in Aim

Aim gives you a possibility to convert [MLflow](https://mlflow.org/) runs into native format and show them directly on
Aim UI.

Before showing your MLlfow runs on Aim, they need to pass conversion process where your metrics, tags, parameters, run
description/notes and *some* artifacts will be transferred into Aim storage.

Please note that as for now, only the artifacts having the following file extensions will be transferred into Aim
storage!

* Images: `(
  'jpg',
  'bmp',
  'jpeg',
  'png',
  'gif',
  'svg'
  )`

* Texts: `(
  'txt',
  'log',
  'py',
  'js',
  'yaml',
  'yml',
  'json',
  'csv',
  'tsv',
  'md',
  'rst',
  'jsonnet'
  )`

* Sound/Audios: `(
  'flac',
  'mp3',
  'wav'
  )`

To convert MLflow runs, `aim convert mlflow` command must be run on your log directory:

```commandline
$ aim init
$ aim convert mlflow --tracking_uri 'file:///Users/aim_user/mlruns'
```

You can also set the `MLFLOW_TRACKING_URI` environment variable to have MLflow find a URI from there. In both cases, the
URI can either be an HTTP/HTTPS URI for a remote server, a database connection string, or a local path to log data to a
directory.

The conversion process will iterate over all your Experiments and create a distinct run for each run inside the
experiment. If you want to process only a single experiment, you can provide the experiment id or name to the conversion
command:

```commandline
$ aim convert mlflow --tracking_uri 'file:///Users/aim_user/mlruns' --experiment 0
```

While converting the artifacts, the converter will try to determine file content type only based on its extension. A
warning message will be issued if artifact cannot be categorized, these artifacts will not be transferred to aim!
Please check the command output logs if you fail to see your artifact in Aim's web.

If you think there is problem with this conversion process
please [open an issue](https://github.com/aimhubio/aim/issues/new/choose).

Once conversion process is complete - you can enjoy the power of Aim 🚀
