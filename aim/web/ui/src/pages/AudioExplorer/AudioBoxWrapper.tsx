import React from 'react';
import moment from 'moment';
import AudioPlayer from 'material-ui-audio-player';

import { Button, Icon, Slider, Spinner, Text } from 'components/kit';
import ErrorBoundary from 'components/ErrorBoundary/ErrorBoundary';
import {
  IAudiBoxProgressProps,
  IAudioBoxVolumeProps,
} from 'components/kit/AudioBox/AudioBox.d';

import { BATCH_COLLECT_DELAY } from 'config/mediaConfigs/mediaConfigs';

import contextToString from 'utils/contextToString';

import 'components/kit/AudioBox/AudioBox.scss';

function AudiBoxProgress({ audio, isPlaying, src }: IAudiBoxProgressProps) {
  const [trackProgress, setTrackProgress] = React.useState(0);
  const intervalRef = React.useRef<any>({});

  React.useEffect(() => {
    return () => {
      clearInterval(intervalRef.current);
    };
  }, []);

  React.useEffect(() => {
    if (isPlaying && audio) {
      startTimer();
    } else {
      clearInterval(intervalRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPlaying, src]);

  function startTimer(): void {
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() => {
      setTrackProgress(Math.round(audio.currentTime));
    }, 300);
  }

  function onProgressChange(e: any, value: number | number[]): void {
    if (audio) {
      clearInterval(intervalRef.current);
      setTrackProgress(value as number);
    }
  }

  function onTimerChange(): void {
    if (audio) {
      clearInterval(intervalRef.current);
      audio.currentTime = trackProgress;
      if (isPlaying) {
        startTimer();
      }
    }
  }

  function formatDuration(): string {
    return moment
      .utc(Math.round(audio.duration || 0) * 1000)
      .format(defineTimeFormat(audio.duration || 0));
  }

  function defineTimeFormat(duration: number): string {
    return duration > 3600 ? 'HH:mm:ss' : 'mm:ss';
  }

  function formatProgress(): string {
    return moment
      .utc(Math.round(trackProgress) * 1000)
      .format(defineTimeFormat(audio.duration || 0));
  }

  return (
    <ErrorBoundary>
      <Slider
        containerClassName='AudioBox__controllers__progressSlider'
        onChangeCommitted={onTimerChange}
        onChange={onProgressChange}
        value={trackProgress}
        step={1}
        max={Math.round(audio?.duration)}
        min={0}
      />
      <div
        className={`AudioBox__controllers__timer ${
          audio?.duration > 3600 ? 'AudioBox__controllers__timer-long' : ''
        }`}
      >
        <Text weight={400} size={8}>
          {(audio && formatProgress()) || '00:00'}
        </Text>
        <Text weight={400} size={8}>
          / {(audio && formatDuration()) || '00:00'}
        </Text>
      </div>
    </ErrorBoundary>
  );
}

function AudioBoxVolume({ audio }: IAudioBoxVolumeProps) {
  const [volume, setVolume] = React.useState<number>(0.99);

  function onVolumeChange(e: any, value: number | number[]): void {
    if (audio) {
      audio.volume = value as number;
      setVolume(value as number);
    }
  }

  React.useEffect(() => {
    if (audio) {
      audio.volume = volume;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [volume]);

  function onVolumeToggle(): void {
    if (audio) {
      if (audio.volume === 0) {
        setVolume(0.99);
      } else {
        setVolume(0);
      }
    }
  }

  return (
    <ErrorBoundary>
      <div
        className={`AudioBox__controllers__volume ${
          audio ? '' : 'AudioBox__controllers__volume-disabled'
        }`}
      >
        <Button
          onClick={onVolumeToggle}
          withOnlyIcon
          size='small'
          className='AudioBox__controllers__volume--button'
        >
          <Icon name={volume === 0 ? 'voice-off' : 'voice-on'} />
        </Button>
        <div className='AudioBox__controllers__volume__Slider'>
          <Slider
            onChange={onVolumeChange}
            value={volume}
            step={0.01}
            defaultValue={1}
            max={0.99}
            min={0}
          />
        </div>
      </div>
    </ErrorBoundary>
  );
}

function AudioBoxWrapper(
  props: any,
): React.FunctionComponentElement<React.ReactNode> {
  const data = props.data.data;
  const engine = props.engine;
  const { blob_uri } = data;
  const [isPlaying, setIsPlaying] = React.useState<boolean>(false);
  const [audio, setAudio] = React.useState<any>(null);
  const [processing, setProcessing] = React.useState<boolean>(false);
  let [src, setSrc] = React.useState<string>('');
  let [blobData, setBlobData] = React.useState<string>(
    engine.blobURI.getBlobData(blob_uri),
  );
  let [muted, setMuted] = React.useState<boolean>(true);

  React.useEffect(() => {
    let timeoutID: number;
    let unsubscribe: any;
    if (processing) {
      if (blobData === null) {
        if (engine.blobURI.getBlobData(blob_uri)) {
          setBlobData(engine.blobURI.getBlobData(blob_uri));
        } else {
          unsubscribe = engine.blobURI.on(blob_uri, (blobData: string) => {
            setBlobData(blobData);
            unsubscribe();
          });
          timeoutID = window.setTimeout(() => {
            if (engine.blobURI.getBlobData(blob_uri)) {
              setBlobData(engine.blobURI.getBlobData(blob_uri));
              unsubscribe();
            } else {
              // addUriToList(blob_uri);
            }
          }, BATCH_COLLECT_DELAY);
        }
      }
    }
    return () => {
      if (timeoutID) {
        clearTimeout(timeoutID);
      }
      if (unsubscribe) {
        unsubscribe();
      }
      if (audio) {
        audio.pause();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [processing]);

  React.useEffect(() => {
    if (blobData) {
      const audioRef = new Audio();
      audioRef.autoplay = true;
      audioRef.muted = true;
      audioRef.src = `data:audio/${data.format};base64,${blobData}`;
      setSrc(`data:audio/${data.format};base64,${blobData}`);
      setAudio(audioRef);
      setMuted(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blobData]);

  React.useEffect(() => {
    if (isPlaying) {
      audio?.play().then(() => {
        setMuted(false);
      });
    } else {
      audio?.pause();
    }
  }, [isPlaying, audio]);

  React.useEffect(() => {
    // Pause and clean up on unmount
    if (audio) {
      audio.addEventListener('ended', onAudioEnded);
      audio.addEventListener('canplay', handleReadyToPlay);
    }
    return () => {
      if (audio) {
        audio.pause();
        audio.removeEventListener('ended', onAudioEnded);
        audio.removeEventListener('canplay', handleReadyToPlay);
      }
    };
  }, [audio]);

  React.useEffect(() => {
    if (!muted) {
      audio.muted = false;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [muted]);

  function handleReadyToPlay(): void {
    setProcessing(false);
  }

  function onAudioEnded(): void {
    setIsPlaying(false);
  }

  function onPLayChange(): void {
    if (audio) {
      setIsPlaying(!isPlaying);
    } else {
      setProcessing(true);
      engine.blobURI
        .getBlobsData([blob_uri])
        .call()
        .then((a: any) => {
          setIsPlaying(!isPlaying);
        });
    }
  }

  function onDownload(): void {
    if (audio) {
      handleDownload();
    } else {
      setProcessing(true);
      engine.blobURI
        .getBlobsData([blob_uri])
        .call()
        .then((a: any) => {
          handleDownload();
        });
    }
  }

  function handleDownload(): void {
    const element: HTMLAnchorElement = document.createElement('a');
    const { index, format, context, step, caption, audio_name } = data;
    const contextName: string =
      contextToString(context) === '' ? '' : `_${contextToString(context)}`;
    const name: string = `${audio_name}${contextName}_${caption}_${step}_${index}`;
    element.setAttribute('href', `data:audio/${format};base64,${blobData}`);
    element.setAttribute('download', name);
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  return (
    <ErrorBoundary>
      <div className='AudioBox'>
        <div className='AudioBox__controllers'>
          {audio ? (
            <Button
              onClick={onPLayChange}
              color='secondary'
              withOnlyIcon
              size='small'
            >
              <Icon name={isPlaying ? 'pause' : 'play'} />
            </Button>
          ) : (
            <div className='AudioBox__controllers__Player'>
              <AudioPlayer
                displaySlider={false}
                volume={false}
                displayCloseButton={false}
                onPlayed={onPLayChange}
                width='24px'
                src={src}
              />
              {processing ? (
                <Spinner
                  className='Icon__container'
                  size={12}
                  color='#414b6d'
                  thickness={2}
                />
              ) : (
                <Icon name={isPlaying ? 'pause' : 'play'} />
              )}
            </div>
          )}
          <AudiBoxProgress audio={audio} isPlaying={isPlaying} src={src} />
          <AudioBoxVolume audio={audio} />
          <Button withOnlyIcon size='small' onClick={onDownload}>
            {processing ? (
              <Spinner
                className='Icon__container'
                size={12}
                color='#414b6d'
                thickness={2}
              />
            ) : (
              <Icon name='download' />
            )}
          </Button>
        </div>
        <Text
          title={data?.caption || ''}
          className='AudioBox__caption'
          size={8}
          weight={400}
        >
          {data?.caption || ''}
        </Text>
      </div>
    </ErrorBoundary>
  );
}

export default AudioBoxWrapper;
