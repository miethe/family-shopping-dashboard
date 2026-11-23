import Foundation

enum WireFormat {
    static func decoder() -> JSONDecoder {
        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase
        decoder.dateDecodingStrategy = .custom { decoder in
            let container = try decoder.singleValueContainer()
            let value = try container.decode(String.self)
            let formatter = ISO8601DateFormatter()
            formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
            if let date = formatter.date(from: value) {
                return date
            }
            formatter.formatOptions = [.withInternetDateTime]
            if let date = formatter.date(from: value) {
                return date
            }
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Expected an ISO 8601 timestamp.")
        }
        return decoder
    }

    static func encoder() -> JSONEncoder {
        let encoder = JSONEncoder()
        encoder.keyEncodingStrategy = .convertToSnakeCase
        encoder.dateEncodingStrategy = .iso8601
        return encoder
    }
}

/// A date on the Gregorian calendar, independent of a time zone.
public struct CalendarDate: Codable, Hashable, Comparable, Sendable {
    public let rawValue: String
    private let year: Int
    private let month: Int
    private let day: Int

    public init?(_ value: String) {
        let pieces = value.split(separator: "-", omittingEmptySubsequences: false)
        guard pieces.count == 3, pieces[0].count == 4, pieces[1].count == 2, pieces[2].count == 2,
              pieces.joined().utf8.allSatisfy({ (48...57).contains($0) }),
              let year = Int(pieces[0]), let month = Int(pieces[1]), let day = Int(pieces[2]),
              year > 0
        else { return nil }

        let calendar = Calendar(identifier: .iso8601)
        let components = DateComponents(year: year, month: month, day: day)
        guard components.isValidDate(in: calendar) else { return nil }
        rawValue = value
        self.year = year
        self.month = month
        self.day = day
    }

    /// Local midnight for displaying the same calendar day in the app.
    public var date: Date {
        var calendar = Calendar(identifier: .gregorian)
        calendar.timeZone = .current
        return calendar.date(from: DateComponents(year: year, month: month, day: day))!
    }

    public init(from decoder: any Decoder) throws {
        let container = try decoder.singleValueContainer()
        let value = try container.decode(String.self)
        guard let date = Self(value) else {
            throw DecodingError.dataCorruptedError(in: container, debugDescription: "Expected a Gregorian date in YYYY-MM-DD format.")
        }
        self = date
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(rawValue)
    }

    public static func < (lhs: Self, rhs: Self) -> Bool {
        lhs.rawValue < rhs.rawValue
    }
}

/// JSON values for open-ended server metadata such as recurrence rules and activity details.
public enum JSONValue: Codable, Equatable, Sendable {
    case object([String: JSONValue])
    case array([JSONValue])
    case string(String)
    case number(Decimal)
    case bool(Bool)
    case null

    public var stringValue: String? {
        guard case let .string(value) = self else { return nil }
        return value
    }

    public init(from decoder: any Decoder) throws {
        let container = try decoder.singleValueContainer()
        if container.decodeNil() {
            self = .null
        } else if let value = try? container.decode(Bool.self) {
            self = .bool(value)
        } else if let value = try? container.decode(Decimal.self) {
            self = .number(value)
        } else if let value = try? container.decode(String.self) {
            self = .string(value)
        } else if let value = try? container.decode([Self].self) {
            self = .array(value)
        } else {
            self = .object(try container.decode([String: Self].self))
        }
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        switch self {
        case .object(let value): try container.encode(value)
        case .array(let value): try container.encode(value)
        case .string(let value): try container.encode(value)
        case .number(let value): try container.encode(value)
        case .bool(let value): try container.encode(value)
        case .null: try container.encodeNil()
        }
    }
}

@propertyWrapper
public struct Money: Codable, Sendable {
    public let wrappedValue: Decimal

    public init(wrappedValue: Decimal) {
        self.wrappedValue = wrappedValue
    }

    public init(from decoder: any Decoder) throws {
        let container = try decoder.singleValueContainer()
        if let value = try? container.decode(Decimal.self) {
            wrappedValue = value
        } else {
            let string = try container.decode(String.self)
            guard string.wholeMatch(of: /[+-]?[0-9]+(?:\.[0-9]+)?(?:[eE][+-]?[0-9]+)?/) != nil,
                  let value = Decimal(string: string, locale: Locale(identifier: "en_US_POSIX"))
            else {
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Expected a decimal amount.")
            }
            wrappedValue = value
        }
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(wrappedValue)
    }
}

@propertyWrapper
public struct OptionalMoney: Codable, Sendable {
    public let wrappedValue: Decimal?

    public init(wrappedValue: Decimal?) {
        self.wrappedValue = wrappedValue
    }

    public init(from decoder: any Decoder) throws {
        if try decoder.singleValueContainer().decodeNil() {
            wrappedValue = nil
        } else {
            wrappedValue = try Money(from: decoder).wrappedValue
        }
    }

    public func encode(to encoder: any Encoder) throws {
        var container = encoder.singleValueContainer()
        try container.encode(wrappedValue)
    }
}

extension KeyedDecodingContainer {
    func decode(_ type: OptionalMoney.Type, forKey key: Key) throws -> OptionalMoney {
        try decodeIfPresent(type, forKey: key) ?? OptionalMoney(wrappedValue: nil)
    }
}
