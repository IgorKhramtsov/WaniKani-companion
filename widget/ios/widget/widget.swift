//
//  widget.swift
//  widget
//

import WidgetKit
import SwiftUI
import SQLite3

extension Int {
  var ordinalSuffix: String {
    switch self {
    case 1, 21, 31: return "st"
    case 2, 22: return "nd"
    case 3, 23: return "rd"
    default: return "th"
    }
  }
}

extension Date {
  func formattedWithOrdinal() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "MMMM"
    let month = dateFormatter.string(from: self)
    let day = Calendar.current.component(.day, from: self)
    return "\(month) \(day)\(day.ordinalSuffix)"
  }
  
  func formattedLocalized() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.setLocalizedDateFormatFromTemplate("MMMMd")
    return dateFormatter.string(from: self)
  }
  
  func formattedDayOfWeek() -> String {
    let dateFormatter = DateFormatter()
    dateFormatter.dateFormat = "EEEE"
    return dateFormatter.string(from: self)
  }

  func formattedInHours() -> String {
    let formatter = DateFormatter()
    formatter.timeStyle = .short
    return formatter.string(from: self)
  }
  
  func formattedInHoursShort() -> String {
    let formatter = DateFormatter()
    formatter.dateFormat = DateFormatter.dateFormat(fromTemplate: "j", options: 0, locale: Locale.current)
//    formatter.dateFormat = DateFormatter.dateFormat(fromTemplate: "j", options: 0, locale: Locale(identifier: "en_UK"))
    return formatter.string(from: self)
  }
}

extension Calendar {
  func isDateInCurrentWeek(_ date: Date) -> Bool {
    // Get the start of the current week
    guard let startOfWeek = self.dateInterval(of: .weekOfYear, for: .now)?.start else {
      return false
    }
      
    // Get the end of the current week by adding 6 days to the start of the week
    guard let endOfWeek = self.date(byAdding: .day, value: 6, to: startOfWeek) else {
      return false
    }
    
    // Check if the date is within the current week
    return date >= startOfWeek && date <= endOfWeek
  }
}

struct Provider: TimelineProvider {
  private let userDefaults: UserDefaults? = UserDefaults(suiteName: "group.dev.khramtsov.wanikani")
  private let db = DatabaseService()
  
  func placeholder(in context: Context) -> SimpleEntry {
    SimpleEntry(
      date: .now,
      availableReviews: 16,
      forecast: context.family == .systemSmall
      ? nil
      : [
        (.now.addingTimeInterval(TimeInterval(5 * 60 * 60)), 5),
        (.now.addingTimeInterval(TimeInterval(7 * 60 * 60)), 10),
        (.now.addingTimeInterval(TimeInterval(8 * 60 * 60)), 5),
        (.now.addingTimeInterval(TimeInterval(9 * 60 * 60)), 8),
        (.now.addingTimeInterval(TimeInterval(0 * 60 * 60)), 8),
    ])
  }

  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
    let entries = getTimelineEntries(in: context)
    if let entry = entries.first {
      completion(entry)
    } else {
      completion(placeholder(in: context))
    }
  }

  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> Void) 
  {
    let entries = getTimelineEntries(in: context)
    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }
  
  func getTimelineEntries(in context: Context) -> [SimpleEntry] {
    var entries: [SimpleEntry] = []
    
    let currentDate = Date()
    let currentDateInSeconds = Int(currentDate.timeIntervalSince1970)
    let reviewCounts: [(Int, Int)] = db.getReviewCountsByDate()

    let reviewsAvailableRightNow = reviewCounts
      .filter { entry in entry.0 <= currentDateInSeconds }
      .reduce(into: 0) { acc, entry in acc += entry.1 }

    let forecast = reviewCounts.filter {entry in entry.0 > currentDateInSeconds }
    var forecast24hrs = forecast.filter {e in e.0 <= (forecast.first?.0 ?? 0) + 86400}
    forecast24hrs.insert((0, reviewsAvailableRightNow), at: 0)

    for _ in 0 ..< 5 {
      if (forecast24hrs.isEmpty) {
        break
      }
      let forecastEntry = forecast24hrs.removeFirst()

      let entry = SimpleEntry(
        date: forecastEntry.0 == 0 ? .now : Date(timeIntervalSince1970: TimeInterval(forecastEntry.0)),
        availableReviews: (entries.last?.availableReviews ?? 0) + forecastEntry.1,
        forecast: context.family == .systemSmall
        ? nil
        : forecast24hrs.prefix(5).map { e in
          (Date(timeIntervalSince1970: TimeInterval(e.0)), e.1)
        }
      )
      entries.append(entry)
    }
    
    return entries
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
      
      if let forecast = forecast, !forecast.isEmpty {
        let firstDate = forecast.first!.0
        let maxForecastReviews = forecast.max { e1, e2 in e1.1 < e2.1}?.1 ?? 1
          VStack {
            Text(
              Calendar.current.isDateInToday(firstDate)
              ? "Today's Forecast"
              : Calendar.current.isDateInTomorrow(firstDate)
              ? "Tomorrow's Forecast"
              : Calendar.current.isDateInCurrentWeek(firstDate)
              ? "\(firstDate.formattedDayOfWeek())'s Forecast"
              : firstDate.formattedLocalized()
            )
            .font(.headline)
            .foregroundStyle(.white)
            
            Spacer()
            
            HStack(alignment: .bottom) {
              Spacer()
              ForEach(forecast.prefix(5), id: \.0) { date, reviewsCount in
                let height = 50.0 * (Double(reviewsCount) / Double(maxForecastReviews))
                VStack {
                  Text(reviewsCount.formatted())
                    .font(.body)
                    .foregroundStyle(.white)
                  RoundedRectangle(cornerRadius: 4)
                    .frame(width: 10, height: height)
                    .foregroundStyle(Color("Green"))
                  Text(date.formattedInHoursShort())
                    .font(.caption)
                    .foregroundStyle(.white.opacity(0.75))
                }
                Spacer()
              }
            }.frame(maxWidth: .infinity, alignment: .leading)
          }
      }
    }.frame(maxWidth: .infinity) // make sure widget takes all the available space (for ios prior to 17)
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
#Preview("Today", as: .systemMedium) {
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
#Preview("Tomorrow", as: .systemMedium) {
  widget()
} timeline: {
  SimpleEntry(
    date: .now,
    availableReviews: 239,
    forecast: [
      (.now.addingTimeInterval(25 * 60 * 60), 5),
      (.now.addingTimeInterval(27 * 60 * 60), 10),
      (.now.addingTimeInterval(28 * 60 * 60), 5),
      (.now.addingTimeInterval(29 * 60 * 60), 8),
      (.now.addingTimeInterval(30 * 60 * 60), 8),
  ])
}
@available(iOS 17.0, *)
#Preview("This week", as: .systemMedium) {
  widget()
} timeline: {
  SimpleEntry(
    date: .now,
    availableReviews: 239,
    forecast: [
      (.now.addingTimeInterval(85 * 60 * 60), 5),
      (.now.addingTimeInterval(87 * 60 * 60), 10),
      (.now.addingTimeInterval(88 * 60 * 60), 5),
      (.now.addingTimeInterval(89 * 60 * 60), 8),
      (.now.addingTimeInterval(80 * 60 * 60), 8),
  ])
}
@available(iOS 17.0, *)
#Preview("Next week", as: .systemMedium) {
  widget()
} timeline: {
  SimpleEntry(
    date: .now,
    availableReviews: 239,
    forecast: [
      (.now.addingTimeInterval(185 * 60 * 60), 5),
      (.now.addingTimeInterval(187 * 60 * 60), 10),
      (.now.addingTimeInterval(188 * 60 * 60), 5),
      (.now.addingTimeInterval(189 * 60 * 60), 8),
      (.now.addingTimeInterval(180 * 60 * 60), 8),
  ])
}
@available(iOS 17.0, *)
#Preview("Small", as: .systemSmall) {
  widget()
} timeline: {
  SimpleEntry(
    date: .now,
    availableReviews: 239,
    forecast: nil
  )
}

