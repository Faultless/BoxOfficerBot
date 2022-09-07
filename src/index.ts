import { Telegraf } from "telegraf";
import dotenv from "dotenv";
// @ts-ignore
import express, { Request, Response } from "express";
import { InlineQueryResult } from "telegraf/typings/core/types/typegram";
import { getRating, getSearchResults, getTrailer, getTitle, hasDate, hasDuration, hasGuidance, isVideoGame, getTrailerURL } from "./utilities";

// initialize configuration
dotenv.config();

const token = process.env.BOT_TOKEN;
if (token === undefined) {
  throw new Error("BOT_TOKEN must be provided!");
}

const bot = new Telegraf(token);

bot.on("text", (ctx) => ctx.replyWithHTML("<b>Hello</b>"));

bot.on("inline_query", async (ctx) => {
  const results = await getSearchResults(ctx.inlineQuery.query);

  const medias =
    results &&
    // @ts-ignore
    (results as any[]).slice(0, 9).map(({ url, thumbnail, title }) => ({
      type: "article",
      id: url.match(/\/title\/(?<id>[a-z]+[0-9]+)/i).groups.id,
      title,
      thumb_url: thumbnail,
      input_message_content: {
        message_text: title,
      },
      reply_markup: {
        inline_keyboard: [[{ text: "View Image", url: thumbnail }]],
      },
    }));

  return await ctx.answerInlineQuery(medias as InlineQueryResult[]);
});

bot.on("chosen_inline_result", async (ctx) => {
  const { trailerUrl } = await getTrailer(ctx.chosenInlineResult.result_id);
  const trailerVideo = await getTrailerURL(trailerUrl);
  const { rating } = await getRating(ctx.chosenInlineResult.result_id);
  const { title, subs, subsLinks } = await getTitle(ctx.chosenInlineResult.result_id);

  const idx = subs.findIndex((x: string) => x === 'Cast & crew');
  const idxLinks = subsLinks.findIndex((x: string) => x === 'Director');
  const trimmedSubs = [...subs.slice(0, idx), ...subsLinks.slice(0, idxLinks)].reverse();
  const releaseYear = trimmedSubs.find(sub => hasDate(sub));
  const duration = trimmedSubs.find(sub => hasDuration(sub));
  const pg = trimmedSubs.find(sub => hasGuidance(sub));

  bot.telegram.editMessageText(
    undefined,
    undefined,
    ctx.chosenInlineResult.inline_message_id,
    `<b>${title} (${releaseYear})</b> Rated ${pg}
<b>${!isVideoGame(subs) ? duration : ""}</b>
<b>Ratings:</b>
${rating && `IMDB: ⭐ ${rating}, `}
${trailerVideo && `<a href="${trailerVideo}">Trailer</a>`}`,
    {
      parse_mode: "HTML",
    }
  );
});

const secretPath = `/telegraf/${bot.secretPathComponent()}`;

// Set telegram webhook
bot.telegram.setWebhook(`https://boxofficerbot-production.up.railway.app${secretPath}`);

const app = express();
app.get("/", (req: Request, res: Response) => res.send("!"));

// Set the bot API endpoint
app.use(bot.webhookCallback(secretPath));
app.listen(process.env.PORT, () => {
  // tslint:disable-next-line:no-console
  console.log(`server running on port ${process.env.PORT}`);
});
