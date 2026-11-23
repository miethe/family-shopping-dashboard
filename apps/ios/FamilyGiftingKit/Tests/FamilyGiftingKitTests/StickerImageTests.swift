import Testing
import FamilyGiftingKit

@Test func stickerMatchesWebEncodeURIComponentBytes() {
    // Generated with the web creator's stickerImage("🦊", "#ffd1df").
    let golden = "data:image/svg+xml,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2296%22%20height%3D%2296%22%3E%3Crect%20width%3D%2296%22%20height%3D%2296%22%20rx%3D%2228%22%20fill%3D%22%23ffd1df%22%2F%3E%3Ctext%20x%3D%2248%22%20y%3D%2266%22%20text-anchor%3D%22middle%22%20font-size%3D%2254%22%3E%F0%9F%A6%8A%3C%2Ftext%3E%3C%2Fsvg%3E"
    let sticker = StickerImage(icon: .fox, tint: .pink)
    #expect(Array(sticker.dataURI.utf8) == Array(golden.utf8))
    #expect(StickerImage(dataURI: golden) == sticker)
    for icon in StickerImage.Icon.allCases {
        for tint in StickerImage.Tint.allCases {
            let value = StickerImage(icon: icon, tint: tint)
            #expect(value.dataURI.count <= 500)
            #expect(StickerImage(dataURI: value.dataURI) == value)
        }
    }
    #expect(StickerImage(dataURI: "/uploads/portrait.jpg") == nil)
    #expect(StickerImage(dataURI: "data:image/svg+xml,%3Cscript%2F%3E") == nil)
}
