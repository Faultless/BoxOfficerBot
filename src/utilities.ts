import Xray from "x-ray";

const x = Xray();

const SEARCH_BASE_URL = "https://imdb.com/find?q=";
const IMDB_BASE_URL = "https://imdb.com/title";

export const buildSearchURL = (searchString: string) =>
  `${SEARCH_BASE_URL}${searchString.split(" ").join("+")}&s=tt&exact=true`;

export const buildTitleURL = (id: string) => `${IMDB_BASE_URL}/${id}`;

export const buildRatingURL = (id: string) => `${buildTitleURL(id)}/ratings`;

export const getSearchResults = (queryString: string) => {
  return x(
    buildSearchURL(queryString),
    ".findSection .findList tr.findResult",
    [
      {
        thumbnail: ".primary_photo img@src",
        title: ".result_text",
        url: ".result_text a@href",
      },
    ]
  );
};

export const getTrailer = (id: string) =>
  x(buildTitleURL(id), ".ipc-slate a.ipc-lockup-overlay", {
    trailerUrl: "@href",
  });

export const getRating = (id: string) =>
  x(buildRatingURL(id), { rating: ".ipl-rating-star__rating" });

export const getTitle = (id: string) =>
  x(buildTitleURL(id), ".ipc-page-section", {
    title: "h1",
    subsLinks: x('ul', ['li span']) as unknown as Array<string>,
    subs: x('ul', ['li']) as unknown as Array<string>,
  });


export const hasDate = (str: string) => str.match(/[0-9]{4}/i) !== null;

export const hasDuration = (str: string) => str.match(/min$/i) !== null;

export const hasGuidance = (str: string) => str.match(/PG-[0-9]{2}/i) !== null || str.match(/^(R|E|M|TV-PG)$/) !== null;

export const isMovie = (s: string[]) => !isSeries(s) && !isVideoGame(s);

export const isSeries = (subs: string[]) => subs.findIndex(s => s === 'TV Series') !== -1;

export const isVideoGame = (subs: string[]) => subs.findIndex(s => s === 'Video Game') !== -1;