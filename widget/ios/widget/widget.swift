//
//  widget.swift
//  widget
//

import WidgetKit
import SwiftUI

struct Provider: TimelineProvider {
  private let userDefaults: UserDefaults? = UserDefaults(suiteName: "group.dev.khramtsov.wanikani")
  
  func placeholder(in context: Context) -> SimpleEntry {
    SimpleEntry(date: Date(), reviews: 16)
  }
  
  func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> ()) {
    let entry = SimpleEntry(date: Date(), reviews: 16)
    completion(entry)
  }
  
  func getTimeline(in context: Context, completion: @escaping (Timeline<Entry>) -> ()) {
    var entries: [SimpleEntry] = []
    
    // Generate a timeline consisting of five entries an hour apart, starting from the current date.
    let currentDate = Date()
    let dict = userDefaults?.dictionary(forKey: "forecast")
    let availableRightNow: Int? = dict?["available"] as? Int
    for hourOffset in 0 ..< 5 {
      let entryDate = Calendar.current.date(byAdding: .hour, value: hourOffset, to: currentDate)!
      let entry = SimpleEntry(date: entryDate, reviews: availableRightNow ?? 0)
      entries.append(entry)
    }
    
    let timeline = Timeline(entries: entries, policy: .atEnd)
    completion(timeline)
  }
}

struct SimpleEntry: TimelineEntry {
  let date: Date
  let reviews: Int
}

struct widgetEntryView : View {
  var entry: Provider.Entry
  
  var body: some View {
    VStack {
      Text(entry.reviews.formatted())
        .font(.largeTitle)
        .foregroundStyle(.white)
      Text("Start reviews!")
        .font(.callout)
        .foregroundStyle(.white)
      Image("ReviewsImage")
        .resizable()
        .aspectRatio(contentMode: .fit)
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
  }
}

//struct widget_Previews: PreviewProvider {
//    static var previews: some View {
//      widgetEntryView(
//        entry: SimpleEntry(date: Date(), reviews: 239)
//      )
//      .previewContext(WidgetPreviewContext(family: .systemSmall))
//    }
//}

@available(iOS 17.0, *)
#Preview(as: .systemSmall) {
  widget()
} timeline: {
  SimpleEntry(date: .now, reviews: 239)
}
