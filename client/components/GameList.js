/* This example requires Tailwind CSS v2.0+ */
import {
  EnvelopeIcon,
  PhoneIcon,
  CurrencyDollarIcon,
} from "@heroicons/react/20/solid";

const people = [
  {
    name: "Degen Theatre",
    playerNumber: "1/2 Players",
    difficulty: "Beginner-Friendly",
    pot: 500,
    imageUrl:
      "https://images.unsplash.com/photo-1541278107931-e006523892df?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80",
  },
  // More people...
];

export default function GameList({ gameList }) {
  return (
    <ul
      role="list"
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3"
    >
      {gameList.map((game) => (
        <li
          key={game.name}
          className="col-span-1 flex flex-col divide-y divide-gray-200 rounded-lg bg-gray-800 text-center shadow"
        >
          <div className="flex flex-1 flex-col p-8">
            <img
              className="mx-auto h-32 w-32 flex-shrink-0 rounded-full"
              src={game.imageUrl}
              alt=""
            />
            <h3 className="mt-6 text-sm font-medium text-white">{game.name}</h3>
            <dl className="mt-1 flex flex-grow flex-col justify-between">
              <dt className="sr-only">playerNumber</dt>
              <dd className="text-sm text-gray-500">{game.playerNumber}</dd>
              <dt className="sr-only">difficulty</dt>
              <dd className="mt-3">
                <span className="rounded-full bg-green-200 px-2 py-1 text-xs font-medium text-green-900">
                  {game.difficulty}
                </span>
              </dd>
            </dl>
          </div>
          <div>
            <div className="-mt-px flex divide-x divide-gray-800 bg-gray-900">
              <div className="flex w-0 flex-1">
                <div className="relative -mr-px inline-flex w-0 flex-1 items-center justify-center rounded-bl-lg border border-transparent py-4 text-sm font-medium text-white ">
                  <CurrencyDollarIcon
                    className="h-5 w-5 text-gray-400"
                    aria-hidden="true"
                  />
                  <span className="ml-3">{game.pot}</span>
                </div>
              </div>
              <div className="-ml-px flex w-0 flex-1">
                <a
                  href={`tel:`}
                  className="relative inline-flex w-0 flex-1 items-center justify-center rounded-br-lg border border-transparent py-4 text-sm font-medium text-white hover:text-gray-700 bg-green-400"
                >
                  <span className="ml-3">Join</span>
                </a>
              </div>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
