import * as Icons from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { useState } from "react";
import { useMutation, useQuery } from "react-query";

import { Spinner } from "../../components/Spinner";
import api from "../../services/api";
import { revalidateLiveQueriesOnScreen } from "../_app";

type EventObject = {
  content: string;
  target: string;
  date: string;
  dateTime: string;
  type: string;
};

interface EventProps {
  event: EventObject;
}

const eventStyles = {
  applied: { icon: "UserIcon", iconBackground: "bg-gray-400" },
  advanced: { icon: "ThumbUpIcon", iconBackground: "bg-blue-500" },
  completed: { icon: "CheckIcon", iconBackground: "bg-green-500" },
};

function Event({ event }: EventProps) {
  const Icon =
    Icons[
      eventStyles[event.type as keyof typeof eventStyles]
        .icon as keyof typeof Icons
    ];

  return (
    <li>
      <div className="relative flex space-x-3">
        <div>
          <span
            className={`${
              eventStyles[event.type as keyof typeof eventStyles].iconBackground
            } h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white`}
          >
            <Icon className="h-5 w-5 text-white" aria-hidden="true" />
          </span>
        </div>
        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
          <div>
            <p className="text-sm text-gray-500">
              {event.content}{" "}
              <strong className="font-medium text-gray-900">
                {event.target}
              </strong>
            </p>
          </div>
          <div className="text-right text-sm whitespace-nowrap text-gray-500">
            <time dateTime={event.dateTime}>{event.date}</time>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function Person() {
  const [isSaving, setIsSaving] = useState(false);

  const router = useRouter();

  const queryKey = ["people", router.query.pid];

  const { data } = useQuery<any, Error>(
    queryKey,
    async () => {
      const response = await api.get(`/people/${router.query.pid}`);
      return response.data;
    },
    { suspense: true }
  );

  function addEvent(personId: string) {
    return api.post("events", {
      personId,
    });
  }

  const mutation = useMutation(addEvent, {
    onMutate: () => setIsSaving(true),
    onSettled: async () => {
      await revalidateLiveQueriesOnScreen();

      setIsSaving(false);
    },
  });

  return (
    <div className="px-6">
      <div className="mt-4 flex justify-between">
        <p className="text-2xl font-semibold">{data.person.name}</p>
        <button
          onClick={() => mutation.mutate(router.query.pid as string)}
          type="button"
          disabled={isSaving}
          className="inline-flex items-center px-2 py-2 text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 focus:outline-none"
        >
          {!isSaving ? (
            <Icons.PlusIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Spinner className="h-4 w-4 text-white" />
          )}
        </button>
      </div>

      <div className="">
        <div className="py-8">
          {data.person.events.length > 0 ? (
            <div className="flow-root">
              <ul className="-mb-8">
                {data.person.events.map((event: EventObject, index: number) => (
                  <div className="relative pb-8" key={Math.random()}>
                    {index !== data.person.events.length - 1 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-px bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <Event event={event} key={Math.random()} />
                  </div>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-gray-500 text-sm">
              <p>No events.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
