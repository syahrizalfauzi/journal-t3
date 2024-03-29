import Link from "next/link";
import { useRouter } from "next/router";
import { ParsedUrlQueryInput } from "querystring";
import React, { Children, ReactElement } from "react";
import LayoutProps from "../types/LayoutProps";

type Props = LayoutProps & {
  pathName: string;
  isSegmented?: boolean;
  className?: string;
  activeClassName: string;
  inactiveClassName?: string;
  scroll?: boolean;
  query?: ParsedUrlQueryInput;
};

export const ActiveLink = ({
  children,
  isSegmented = true,
  pathName: href,
  activeClassName,
  inactiveClassName,
  className: linkClassName,
  scroll,
  query,
  ...props
}: Props) => {
  const pathname = useRouter().asPath.split("?")[0] ?? "";
  const child = Children.only(children);

  const currentPaths = pathname.split("/").filter((_, i) => i !== 0);
  const currentLength = currentPaths.length;
  const targetPaths = href.split("/").filter((_, i) => i !== 0);
  const targetLength = targetPaths.length;
  const samePath =
    currentLength > 0 && targetLength > 0 && currentLength > targetLength
      ? (targetPaths as unknown[]).reduce<boolean>(
          (prev, next, index) => prev && next === currentPaths[index],
          true
        )
      : false;

  const isActive = pathname === href || (isSegmented ? samePath : false);
  const className = isActive
    ? `${linkClassName} ${activeClassName}`.trim()
    : `${linkClassName} ${inactiveClassName}`.trim();

  return (
    <Link
      href={{
        pathname: href,
        query,
      }}
      scroll={scroll}
      {...props}
      passHref
    >
      {React.cloneElement(child as ReactElement, {
        className: className || null,
      })}
    </Link>
  );
};
