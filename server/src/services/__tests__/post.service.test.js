import { jest } from "@jest/globals";
const mockPostRepository = { createWithTags: jest.fn() , searchPublished: jest.fn(), findPublished: jest.fn()};
const mockEventBus = { emit: jest.fn() };
jest.unstable_mockModule("../../repositories/post.repository.js", () => ({
    PostRepository: mockPostRepository,
}));
jest.unstable_mockModule("../../events/event-bus.js", () => ({
    EventBus: mockEventBus,
}));

const { PostService } = await import("../post.service.js");

test("publish() creates a PUBLISHED post and emits post.published", async () => {
    mockPostRepository.createWithTags.mockResolvedValue({ id: "p1", title: "Hello", status: "PUBLISHED" });
    const post = await PostService.publish({ authorId: "u1", title: "Hello", body: "World" });
    expect(post.status).toBe("PUBLISHED");
    expect(mockEventBus.emit).toHaveBeenCalledWith("post.published", expect.objectContaining({ postId: "p1" }));
});
test("publish() rejects an empty title", async () => {
    await expect(PostService.publish({ authorId: "u1", title: "", body: "World" })).rejects.toThrow();
});

test("search() returns published posts containing a valid query", async () => {
    const posts = [
        { id: "p1", title: "Hello World", status: "PUBLISHED" },
    ];

    mockPostRepository.searchPublished.mockResolvedValue(posts);

    const result = await PostService.search({ query: "Hello" });

    expect(result).toEqual(posts);
});

test("search() returns all published posts for an empty query", async () => {
    const posts = [
        { id: "p1", title: "Hello World", status: "PUBLISHED" },
        { id: "p2", title: "Goodbye World", status: "PUBLISHED" },
    ];

    mockPostRepository.searchPublished.mockResolvedValue(posts);

    const result = await PostService.search({ query: "" });

    expect(result).toEqual(posts);
});

test("search() returns no posts when no published posts match the query", async () => {
    mockPostRepository.searchPublished.mockResolvedValue([]);

    const result = await PostService.search({ query: "Nonexistent" });

    expect(result).toEqual([]);
});

test("search() returns the same posts for uppercase and lowercase queries", async () => {
    const posts = [
        { id: "p1", title: "Hello World", status: "PUBLISHED" },
    ];

    mockPostRepository.searchPublished.mockResolvedValue(posts);

    const uppercaseResult = await PostService.search({ query: "HELLO" });
    const lowercaseResult = await PostService.search({ query: "hello" });

    expect(uppercaseResult).toEqual(lowercaseResult);
});

test("get/posts clamps large values", async () => {

    const posts = [
        { id: "p1", title: "Hello World", status: "PUBLISHED" },
    ];

    mockPostRepository.findPublished.mockResolvedValue(posts);

    const result = await PostService.listPublished({ query: "Hello", pageSize: 99999});
    const result2 = await PostService.listPublished({ query: "Hello", pageSize: 4158679});

    expect(result.pageSize).toEqual(result2.pageSize);
})