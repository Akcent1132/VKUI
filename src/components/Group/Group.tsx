import * as React from "react";
import { getClassName } from "../../helpers/getClassName";
import { classNames } from "../../lib/classNames";
import { HasRootRef } from "../../types";
import { usePlatform } from "../../hooks/usePlatform";
import { Separator } from "../Separator/Separator";
import { hasReactNode } from "../../lib/utils";
import { Caption } from "../Typography/Caption/Caption";
import {
  withAdaptivity,
  AdaptivityProps,
  SizeType,
} from "../../hoc/withAdaptivity";
import { ModalRootContext } from "../ModalRoot/ModalRootContext";
import "./Group.css";

export interface GroupProps
  extends HasRootRef<HTMLElement>,
    React.HTMLAttributes<HTMLElement>,
    AdaptivityProps {
  header?: React.ReactNode;
  description?: React.ReactNode;
  /**
    show - разделитель всегда показывается,
    hide – разделитель всегда спрятан,
    auto – разделитель рисуется автоматически между соседними группами.
   */
  separator?: "show" | "hide" | "auto";
  /**
   * Режим отображения. Если установлен 'card', выглядит как карточка c
   * обводкой и внешними отступами. Если 'plain' — без отступов и обводки.
   * По умолчанию режим отображения зависит от `sizeX`. В модальных окнах
   * по умолчанию 'plain'.
   */
  mode?: "plain" | "card";
}

const GroupComponent = ({
  header,
  description,
  children,
  separator = "auto",
  getRootRef,
  mode,
  sizeX,
  ...restProps
}: GroupProps) => {
  const { isInsideModal } = React.useContext(ModalRootContext);
  const platform = usePlatform();

  let computedMode: GroupProps["mode"] = mode;

  if (!mode) {
    computedMode =
      sizeX === SizeType.COMPACT || isInsideModal ? "plain" : "card";
  }

  return (
    <section
      {...restProps}
      ref={getRootRef}
      vkuiClass={classNames(
        getClassName("Group", platform),
        `Group--sizeX-${sizeX}`,
        `Group--${computedMode}`
      )}
    >
      <div vkuiClass="Group__inner">
        {header}
        {children}
        {hasReactNode(description) && (
          <Caption vkuiClass="Group__description">{description}</Caption>
        )}
      </div>

      {separator !== "hide" && (
        <Separator
          // eslint-disable-next-line vkui/no-object-expression-in-arguments
          vkuiClass={classNames("Group__separator", {
            "Group__separator--force": separator === "show",
          })}
          expanded={computedMode === "card"}
        />
      )}
    </section>
  );
};

/**
 * @see https://vkcom.github.io/VKUI/#/Group
 */
export const Group = withAdaptivity(GroupComponent, { sizeX: true });

Group.displayName = "Group";
