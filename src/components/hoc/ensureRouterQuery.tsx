import { useRouter } from "next/router";

export const ensureRouterQuery = (queryString: string, Component: React.FC) => {
  // eslint-disable-next-line react/display-name
  return () => {
    const { query } = useRouter();
    if (!query[queryString]) return null;
    return <Component />;
  };
};
