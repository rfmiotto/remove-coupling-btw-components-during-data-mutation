/* eslint func-names: "off" */

import {
  belongsTo,
  createServer,
  Factory,
  hasMany,
  Model,
  Serializer,
} from "miragejs";
import { faker } from "@faker-js/faker";
import { parseISO, add, format } from "date-fns";

type Event = {
  content: string;
  target: string;
  date: string;
  dateTime: string;
  type: string;
  person: any;
};

type Person = {
  name: string;
  image: string;
  events: any;
};

faker.seed(5);

export function makeServer() {
  const server = createServer({
    models: {
      person: Model.extend<Partial<Person>>({
        events: hasMany(),
      }),
      event: Model.extend<Partial<Event>>({
        person: belongsTo(),
      }),
    },

    serializers: {
      application: Serializer.extend({
        serializeIds: "always",
      }),
      personWithRelationships: Serializer.extend({
        embed: true,
        include: ["events"],
      }),
    },

    factories: {
      person: Factory.extend({
        name() {
          return faker.name.findName();
        },
        image() {
          return faker.image.avatar();
        },
      }),
    },

    seeds(_server) {
      _server.create("person", {
        events: [
          _server.create("event", {
            content: "Applied to",
            target: "Front End Developer",
            date: "Sep 20",
            dateTime: "2020-09-20",
            type: "applied",
          }),
          _server.create("event", {
            content: "Advanced to phone screening by",
            target: "Bethany Blake",
            date: "Sep 22",
            dateTime: "2020-09-22",
            type: "advanced",
          }),
          _server.create("event", {
            content: "Completed phone screening with",
            target: "Martha Gardner",
            date: "Sep 28",
            dateTime: "2020-09-28",
            type: "completed",
          }),
          _server.create("event", {
            content: "Advanced to interview by",
            target: "Bethany Blake",
            date: "Sep 30",
            dateTime: "2020-09-30",
            type: "advanced",
          }),
          _server.create("event", {
            content: "Completed interview with",
            target: "Katherine Snyder",
            date: "Oct 4",
            dateTime: "2020-10-04",
            type: "completed",
          }),
        ],
      });

      _server.createList("person", 10);
    },

    routes() {
      this.namespace = "api";

      this.get("/people", function (schema) {
        return schema.all("person").sort((a, b) => {
          return a.name > b.name ? 1 : -1;
        });
      });

      this.get("/people/:id", function (this: any, schema, request) {
        const person = schema.find("person", request.params.id);

        return this.serialize(person, "person-with-relationships");
      });

      this.get("/events", (schema) => {
        return schema.all("event");
      });

      this.post("/events", function (schema, request) {
        const attrs = JSON.parse(request.requestBody);
        const person = schema.find("person", attrs.personId);
        const date = add(parseISO("2022-03-10"), {
          days: person!.events.length,
        });
        const newEvents = [
          ["Applied to", "Front End Developer", "applied"],
          ["Advanced to phone screening by", "Someone", "advanced"],
          ["Completed phone screening with", "Someone", "completed"],
        ];
        const newEvent = newEvents[person!.events.length % 3];

        return schema.create("event", {
          content: newEvent[0],
          date: format(date, "MMM d"),
          dateTime: format(date, "yyyy-MM-dd"),
          target: newEvent[1],
          type: newEvent[2],
          ...attrs,
        });
      });

      this.namespace = "";
      this.passthrough();
    },
  });

  // Don't log passthrough
  if (server.pretender !== undefined) {
    server.pretender.passthroughRequest = () => {};
  }

  return server;
}
