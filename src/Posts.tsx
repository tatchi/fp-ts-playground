import React from "react";
import { right, left, Either } from "fp-ts/lib/Either";

interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

export type RemoteData<A> =
  | {
      readonly type: "NotAsked";
    }
  | {
      readonly type: "Loading";
    }
  | {
      readonly type: "Done";
      readonly value0: A;
    };

export const notAsked: RemoteData<never> = { type: "NotAsked" };

export const loading: RemoteData<never> = { type: "Loading" };

export function done<A>(value0: A): RemoteData<A> {
  return { type: "Done", value0 };
}

export function foldL<A, R>(
  fa: RemoteData<A>,
  handlers: {
    onNotAsked: () => R;
    onLoading: () => R;
    onDone: (value0: A) => R;
  }
): R {
  switch (fa.type) {
    case "NotAsked":
      return handlers.onNotAsked();
    case "Loading":
      return handlers.onLoading();
    case "Done":
      return handlers.onDone(fa.value0);
  }
}

const getPosts: () => Promise<RemoteData<Post[]>> = () => {
  return fetch("https://jsonplaceholder.typicode.com/posts")
    .then(response => response.json())
    .then(posts => done<Post[]>(posts));
};

// const useFetch: (url: string) => RemoteData<Post[]> = url => {
//   const [data, setData] = React.useState<RemoteData<Post[]>>(notAsked);
//   React.useEffect(() => {
//     setData(loading);
//     setTimeout(
//       () =>
//         fetch(url)
//           .then(response => response.json())
//           .then(posts => setData(done<Post[]>(posts))),
//       1000
//     );
//   }, [url]);

//   return data;
// };
const useFetch: <A, R>(
  url: string,
  handlers: {
    onNotAsked: () => R;
    onLoading: () => R;
    onDone: (value0: A) => R;
  }
) => void = (url, handlers) => {
  handlers.onNotAsked();
  // const [data, setData] = React.useState<RemoteData<Post[]>>(notAsked);
  React.useEffect(() => {
    handlers.onLoading();
    setTimeout(
      () =>
        fetch(url)
          .then(response => response.json())
          .then(posts => handlers.onDone(posts)),
      1000
    );
  }, [url]);
};

const Posts = () => {
  const data = useFetch("https://jsonplaceholder.typicode.com/posts");

  return (
    <div>
      {foldL<Post[], React.ReactNode>(data, {
        onNotAsked: () => "Not Asked",
        onLoading: () => "Loading...",
        onDone: data => data.map(p => <div key={p.id}>{p.title}</div>)
      })}
    </div>
  );
};

export default Posts;
