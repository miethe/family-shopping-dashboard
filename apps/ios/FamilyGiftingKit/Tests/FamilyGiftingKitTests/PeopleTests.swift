import Foundation
import Testing
@testable import FamilyGiftingKit

@Suite("People")
struct PeopleTests {
    @Test func nameOnlyCreationOnPictureStep() throws {
        let input = try PersonCreatorStep.picture.creationInput(PersonCreate(displayName: " Juno Hartwell \n"), skipping: true)
        let fields = try jsonFields(WireFormat.encoder().encode(input))
        #expect(fields == ["display_name": .string("Juno Hartwell"), "group_ids": .array([])])
    }

    @Test func backNavigationPreservesDraftAndSkipOmitsUnvisitedFields() throws {
        let date = try #require(CalendarDate("2014-12-09"))
        let draft = PersonCreate(displayName: "Juno Hartwell", relationship: "Child", groupIds: [1], birthdate: date,
                                 photoUrl: "/uploads/juno.jpg", interests: ["Drawing"],
                                 sizeProfile: [SizeEntry(type: "shoe", value: "US 5")], notes: "Likes sketchbooks")

        let previous = try #require(PersonCreatorStep.extras.previous)
        #expect(previous == .birthday)
        let backToPicture = try #require(previous.previous)
        let early = try backToPicture.creationInput(draft, skipping: true)
        #expect(early.relationship == "Child")
        #expect(early.groupIds == [1])
        #expect(early.photoUrl == nil)
        #expect(early.birthdate == nil)
        #expect(early.interests == nil)

        let fromBirthday = try previous.creationInput(draft, skipping: true)
        #expect(fromBirthday.photoUrl == "/uploads/juno.jpg")
        #expect(fromBirthday.birthdate == nil)

        let resumed = try #require(backToPicture.next?.next)
        let final = try resumed.creationInput(draft, skipping: false)
        #expect(final.birthdate == date)
        #expect(final.photoUrl == "/uploads/juno.jpg")
        #expect(final.interests == ["Drawing"])
        #expect(final.sizeProfile?.first?.value == "US 5")
        #expect(final.notes == "Likes sketchbooks")

        let withoutExtras = try resumed.creationInput(draft, skipping: true)
        #expect(withoutExtras.birthdate == date)
        #expect(withoutExtras.interests == nil)
        #expect(withoutExtras.sizeProfile == nil)
        #expect(withoutExtras.notes == nil)
    }

    @Test func validatesNameAndCreationStep() {
        #expect(throws: PersonCreationError.missingName) {
            try PersonCreatorStep.picture.creationInput(PersonCreate(displayName: " \n"), skipping: true)
        }
        #expect(throws: PersonCreationError.nameTooLong) {
            try PersonCreatorStep.validateBasics(name: String(repeating: "a", count: 101), relationship: nil)
        }
        #expect(throws: PersonCreationError.relationshipTooLong) {
            try PersonCreatorStep.validateBasics(name: "Juno Hartwell", relationship: String(repeating: "a", count: 101))
        }
        #expect(throws: PersonCreationError.invalidStep) {
            try PersonCreatorStep.basics.creationInput(PersonCreate(displayName: "Juno Hartwell"), skipping: true)
        }
        #expect(throws: PersonCreationError.invalidStep) {
            try PersonCreatorStep.picture.creationInput(PersonCreate(displayName: "Juno Hartwell"), skipping: false)
        }
    }

    @Test func createAndEditKeepPersonPayloadsAndAuthorization() async throws {
        let transport = PeopleRecordingTransport()
        let client = APIClient(address: .fixture, transport: transport, tokenStore: MemoryTokenStore(token: "test-token"))
        let date = try #require(CalendarDate("2014-12-09"))
        let created = try await client.createPerson(PersonCreate(displayName: "Juno Hartwell", relationship: "Child",
                                                                 groupIds: [1], birthdate: date, photoUrl: "/uploads/juno.jpg"))
        let updated = try await client.updatePerson(id: created.id, .photo(nil))
        #expect(updated.id == created.id)
        #expect(created.displayName == "Juno Hartwell")

        let requests = await transport.requests
        #expect(requests.map { $0.url?.path } == ["/api/v1/persons", "/api/v1/persons/3"])
        #expect(requests.allSatisfy { $0.value(forHTTPHeaderField: "Authorization") == "Bearer test-token" })
        let newFields = try jsonFields(#require(requests[0].httpBody))
        #expect(newFields["group_ids"] == .array([.number(1)]))
        #expect(newFields["birthdate"] == .string("2014-12-09"))
        #expect(newFields["photo_url"] == .string("/uploads/juno.jpg"))
        let patch = try jsonFields(#require(requests[1].httpBody))
        #expect(patch == ["photo_url": .null])
    }

    @Test func emptyGroupAndSizeEditsClearExistingValues() throws {
        let groupPatch = PersonUpdate.basics(displayName: "Juno Hartwell", relationship: nil, groupIds: [])
        let groupFields = try jsonFields(WireFormat.encoder().encode(groupPatch))
        #expect(groupFields["group_ids"] == .array([]))
        #expect(groupFields["relationship"] == .null)

        let sizeFields = try jsonFields(WireFormat.encoder().encode(PersonUpdate.sizes([])))
        #expect(sizeFields == ["size_profile": .array([]), "sizes": .null])
    }

    @Test func photoUploadUsesMultipartFileField() async throws {
        let transport = PeopleRecordingTransport()
        let client = APIClient(address: .fixture, transport: transport, tokenStore: MemoryTokenStore(token: "test-token"))
        let jpeg = Data([0xff, 0xd8, 0x7f, 0xff, 0xd9])
        let uploaded = try await client.uploadPersonPhoto(jpeg: jpeg)
        #expect(uploaded.imageUrl == "/uploads/juno.jpg")
        #expect(uploaded.filename == "juno.jpg")

        let request = try #require(await transport.requests.first)
        #expect(request.httpMethod == "POST")
        #expect(request.url?.path == "/api/v1/upload/image")
        #expect(request.value(forHTTPHeaderField: "Authorization") == "Bearer test-token")
        let contentType = try #require(request.value(forHTTPHeaderField: "Content-Type"))
        let prefix = "multipart/form-data; boundary="
        #expect(contentType.hasPrefix(prefix))
        let boundary = String(contentType.dropFirst(prefix.count))
        var expected = Data("--\(boundary)\r\nContent-Disposition: form-data; name=\"file\"; filename=\"person.jpg\"\r\nContent-Type: image/jpeg\r\n\r\n".utf8)
        expected.append(jpeg)
        expected.append(Data("\r\n--\(boundary)--\r\n".utf8))
        #expect(request.httpBody == expected)
    }

    private func jsonFields(_ data: Data) throws -> [String: JSONValue] {
        try JSONDecoder().decode([String: JSONValue].self, from: data)
    }
}

private actor PeopleRecordingTransport: HTTPTransport {
    private(set) var requests: [URLRequest] = []

    func send(_ request: URLRequest) async throws -> HTTPResponse {
        requests.append(request)
        if request.url?.path == "/api/v1/upload/image" {
            return HTTPResponse(statusCode: 200, body: Data(#"{"image_url":"/uploads/juno.jpg","filename":"juno.jpg"}"#.utf8))
        }
        let person = #"{"id":3,"display_name":"Juno Hartwell","groups":[],"occasion_ids":[],"created_at":"2026-11-23T14:02:00Z","updated_at":"2026-11-23T14:02:00Z"}"#
        return HTTPResponse(statusCode: request.httpMethod == "POST" ? 201 : 200, body: Data(person.utf8))
    }
}
