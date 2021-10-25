import React from 'react';
import { ICopyToClipBoardProps } from 'types/components/CopyToClipBoard/CopyToClipBoard';

import { Icon } from 'components/kit';

function CopyToClipboard({
  contentRef,
  showSuccessDelay = 1500,
  className = '',
}: ICopyToClipBoardProps): React.FunctionComponentElement<ICopyToClipBoardProps> {
  const [showCopiedIcon, setShowCopiedIcon] = React.useState<boolean>(false);

  React.useEffect(() => {
    if (showCopiedIcon) {
      setTimeout(() => {
        setShowCopiedIcon(false);
      }, showSuccessDelay);
    }
  }, [showCopiedIcon]);

  const onCopy = React.useCallback(() => {
    if (contentRef.current && !showCopiedIcon) {
      navigator.clipboard
        .writeText(contentRef.current.innerText.trim(''))
        .then(function () {
          setShowCopiedIcon(true);
        })
        .catch();
    }
  }, [contentRef, showCopiedIcon]);

  return (
    <span className={className} onClick={onCopy}>
      {showCopiedIcon ? (
        <span style={{ color: 'green', fontSize: 12 }}>Copied!</span>
      ) : (
        <Icon name='copy' />
      )}
    </span>
  );
}

CopyToClipboard.displayName = 'CopyToClipBoard';

export default React.memo<ICopyToClipBoardProps>(CopyToClipboard);
