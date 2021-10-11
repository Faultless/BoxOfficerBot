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
    year: "ul li:first-child a"
  });
