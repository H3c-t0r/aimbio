import React from 'react';
import _ from 'lodash-es';

import ErrorBoundary from 'components/ErrorBoundary';
import VisualizationTooltip from 'components/VisualizationTooltip';

import { ITooltipConfig } from 'modules/BaseExplorer/components/Controls/ConfigureTooltip';
import { IAxesPropsConfig } from 'modules/BaseExplorer/components/Controls/ConfigureAxes';
import TooltipContent from 'modules/BaseExplorer/components/Widgets/VisualizerTooltip/TooltipContent';

import { AimFlatObjectBase } from 'types/core/AimObjects';

import getTooltipContent from './getTooltipContent';

import { IVisualizerTooltipProps } from './index';

function VisualizerTooltip(props: IVisualizerTooltipProps) {
  const {
    tooltipContentHeader: TooltipContentHeader,
    boxContainer,
    engine,
    engine: { useStore, pipeline },
    visualizationName,
    appContainerNode,
  } = props;
  const vizEngine = engine.visualizations[visualizationName];
  const controls = vizEngine.controls;
  const dataState = useStore(pipeline.dataSelector);
  const foundGroups = useStore(pipeline.foundGroupsSelector);

  const focusedState = useStore(engine.focusedState.stateSelector);
  const activeElement = useStore(engine.activeElement.stateSelector);

  const tooltip: ITooltipConfig = useStore(controls.tooltip.stateSelector);
  const updateTooltipConfig = controls.tooltip.methods.update;

  const zoom = useStore(controls.zoom.stateSelector);
  const axesPropsConfig: IAxesPropsConfig = useStore(
    controls.axesProperties.stateSelector,
  );

  const objectBase: AimFlatObjectBase = dataState.find(
    (item: AimFlatObjectBase) => item.key === activeElement.key,
  );

  const [openPopover, setOpenPopover] = React.useState(false);

  const renderHeader = () => {
    return TooltipContentHeader ? (
      <TooltipContentHeader
        name={objectBase.data.name}
        context={objectBase.data.context}
        yValue={activeElement.yValue}
        xValue={activeElement.xValue}
        alignment={axesPropsConfig?.alignment}
      />
    ) : undefined;
  };

  const tooltipContent = getTooltipContent(
    objectBase,
    tooltip,
    foundGroups,
    renderHeader,
  );

  const containerRect = React.useMemo(
    () => boxContainer.current.getBoundingClientRect(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [boxContainer.current],
  );

  const popoverIsOpen = React.useMemo(
    () => !zoom?.active && tooltip?.display,
    [zoom?.active, tooltip?.display],
  );

  React.useEffect(() => {
    setOpenPopover(popoverIsOpen);
  }, [popoverIsOpen]);

  React.useEffect(() => {
    if (appContainerNode) {
      const onScrollEnd = _.debounce(() => setOpenPopover(popoverIsOpen), 200);
      const onScroll = _.debounce(() => setOpenPopover(false), 100, {
        leading: true,
        trailing: false,
      });

      appContainerNode.addEventListener('scroll', onScroll);
      appContainerNode.addEventListener('scroll', onScrollEnd);
      return () => {
        appContainerNode?.removeEventListener('scroll', onScroll);
        appContainerNode?.removeEventListener('scroll', onScrollEnd);
      };
    }
  }, [appContainerNode, popoverIsOpen]);

  /**
   * elementRect - is the rect of the active element, which taken into account the container rect
   * do not memoize the value, since the "activeElement.rect" state is changing on every mouse move
   */
  const elementRect = activeElement.rect
    ? {
        top: containerRect.top + activeElement.rect.top,
        left: containerRect.left + activeElement.rect.left,
        right: containerRect.left + activeElement.rect.right,
        bottom: containerRect.top + activeElement.rect.bottom,
      }
    : null;
  return (
    <ErrorBoundary>
      <VisualizationTooltip
        key={visualizationName + '-visualizerTooltip'}
        containerNode={boxContainer.current}
        elementRect={elementRect}
        open={openPopover}
        forceOpen={focusedState.active}
        tooltipAppearance={tooltip?.appearance}
      >
        <TooltipContent
          onChangeTooltip={updateTooltipConfig}
          tooltipAppearance={tooltip?.appearance}
          focused={focusedState.active}
          run={tooltipContent.run}
          selectedProps={tooltipContent.selectedProps}
          selectedGroupingProps={tooltipContent.selectedGroupingProps}
          renderHeader={tooltipContent.renderHeader}
        />
      </VisualizationTooltip>
    </ErrorBoundary>
  );
}

VisualizerTooltip.displayName = 'VisualizerTooltip';

export default React.memo(VisualizerTooltip);
