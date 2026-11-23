import Foundation

public enum PersonCreatorStep: Int, CaseIterable, Identifiable, Sendable {
    case basics = 1, picture, birthday, extras, complete

    public var id: Self { self }
    public var next: Self? { Self(rawValue: rawValue + 1) }
    public var previous: Self? { Self(rawValue: rawValue - 1) }

    public static func validateBasics(name: String, relationship: String?) throws {
        let name = name.trimmingCharacters(in: .whitespacesAndNewlines)
        let relationship = relationship?.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !name.isEmpty else { throw PersonCreationError.missingName }
        guard name.unicodeScalars.count <= 100 else { throw PersonCreationError.nameTooLong }
        guard (relationship?.unicodeScalars.count ?? 0) <= 100 else { throw PersonCreationError.relationshipTooLong }
    }

    public func retainsPicture(skipping: Bool) -> Bool { !skipping || rawValue > Self.picture.rawValue }

    public func creationInput(_ draft: PersonCreate, skipping: Bool) throws -> PersonCreate {
        guard self == .extras || (skipping && self != .basics && self != .complete) else {
            throw PersonCreationError.invalidStep
        }
        try Self.validateBasics(name: draft.displayName, relationship: draft.relationship)
        let relationship = draft.relationship?.trimmingCharacters(in: .whitespacesAndNewlines)
        let retainsBirthday = !skipping || rawValue > Self.birthday.rawValue
        return PersonCreate(
            displayName: draft.displayName.trimmingCharacters(in: .whitespacesAndNewlines),
            relationship: relationship == "" ? nil : relationship,
            groupIds: draft.groupIds,
            birthdate: retainsBirthday ? draft.birthdate : nil,
            photoUrl: retainsPicture(skipping: skipping) ? draft.photoUrl : nil,
            interests: skipping ? nil : draft.interests,
            sizeProfile: skipping ? nil : draft.sizeProfile,
            notes: skipping ? nil : draft.notes
        )
    }
}

enum PersonCreationError: LocalizedError {
    case missingName, nameTooLong, relationshipTooLong, invalidStep

    var errorDescription: String? {
        switch self {
        case .missingName: "Enter their name to continue."
        case .nameTooLong: "Use 100 characters or fewer for their name."
        case .relationshipTooLong: "Use 100 characters or fewer for their relationship."
        case .invalidStep: "Continue to the next step to create their profile."
        }
    }
}

public struct PersonCreate: Encodable, Sendable {
    public let displayName: String
    public let relationship: String?
    public let groupIds: [Int]
    public let birthdate: CalendarDate?
    public let photoUrl: String?
    public let interests: [String]?
    public let sizeProfile: [SizeEntry]?
    public let notes: String?

    public init(
        displayName: String, relationship: String? = nil, groupIds: [Int] = [],
        birthdate: CalendarDate? = nil, photoUrl: String? = nil, interests: [String]? = nil,
        sizeProfile: [SizeEntry]? = nil, notes: String? = nil
    ) {
        self.displayName = displayName
        self.relationship = relationship
        self.groupIds = groupIds
        self.birthdate = birthdate
        self.photoUrl = photoUrl
        self.interests = interests
        self.sizeProfile = sizeProfile
        self.notes = notes
    }
}

/// Sends the edited field only. Optional values send null when a field is cleared.
public enum PersonUpdate: Encodable, Sendable {
    case basics(displayName: String, relationship: String?, groupIds: [Int]?)
    case birthday(CalendarDate?)
    case photo(String?)
    case interests([String])
    case sizes([SizeEntry])
    case notes(String?)

    private enum CodingKeys: String, CodingKey {
        case displayName, relationship, groupIds, birthdate, photoUrl, interests, sizeProfile, sizes, notes
    }

    public func encode(to encoder: any Encoder) throws {
        var fields = encoder.container(keyedBy: CodingKeys.self)
        switch self {
        case let .basics(displayName, relationship, groupIds):
            try fields.encode(displayName, forKey: .displayName)
            try fields.encode(relationship, forKey: .relationship)
            try fields.encodeIfPresent(groupIds, forKey: .groupIds)
        case let .birthday(date):
            try fields.encode(date, forKey: .birthdate)
        case let .photo(url):
            try fields.encode(url, forKey: .photoUrl)
        case let .interests(interests):
            try fields.encode(interests, forKey: .interests)
        case let .sizes(sizes):
            try fields.encode(sizes, forKey: .sizeProfile)
            if sizes.isEmpty {
                // The server can reconstruct a profile from its legacy sizes map.
                try fields.encodeNil(forKey: .sizes)
            }
        case let .notes(notes):
            try fields.encode(notes, forKey: .notes)
        }
    }
}

public extension SizeEntry {
    init(type: String, value: String, copyingDetailsFrom previous: Self? = nil) {
        self.init(type: type, value: value, fit: previous?.fit, brand: previous?.brand, notes: previous?.notes)
    }
}

public struct PersonPhotoUpload: Decodable, Sendable {
    public let imageUrl: String
    public let filename: String?
}

public extension APIClient {
    func createPerson(_ input: PersonCreate) async throws -> Person {
        try await request("/api/v1/persons", method: "POST", body: WireFormat.encoder().encode(input))
    }

    func updatePerson(id: Int, _ input: PersonUpdate) async throws -> Person {
        try await request("/api/v1/persons/\(id)", method: "PATCH", body: WireFormat.encoder().encode(input))
    }

    func uploadPersonPhoto(jpeg: Data) async throws -> PersonPhotoUpload {
        let boundary = "FamilyGifting-\(UUID().uuidString)"
        var body = Data("--\(boundary)\r\nContent-Disposition: form-data; name=\"file\"; filename=\"person.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n".utf8)
        body.append(jpeg)
        body.append(Data("\r\n--\(boundary)--\r\n".utf8))
        return try await request("/api/v1/upload/image", method: "POST", body: body,
                                 contentType: "multipart/form-data; boundary=\(boundary)")
    }
}
