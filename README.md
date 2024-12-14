<p align="center">
<img src="https://user-images.githubusercontent.com/10214025/166145969-d8f5d3a8-e2b4-4f6d-a1e9-f9f0a3b2f7f4.png" width="300" alt="WaniKani logo">
</p>

<h3><p align="center">WaniKani companion</p></h3>

<p align="center">
    An (unofficial) mobile app for the [WaniKani](https://www.wanikani.com) - Japanese kanji learning platform.
</p>

![](docs/preview.gif)

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
