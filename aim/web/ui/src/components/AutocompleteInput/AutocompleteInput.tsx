import React from 'react';
import classNames from 'classnames';
import * as monacoEditor from 'monaco-editor';

import Editor, { useMonaco, loader } from '@monaco-editor/react';

import { getMonacoConfig } from 'config/monacoConfig/monacoConfig';
import { getBasePath } from 'config/config';

import { showAutocompletion } from 'utils/showAutocompletion';

import { IAutocompleteInputProps } from './ AutocompleteInput';

import './AutocompleteInput.scss';

// loading monaco from node modules instead of CDN
loader.config({
  paths: {
    vs: `${getBasePath()}/static-files/vs`,
  },
});

function AutocompleteInput({
  context,
  advanced,
  className,
  editorProps = {},
  value = '',
  refObject,
  //callback functions
  onEnter,
  onChange,
}: IAutocompleteInputProps) {
  const [hasSelection, setHasSelection] = React.useState(false);
  const [focused, setFocused] = React.useState<boolean>(false);
  const [mounted, setMounted] = React.useState<boolean>(false);
  const [editorValue, setEditorValue] = React.useState<string>(value);
  const monaco: any = useMonaco();
  const editorRef = React.useRef<any>();

  React.useEffect(() => {
    if (mounted) {
      monaco.editor.defineTheme(
        monacoConfig.theme.name,
        monacoConfig.theme.config,
      );
      monaco.editor.setTheme(monacoConfig.theme.name);
    }
    // inserting given object for autosuggestion
    handleBlur();
    const disposable = showAutocompletion(monaco, context);
    return () => {
      disposable?.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [monaco, context, mounted]);

  React.useEffect(() => {
    if (focused) {
      editorRef.current?.focus();
    }
  }, [focused, mounted]);

  React.useEffect(() => {
    if (value !== editorValue) {
      setEditorValue(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const monacoConfig: Record<any, any> = React.useMemo(() => {
    return getMonacoConfig(advanced);
  }, [advanced]);

  const handleFocus: () => void = React.useCallback((): void => {
    setFocused(true);
  }, []);

  const handleBlur: () => void = React.useCallback((): void => {
    setFocused(false);
  }, []);

  function handleDidMount(editor: monacoEditor.editor.IStandaloneCodeEditor) {
    setMounted(true);
    editorRef.current = editor;
    if (refObject) {
      refObject.current = editorRef.current;
    }
    editorRef.current.onDidFocusEditorWidget(handleFocus);
    editorRef.current.onDidBlurEditorWidget(handleBlur);
    editorRef.current.onDidChangeCursorSelection(onSelectionChange);
  }

  function onSelectionChange(
    e: monacoEditor.editor.ICursorSelectionChangedEvent,
  ) {
    if (e.selection) {
      const { startColumn, endColumn } = e.selection;
      const selectionPosition = startColumn !== endColumn;
      setHasSelection(selectionPosition);
    }
  }

  const handleChange = React.useCallback(
    (
      val: string | undefined,
      ev: monacoEditor.editor.IModelContentChangedEvent,
    ) => {
      if (typeof val === 'string') {
        // formatting value to avoid the new line
        let formattedValue = (hasSelection ? editorValue : val).replace(
          /[\n\r]/g,
          '',
        );
        if (ev.changes[0].text === '\n') {
          editorRef.current!.setValue(formattedValue);
          if (onEnter) {
            onEnter();
          }
          if (onChange) {
            onChange(formattedValue, ev);
          }
        }
        setEditorValue(formattedValue);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hasSelection, onChange, onEnter],
  );

  return (
    <div
      onClick={handleFocus}
      className={classNames(`AutocompleteInput ${className || ''}`, {
        AutocompleteInput__focused: focused,
        AutocompleteInput__advanced: advanced,
      })}
    >
      <Editor
        language='python'
        height={monacoConfig.height}
        value={editorValue}
        onChange={handleChange}
        onMount={handleDidMount}
        loading={<span />}
        options={monacoConfig.options}
        {...editorProps}
      />
      {focused || editorValue ? null : (
        <div className='AutocompleteInput__placeholder'>
          Filter runs, e.g. run.learning_rate {'>'} 0.0001 and run.batch_size ==
          32
        </div>
      )}
    </div>
  );
}

AutocompleteInput.displayName = 'AutocompleteInput';

export default React.memo(AutocompleteInput);
