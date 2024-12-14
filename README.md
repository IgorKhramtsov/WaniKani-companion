<p align="center">
<img src="assets/images/wanikani-companion.png" width="300" alt="WaniKani-companion logo">
</p>

<p align="center">
    An (unofficial) mobile app for <a href="https://www.wanikani.com">WaniKani</a> - Japanese kanji learning platform.
</p>

<div align="center">
<img src="docs/preview.gif" width="300" alt="WaniKani-companion app preview">
</div>

Features:

- Lessons
- Reviews
- Extra study quizes
- Offline items browsing

## Runbook

1. `yarn ios` - to run on iOS simulator
2. `yarn drizzle-kit generate` - generate drizzle migrations from schema change

## Check out user scripts
https://community.wanikani.com/t/my-journey-of-368-days-the-ultimate-guide-for-wk/31318/2

## TODO
1. Patterns of use (context) is not in the API yet. I need to scrap it someway.
   Possible solution - scrap data manually using the cookies and upload it to
   github grouped by level. Add an action to update it periodically.

NOTES:

1. Undocumented api for fetching data for review - https://www.wanikani.com/subjects/review/items?ids=512-68-2617
   this data probably contain additional auxiliary_meanings/auxiliary_readings

   NOTE: I once got this warning, so it might be useful to scrape it as well.
   https://www.wanikani.com/subjects/review/items?ids=7616
   {"type":"warn","message":"This vocab has an unusual spelling, so watch out for that!","reading":"とうか"}
