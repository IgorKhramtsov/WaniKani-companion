//
//  widget.swift
//  widget
//

import WidgetKit
import SwiftUI
import SQLite3

struct Provider: TimelineProvider {
  private let userDefaults: UserDefaults? = UserDefaults(suiteName: "group.dev.khramtsov.wanikani")
  private let db = DatabaseService()

  func placeholder(in context: Context) -> SimpleEntry {
    SimpleEntry(date: Date(), availableReviews: 16, forecast: nil)
  }

  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
    let entry = SimpleEntry(date: Date(), availableReviews: 16, forecast: nil)
    completion(entry)
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) {
    var entries: [SimpleEntry] = []

    let currentDate = Date()
    let currentDateInSeconds = Int(currentDate.timeIntervalSince1970)
    let reviewCounts: [(Int, Int)] = db.getReviewCountsByDate()

    let reviewsAvailableRightNow = reviewCounts
      .filter { entry in entry.0 <= currentDateInSeconds }
      .reduce(into: 0) { acc, entry in acc += entry.1 }

    var forecast = reviewCounts.filter {entry in entry.0 > currentDateInSeconds }
    forecast.insert((0, reviewsAvailableRightNow), at: 0)

    for _ in 0 ..< 5 {
      if (forecast.isEmpty) {
        break
      }
      let forecastEntry = forecast.removeFirst()

      let entry = SimpleEntry(
        date: forecastEntry.0 == 0 ? .now : Date(timeIntervalSince1970: TimeInterval(forecastEntry.0)),
        availableReviews: (entries.last?.availableReviews ?? 0) + forecastEntry.1,
        forecast: context.family == .systemSmall
        ? nil
        : forecast.prefix(5).map { e in
          (Date(timeIntervalSince1970: TimeInterval(e.0)), e.1)
        }
      )
      entries.append(entry)
    }

    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }
}

struct SimpleEntry: TimelineEntry {
  let date: Date
  let availableReviews: Int
  let forecast: [(Date, Int)]?
}

struct widgetEntryView: View {
  var entry: Provider.Entry

  var body: some View {
    let forecast = entry.forecast
    
    func formatDate(_ date: Date) -> String {
      let formatter = DateFormatter()
      formatter.dateFormat = "h a"
      return formatter.string(from: date)
    }
    
    return HStack() {
      VStack {
        Text(entry.availableReviews.formatted())
          .font(.largeTitle)
          .foregroundStyle(.white)
        Text("Start reviews!")
          .font(.callout)
          .foregroundStyle(.white)
        Image("ReviewsImage")
          .resizable()
          .aspectRatio(contentMode: .fit)
      }
      
      if let forecast = forecast {
        let maxForecastReviews = forecast.max { e1, e2 in e1.1 < e2.1}?.1 ?? 1
          VStack {
            Text("Today's Forecast")
              .font(.headline)
              .foregroundStyle(.white)
              Spacer()
            HStack(alignment: .bottom) {
              ForEach(forecast.prefix(5), id: \.0) { date, reviewsCount in
                let height = 50.0 * (Double(reviewsCount) / Double(maxForecastReviews))
                VStack {
                  Text(reviewsCount.formatted())
                    .font(.body)
                    .foregroundStyle(.white)
                  RoundedRectangle(cornerRadius: 4)
                    .frame(width: 10, height: height)
                    .foregroundStyle(Color("Green"))
                  Text(formatDate(date))
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.75))
                }
              }
            }.frame(maxWidth: .infinity, alignment: .leading)
          }
      }
    }
  }
}

@main
struct widget: Widget {
  let kind: String = "widget"

  var body: some WidgetConfiguration {
    StaticConfiguration(kind: kind, provider: Provider()) { entry in
      if #available(iOS 17.0, *) {
        widgetEntryView(entry: entry)
          .containerBackground(
            .linearGradient(
              colors: [Color("Blue"), Color("BlueDarker")],
              startPoint: .top,
              endPoint: .bottom),
            for: .widget
          )
      } else {
        widgetEntryView(entry: entry)
          .padding()
          .background(.linearGradient(
              colors: [Color("Blue"), Color("BlueDarker")],
              startPoint: .top,
              endPoint: .bottom)
          )
      }
    }
    .configurationDisplayName("Available Reviews")
    .description("Keep track of available reviews from your home screen!")
    .supportedFamilies([.systemSmall, .systemMedium])
  }
}

// struct widget_Previews: PreviewProvider {
//    static var previews: some View {
//      widgetEntryView(
//        entry: SimpleEntry(date: Date(), reviews: 239)
//      )
//      .previewContext(WidgetPreviewContext(family: .systemSmall))
//    }
// }

@available(iOS 17.0, *)
#Preview(as: .systemMedium) {
  widget()
} timeline: {
  SimpleEntry(
    date: .now,
    availableReviews: 239,
    forecast: [
      (.now.addingTimeInterval(1 * 60 * 60), 5),
      (.now.addingTimeInterval(2 * 60 * 60), 10),
      (.now.addingTimeInterval(4 * 60 * 60), 5),
      (.now.addingTimeInterval(5 * 60 * 60), 8),
      (.now.addingTimeInterval(8 * 60 * 60), 8),
  ])
}
@available(iOS 17.0, *)
#Preview(as: .systemSmall) {
  widget()
} timeline: {
  SimpleEntry(
    date: .now,
    availableReviews: 239,
    forecast: nil
  )
}

