import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import type { AppProps } from "next/app";
import { useRouter } from "next/router";
import { QueryClientProvider, useQuery } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";

import "../styles/globals.css";
import { makeServer } from "../services/mirage";
import { queryClient } from "../services/queryClient";
import { Spinner } from "../components/Spinner";
import api from "../services/api";

if (process.env.NODE_ENV === "development") {
  makeServer();
}

interface PersonLinkProps {
  person: {
    id: string;
    name: string;
    eventIds: string[];
  };
}

function PersonLink({ person }: PersonLinkProps) {
  const router = useRouter();
  const active = router.asPath === `/people/${person.id}`;

  return (
    <li>
      <Link href={`/people/${person.id}`}>
        <a
          className={`
          ${active ? "bg-gray-200" : "hover:bg-gray-50"}
          pl-4 pr-3 py-4 flex items-center rounded -my-px relative -mx-1`}
        >
          <div className="flex justify-between items-center w-full">
            <p className="text-sm font-medium">{person.name}</p>
            <span
              className={`${
                active ? "text-blue-500" : "text-blue-500"
              } text-xs font-semibold w-4 inline-block text-center`}
            >
              {person.eventIds.length > 0 && person.eventIds.length}
            </span>
          </div>
        </a>
      </Link>
    </li>
  );
}

function MyApp({ Component, pageProps }: AppProps) {
  const [hasRendered, setHasRendered] = useState(false);

  useEffect(() => {
    setHasRendered(true);
  }, []);

  const { data } = useQuery<any, Error>(
    "people",
    async () => {
      const response = await api.get("people");
      return response.data;
    },
    { suspense: true }
  );

  return (
    <div className="antialiased flex h-screen">
      <aside className="w-1/3">
        <div className="border-r flex flex-col max-h-full">
          <Link href="/">
            <a className="px-7 pt-4 pb-2 text-lg font-semibold border-b ">
              People
            </a>
          </Link>
          <ul className="divide-y divide-gray-100 max-h-full overflow-y-scroll px-4 pt-2">
            {data.people.map((person: any) => (
              <PersonLink person={person} key={person.id} />
            ))}
            test
          </ul>
        </div>
      </aside>

      <main className="w-2/3">
        <div className="overflow-y-scroll max-h-full">
          {hasRendered ? (
            <Suspense
              fallback={
                <div className="w-full flex justify-center pt-12">
                  <Spinner />
                </div>
              }
            >
              <Component {...pageProps} />
            </Suspense>
          ) : (
            <Component {...pageProps} />
          )}
        </div>
      </main>
    </div>
  );
}

function Wrapper({ Component, pageProps }: AppProps) {
  const [isFirstRender, setIsFirstRender] = useState(true);

  useEffect(() => {
    setIsFirstRender(false);
  }, []);

  const router = useRouter();

  if (!router.isReady || isFirstRender) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Suspense
        fallback={
          <div className="w-screen h-screen flex justify-center pt-12">
            <Spinner />
          </div>
        }
      >
        <MyApp Component={Component} {...pageProps} />
      </Suspense>

      <ReactQueryDevtools />
    </QueryClientProvider>
  );
}

export default Wrapper;
