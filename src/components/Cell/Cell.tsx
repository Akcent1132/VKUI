import * as React from 'react';
import { classNames } from '../../lib/classNames';
import { getClassName } from '../../helpers/getClassName';
import { ANDROID, IOS, VKCOM } from '../../lib/platform';
import SimpleCell, { SimpleCellProps } from '../SimpleCell/SimpleCell';
import { HasPlatform } from '../../types';
import { Removable, RemovableProps } from '../Removable/Removable';
import { usePlatform } from '../../hooks/usePlatform';
import { useDraggable } from './useDraggable';
import { ListContext } from '../List/ListContext';
import { CellDragger } from './CellDragger/CellDragger';
import { CellCheckbox, CellCheckboxProps } from './CellCheckbox/CellCheckbox';
import './Cell.css';

export interface CellProps extends SimpleCellProps, HasPlatform, RemovableProps {
  mode?: 'removable' | 'selectable';
  /**
   * В режиме перетаскивания ячейка перестает быть кликабельной, то есть при клике переданный onClick вызываться не будет
   */
  draggable?: boolean;
  /**
   * @deprecated Будет удалено в 5.0.0. Используйте mode="removable"
   */
  removable?: boolean;
  /**
   * Имя для input в режиме selectable
   */
  name?: string;
  /**
   * @deprecated Будет удалено в 5.0.0. Используйте mode="selectable"
   */
  selectable?: boolean;
  /**
   * В режиме selectable реагирует на входящие значения пропса cheсked, как зависящий напрямую от входящего значения
   */
  checked?: boolean;
  /**
   * В режиме selectable реагирует на входящие значения пропса defaultChecked как неконтролируемый компонент
   */
  defaultChecked?: boolean;
  /**
   * Коллбэк срабатывает при завершении перетаскивания.
   * **Важно:** режим перетаскивания не меняет порядок ячеек в DOM. В коллбэке есть объект с полями `from` и `to`.
   * Эти числа нужны для того, чтобы разработчик понимал, с какого индекса на какой произошел переход. В песочнице
   * есть рабочий пример с обработкой этих чисел и перерисовкой списка.
   */
  onDragFinish?: ({ from, to }: { from: number; to: number }) => void;
  /**
   * aria-label для кнопки перетаскивания ячейки
   */
  draggerLabel?: string;
}

export const Cell: React.FC<CellProps> = ({
  mode: propsMode, // TODO: убрать переименование в propsMode перед 5.0.0
  onRemove,
  removePlaceholder = 'Удалить',
  onDragFinish,
  before,
  after,
  disabled,
  removable: deprecatedRemovable, // TODO: удалить перед 5.0.0
  draggable,
  selectable: deprecatedSelectable, // TODO: удалить перед 5.0.0
  Component,
  onChange,
  name,
  checked,
  defaultChecked,
  getRootRef,
  draggerLabel = 'Перенести ячейку',
  ...restProps
}: CellProps) => {
  // TODO: удалить эту и следующие 7 строк перед 5.0.0
  let mode: CellProps['mode'] = propsMode;

  if (!propsMode && (deprecatedSelectable || deprecatedRemovable)) {
    mode = deprecatedSelectable
      ? 'selectable'
      : 'removable';
  }

  const selectable = mode === 'selectable';
  const removable = mode === 'removable';

  const platform = usePlatform();

  const { dragging, rootElRef, ...draggableProps } = useDraggable({ onDragFinish });

  const { toggleDrag } = React.useContext(ListContext);
  React.useEffect(() => {
    if (dragging) {
      toggleDrag(true);
      return () => toggleDrag(false);
    }
    return undefined;
  }, [dragging]);

  let dragger;
  if (draggable) {
    dragger = <CellDragger aria-label={draggerLabel} {...draggableProps} />;
  }

  let checkbox;
  if (selectable) {
    const checkboxProps: CellCheckboxProps = { name, onChange, defaultChecked, checked, disabled };
    checkbox = <CellCheckbox {...checkboxProps} />;
  }

  const simpleCellDisabled = draggable && !selectable || removable || disabled;
  const hasActive = !simpleCellDisabled && !dragging;

  const simpleCell = (
    <SimpleCell
      hasActive={hasActive}
      hasHover={hasActive}
      vkuiClass={classNames(getClassName('Cell', platform), {
        'Cell--dragging': dragging,
        'Cell--removable': removable,
        'Cell--selectable': selectable,
        'Cell--disabled': disabled,
      })}
      {...restProps}
      getRootRef={rootElRef}
      disabled={simpleCellDisabled}
      Component={selectable ? 'label' : Component}
      before={
        <React.Fragment>
          {draggable && (platform === ANDROID || platform === VKCOM) && dragger}
          {selectable && checkbox}
          {before}
        </React.Fragment>
      }
      after={
        <React.Fragment>
          {draggable && platform === IOS && dragger}
          {after}
        </React.Fragment>
      }
    />
  );

  return removable
    ? <Removable removePlaceholder={removePlaceholder} onRemove={(e) => onRemove(e, rootElRef?.current)}>{simpleCell}</Removable>
    : simpleCell
  ;
};
