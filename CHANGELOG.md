# Changelog

## 1.2.17 May 8 2020
- Add config command (gorarakelyan)
- Tune artifacts: images, metric_groups, params (gorarakelyan)

## 1.2.16 Apr 29 2020
- Add ability to pass numpy array as a segmentation mask (gorarakelyan)

## 1.2.15 Apr 29 2020
- Add basic image list tracking (gorarakelyan)

## 1.2.14 Apr 27 2020
- Optimize segmentation tracking insight to load faster (gorarakelyan)

## 1.2.13 Apr 25 2020
- Remove GitHub security alert (gorarakelyan)
- Add image semantic segmentation tracking (gorarakelyan)

## 1.2.12 Apr 20 2020
- Add missing init file for aim.sdk.artifacts.proto (@mike1808)

## 1.2.11 Apr 16 2020
- Make epoch property optional for Metric (gorarakelyan)

## 1.2.10 Apr 16 2020
- Serialize and store `Metric` records using protobuf and aimrecords (gorarakelyan)
- Create RecordWriter factory which handles artifact records saving (gorarakelyan)
- Extract artifact serialization to ArtifactWriter (mike1808)

## 1.2.9 Mar 16 2020
- Alert prerequisites installation message for running board (gorarakelyan)

## 1.2.8 Mar 15 2020
- Update profiler interface for keras (gorarakelyan)

## 1.2.7 Mar 14 2020
- Add board pull command (gorarakelyan)
- Change board ports to 43800,1,2 (gorarakelyan)
- Add ability to profile graph output nodes (gorarakelyan)
- Remove issue with autograd inside while loop (gorarakelyan)
- Add aim board development mode (gorarakelyan)
- Update board name hash algorithm to md5 (gorarakelyan)
- Add board CLI commands: up, down and upgrade (gorarakelyan)
- Add ability to tag version as a release candidate (gorarakelyan)

## 1.2.6 Feb 28 2020
- Add learning rate update tracking (gorarakelyan)

## 1.2.5 Feb 25 2020
- Add autocommit feature to push command: `aim push -c [-m <msg>]` (gorarakelyan)
- Add cli status command to list branch uncommitted artifacts (gorarakelyan)
- Add an ability to aggregate duplicated nodes within a loop (gorarakelyan)
- Remove gradient break issue when profiling output nodes (gorarakelyan)

## 1.2.4 Feb 20 2020
- Enable profiler to track nodes inside loops (gorarakelyan)
- Ability to disable profiler for evaluation or inference (gorarakelyan)

## 1.2.3 Feb 13 2020
- Set minimum required python version to 3.5.2 (gorarakelyan)

## 1.2.2 Feb 13 2020
- Downgrade required python version (gorarakelyan)

## 1.2.1 Feb 13 2020
- Edit README.md to pass reStructuredText validation on pypi (gorarakelyan)

## 1.2.0 Feb 13 2020
- Make aim CLI directly accessible from main.py (gorarakelyan)
- Add disk space usage tracking (gorarakelyan)
- Add profiler support for Keras (gorarakelyan)
- Add TensorFlow graph nodes profiler (gorarakelyan)
- Add command to run aim live container mounted on aim repo (gorarakelyan)
- Update profiler to track GPU usage (gorarakelyan)
- Add machine resource usage profiler (gorarakelyan)

## 1.1.1 Jan 14 2020
- Remove aim dependencies such as keras, pytorch and etc (gorarakelyan)

## 1.1.0 Jan 12 2020
- Update code diff tracking to be optional (gorarakelyan)
- Add default False value to aim init function (gorarakelyan)
- Update aim repo to correctly identify cwd (gorarakelyan)
- Update push command to commit if msg argument is specified (gorarakelyan)
- Add ability to initialize repo from within the sdk (gorarakelyan)

## 1.0.2 Jan 7 2020
- Remove objects dir from empty .aim branch index (gorarakelyan)

## 1.0.1 Dec 26 2019
- Add cil command to print aim current version (gorarakelyan)

## 1.0.0 Dec 25 2019
- Add aim version number in commit config file (gorarakelyan)
- Update push command to send username and check storage availability (gorarakelyan)
- Add hyper parameters tracking (gorarakelyan)
- Update push command to print shorter file names when pushing to remote (gorarakelyan)
- Update tracking artifacts to be saved in log format (gorarakelyan)
- Add pytorch cuda support to existing sdk artefacts (gorarakelyan)
- Add cli reset command (gorarakelyan)
- Add nested module tracking support to aim sdk (gorarakelyan)
- Add code difference tracking to aim sdk (gorarakelyan)
- Update aim push command to send commits (gorarakelyan)
- Add commit structure implementation (gorarakelyan)
- Add aim commit command synchronized with git commits (gorarakelyan)
- Add version control system factory (gorarakelyan)
- Update all insights example (gorarakelyan)
- Add model gradients tracking (gorarakelyan)
- Add model weights distribution tracking (gorarakelyan)
- Add aim correlation tracking (gorarakelyan)

## 0.2.9 Nov 30 2019
- Update push tolerance when remote origin is invalid (gorarakelyan)

## 0.2.8 Nov 30 2019
- Update aim auth public key search algorithm (gorarakelyan)

## 0.2.7 Nov 14 2019
- Update dependencies torch and torchvision versions (sgevorg)

## 0.2.6 Nov 5 2019
- Update aim track logger (gorarakelyan)

## 0.2.5 Nov 4 2019
- Add branch name validation (gorarakelyan)
- Add single branch push to aim push command (gorarakelyan)

## 0.2.4 Nov 3 2019
- Update aim auth print format (gorarakelyan)
- Update setup.py requirements (gorarakelyan)

## 0.2.3 Nov 3 2019
- Update package requirements (gorarakelyan)

## 0.2.2 Nov 1 2019
- Update package requirements (sgevorg)

## 0.2.1 Nov 1 2019
- Add paramiko to required in setup.py (sgevorg)

## 0.2.0 Nov 1 2019
- Update the repo to prep for open source pypi push (sgevorg)
- Add error and activity logging (sgevorg)
- Add push command robustness (gorarakelyan)
- Add cli auth command (gorarakelyan)
- Add public key authentication (gorarakelyan)
- Update push to send only branches (gorarakelyan)
- Add branching command line interface (gorarakelyan)
- Update skd interface (gorarakelyan)
- Add pytorch examples inside examples directory (gorarakelyan)
- Add model load sdk method (gorarakelyan)
- Add model checkpoint save tests (gorarakelyan)
- Update file sending protocol (gorarakelyan)
- Add model tracking (gorarakelyan)

## 0.1.0 - Sep 23 2019
- Update setup py to build cython extensions (gorarakelyan)
- Update tcp client to send multiple files through one connection (gorarakelyan)
- Update tcp client to send images (gorarakelyan)
- Update sdk track functionality to support multiple metrics (gorarakelyan)
- Update push command for sending repo to a given remote (gorarakelyan)
- Add cli remote commands (gorarakelyan)
- Update cli architecture from single group of commands to multiple groups (gorarakelyan)
- Add testing env first skeleton and versions (sgevorg)
- Add dummy exporting files from .aim-test (sgevorg)
- Add description for Testing Environment (sgevorg)
- Update metadata structure and handling (sgevorg)
- Add support for seq2seq models (sgevorg)
- Update the output of doker image build to be more informative and intuitive (sgevorg)
- Update README.MD with changed Aim messaging (sgevorg)
- Remove setup.cfg file (maybe temporarily) (sgevorg)
- Update the location for docker build template files, move to data/ (sgevorg)
- Update the `docs/cli.md` for aim-deploy docs (sgevorg)
- Add docker deploy `.aim/deploy_temp/<model>` cleanup at the end of the build (sgevorg)
- Add Docker Deploy via `aim-deploy` command (sgevorg)
- Add Docker image generate skeleton (sgevorg)
- Add AimModel.load_mode static function to parse `.aim` files (sgevorg)
- Update exporter to decouple from specifics of exporting and framework (sgevorg)
- Add model export with `.aim` extension (sgevorg)
- Remove pack/unpack of the metadata (sgevorg)
- Add pack/unpack to add metadata to model for engine processing (sgevorg)
- Add aim-deploy command configuration in cli (sgevorg)
- Add basic cli (sgevorg)
- Update setup.py for cli first version (sgevorg)
- Add initial cli specs (sgevorg)
- Add directories: the initial skeleton of the repo (sgevorg)
- Add gitignore, license file and other basics for repo (sgevorg)
