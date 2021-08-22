const Xray = require("x-ray");
const x = Xray({
  filters: {
    trim: function (value) {
      return typeof value === "string" ? value.trim() : value;
    },
    reverse: function (value) {
      return typeof value === "string"
        ? value.split("").reverse().join("")
        : value;
    },
    slice: function (value, start, end) {
      return value.slice(start, end);
    },
  },
});

x(
  "https://www.imdb.com/title/tt0159206",
  ".ipc-slate a.ipc-lockup-overlay",
  "@href"
).then(console.log);
x(
  "https://www.imdb.com/title/tt0159206/ratings",
  ".ipl-rating-star__rating"
).then(console.log);
