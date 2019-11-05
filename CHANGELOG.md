# Changelog

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
