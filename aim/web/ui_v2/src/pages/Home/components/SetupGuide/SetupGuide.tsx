import React from 'react';
import CodeBlock from 'components/CodeBlock/CodeBlock';
import Icon from 'components/Icon/Icon';

import './SetupGuide.scss';

function SetupGuide(): React.FunctionComponentElement<React.ReactNode> {
  return (
    <div className='SetupGuide__container'>
      <h2>Quick setup</h2>
      <div className='SetupGuide__code'>
        <h3>1. Installation</h3>
        <CodeBlock code='pip install aim' />
      </div>
      <div className='SetupGuide__code'>
        <h3>2. Import Aim</h3>
        <CodeBlock code='import aim' />
      </div>
      <div className='SetupGuide__code'>
        <h3>3. Track Experiment</h3>
        <CodeBlock
          code={`
r = aim.sdk.Run(experiment='my_exp_name')
r.track(value, name='loss', context={'subset': 'train'})
r['hparams'] = 'foo'`}
        />
      </div>
      <div className='StyleGuide__resources__container'>
        <a
          target='_blank'
          href='https://github.com/aimhubio/aim#overview'
          rel='noreferrer'
          className='SetupGuide__resource__item'
        >
          <div className='StyleGuide__resource__item__icon'>
            <Icon name='runs' />
          </div>
          <span>Full docs</span>
        </a>
        <div className='SetupGuide__resource__item'>
          <div className='StyleGuide__resource__item__icon'>
            <Icon name='bookmarks' />
          </div>
          <span>Jupyter notebook</span>
        </div>
        <div className='SetupGuide__resource__item'>
          <div className='StyleGuide__resource__item__icon'>
            <Icon name='metrics' />
          </div>
          <span>Live demo</span>
        </div>
      </div>
    </div>
  );
}

export default React.memo(SetupGuide);
