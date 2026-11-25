import GiftingExtensions
import SwiftUI
import WidgetKit

private struct CountdownEntry: TimelineEntry {
    let date: Date
    let snapshot: CountdownSnapshot?
}

private struct CountdownProvider: TimelineProvider {
    func placeholder(in context: Context) -> CountdownEntry { sample }

    func getSnapshot(in context: Context, completion: @escaping (CountdownEntry) -> Void) {
        completion(context.isPreview ? sample : current)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<CountdownEntry>) -> Void) {
        let entry = current
        guard let snapshot = entry.snapshot else {
            completion(Timeline(entries: [entry], policy: .never))
            return
        }
        let calendar = Calendar.countdown
        let today = calendar.startOfDay(for: entry.date)
        var entries = [entry]
        for day in 1...8 {
            guard let date = calendar.date(byAdding: .day, value: day, to: today) else { break }
            if date >= snapshot.expiresAt { break }
            let next = snapshot.daysRemaining(on: date) == nil ? nil : snapshot
            entries.append(CountdownEntry(date: date, snapshot: next))
            if next == nil { break }
        }
        if entries.last?.snapshot != nil {
            entries.append(CountdownEntry(date: snapshot.expiresAt, snapshot: nil))
        }
        completion(Timeline(entries: entries, policy: .never))
    }

    private var current: CountdownEntry {
        let now = Date.now
        let snapshot = try? ExtensionStore.shared()?.countdown()
        return CountdownEntry(date: now, snapshot: snapshot.flatMap { $0.daysRemaining(on: now) == nil ? nil : $0 })
    }

    private var sample: CountdownEntry {
        let now = Date.now
        let day = Calendar.countdown.date(byAdding: .day, value: 12, to: now) ?? now
        let parts = Calendar.countdown.dateComponents([.year, .month, .day], from: day)
        let date = String(format: "%04d-%02d-%02d", parts.year ?? 0, parts.month ?? 0, parts.day ?? 0)
        return CountdownEntry(date: now, snapshot: CountdownSnapshot(title: "Kite Day", day: date, cachedAt: now))
    }
}

private struct CountdownView: View {
    let entry: CountdownEntry

    var body: some View {
        VStack(alignment: .leading, spacing: 5) {
            Label("Countdown", systemImage: "gift.fill")
                .font(.caption.weight(.semibold))
                .foregroundStyle(.primary)
            Spacer(minLength: 2)
            if let snapshot = entry.snapshot, let days = snapshot.daysRemaining(on: entry.date) {
                VStack(alignment: .leading, spacing: 3) {
                    Text(days == 0 ? "Today" : days == 1 ? "1 day" : "\(days) days")
                        .font(.system(.largeTitle, design: .rounded, weight: .bold))
                        .lineLimit(1)
                        .minimumScaleFactor(0.55)
                    Text(snapshot.title).font(.headline).lineLimit(2)
                    if let label = snapshot.dateLabel {
                        Text(label).font(.caption).foregroundStyle(.secondary)
                    }
                }
                .privacySensitive()
            } else {
                Text("Next occasion").font(.headline)
                Text("Open Family Gifting to refresh.").font(.caption).foregroundStyle(.secondary)
            }
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
        .containerBackground(.fill.tertiary, for: .widget)
        .widgetURL(URL(string: "familygifting://countdown"))
    }
}

@main
struct CountdownWidget: Widget {
    var body: some WidgetConfiguration {
        StaticConfiguration(kind: ExtensionStore.widgetKind, provider: CountdownProvider()) { entry in
            CountdownView(entry: entry)
        }
        .configurationDisplayName("Gift Countdown")
        .description("See how many days are left until your next occasion.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}
