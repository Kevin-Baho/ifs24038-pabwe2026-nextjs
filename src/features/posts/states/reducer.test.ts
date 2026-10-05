import { describe, it, expect } from "vitest";
import { postsReducer, initialPostsState } from "./reducer";
import { ActionType } from "@/types/action";
import { Post, PostComment } from "@/types";

describe("postsReducer", () => {
  const dummyPost1: Post = {
    id: "post-1",
    user_id: "user-1",
    author: { id: "user-1", name: "Risky" },
    description: "First Post",
    cover: null,
    total_likes: 2,
    is_liked: false,
    total_comments: 1,
    comments: [
      {
        id: "comm-1",
        comment: "Comment 1",
        created_at: "2026-10-04T12:00:00.000Z",
      },
    ],
    created_at: "2026-10-04T10:00:00.000Z",
  };

  const dummyPost2: Post = {
    id: "post-2",
    user_id: "user-2",
    author: { id: "user-2", name: "Budi" },
    description: "Second Post",
    cover: null,
    total_likes: 0,
    is_liked: true,
    total_comments: 0,
    comments: [],
    created_at: "2026-10-04T11:00:00.000Z",
  };

  it("should return default state when unknown action", () => {
    expect(postsReducer(undefined, { type: "UNKNOWN" })).toEqual(
      initialPostsState
    );
  });

  it("should handle POSTS_RECEIVE action", () => {
    const action = {
      type: ActionType.POSTS_RECEIVE,
      payload: { posts: [dummyPost1, dummyPost2] },
    };
    const state = postsReducer(initialPostsState, action);
    expect(state.posts).toHaveLength(2);
  });

  it("should handle POSTS_RECEIVE with missing payload", () => {
    const action = { type: ActionType.POSTS_RECEIVE };
    const state = postsReducer(initialPostsState, action);
    expect(state.posts).toEqual([]);
  });

  it("should handle POST_DETAIL_RECEIVE and POST_CLEAR_DETAIL actions", () => {
    const receiveAction = {
      type: ActionType.POST_DETAIL_RECEIVE,
      payload: { post: dummyPost1 },
    };
    let state = postsReducer(initialPostsState, receiveAction);
    expect(state.detailPost).toEqual(dummyPost1);

    const emptyDetailAction = { type: ActionType.POST_DETAIL_RECEIVE };
    state = postsReducer(state, emptyDetailAction);
    expect(state.detailPost).toBeNull();

    state = postsReducer(
      { ...initialPostsState, detailPost: dummyPost1 },
      { type: ActionType.POST_CLEAR_DETAIL }
    );
    expect(state.detailPost).toBeNull();
  });

  it("should handle POST_ADD action", () => {
    const action = {
      type: ActionType.POST_ADD,
      payload: { post: dummyPost1 },
    };
    const state = postsReducer(initialPostsState, action);
    expect(state.posts).toEqual([dummyPost1]);

    const emptyAction = { type: ActionType.POST_ADD, payload: {} };
    const unchangedState = postsReducer(state, emptyAction);
    expect(unchangedState).toEqual(state);
  });

  it("should handle POST_UPDATE action", () => {
    const existingState = {
      posts: [dummyPost1, dummyPost2],
      detailPost: dummyPost1,
      loading: false,
    };

    const updatedPost = { ...dummyPost1, description: "Updated First Post" };
    const action = {
      type: ActionType.POST_UPDATE,
      payload: { post: updatedPost },
    };

    const state = postsReducer(existingState, action);
    expect(state.posts[0].description).toBe("Updated First Post");
    expect(state.detailPost?.description).toBe("Updated First Post");

    const updatePost2 = { ...dummyPost2, description: "Updated Second Post" };
    const state2 = postsReducer(existingState, {
      type: ActionType.POST_UPDATE,
      payload: { post: updatePost2 },
    });
    expect(state2.detailPost?.description).toBe("First Post");

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_UPDATE,
        payload: {},
      })
    ).toEqual(existingState);
  });

  it("should handle POST_DELETE action", () => {
    const existingState = {
      posts: [dummyPost1, dummyPost2],
      detailPost: dummyPost1,
      loading: false,
    };

    const action = {
      type: ActionType.POST_DELETE,
      payload: { id: "post-1" },
    };

    const state = postsReducer(existingState, action);
    expect(state.posts).toHaveLength(1);
    expect(state.posts[0].id).toBe("post-2");
    expect(state.detailPost).toBeNull();

    const state2 = postsReducer(existingState, {
      type: ActionType.POST_DELETE,
      payload: { id: "post-2" },
    });
    expect(state2.detailPost).toEqual(dummyPost1);

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_DELETE,
        payload: {},
      })
    ).toEqual(existingState);
  });

  it("should handle POST_TOGGLE_LIKE action", () => {
    const existingState = {
      posts: [dummyPost1, dummyPost2],
      detailPost: dummyPost1,
      loading: false,
    };

    const actionWithTotalLikes = {
      type: ActionType.POST_TOGGLE_LIKE,
      payload: { id: "post-1", isLiked: true, totalLikes: 5 },
    };
    const state1 = postsReducer(existingState, actionWithTotalLikes);
    expect(state1.posts[0].is_liked).toBe(true);
    expect(state1.posts[0].total_likes).toBe(5);
    expect(state1.detailPost?.is_liked).toBe(true);
    expect(state1.detailPost?.total_likes).toBe(5);

    const actionInc = {
      type: ActionType.POST_TOGGLE_LIKE,
      payload: { id: "post-1", isLiked: true },
    };
    const stateInc = postsReducer(existingState, actionInc);
    expect(stateInc.posts[0].total_likes).toBe(3);
    expect(stateInc.detailPost?.total_likes).toBe(3);

    const actionDec = {
      type: ActionType.POST_TOGGLE_LIKE,
      payload: { id: "post-1", isLiked: false },
    };
    const stateDec = postsReducer(existingState, actionDec);
    expect(stateDec.posts[0].total_likes).toBe(1);

    // Liking post-2 when detailPost is post-1 (branch where detailPost?.id !== id)
    const actionPost2 = {
      type: ActionType.POST_TOGGLE_LIKE,
      payload: { id: "post-2", isLiked: true },
    };
    const statePost2 = postsReducer(existingState, actionPost2);
    expect(statePost2.posts[1].is_liked).toBe(true);
    expect(statePost2.detailPost).toEqual(dummyPost1);

    // When detailPost is null
    const stateNoDetail = postsReducer(
      { ...existingState, detailPost: null },
      actionPost2
    );
    expect(stateNoDetail.detailPost).toBeNull();

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_TOGGLE_LIKE,
        payload: {},
      })
    ).toEqual(existingState);
  });

  it("should handle POST_ADD_COMMENT action including branch coverage", () => {
    const postWithoutComments: Post = {
      ...dummyPost2,
      comments: undefined as any,
    };

    const existingState = {
      posts: [dummyPost1, postWithoutComments],
      detailPost: dummyPost1,
      loading: false,
    };

    const newComment: PostComment = {
      id: "comm-2",
      comment: "New comment",
      created_at: "2026-10-04T13:00:00.000Z",
    };

    const action = {
      type: ActionType.POST_ADD_COMMENT,
      payload: { postId: "post-1", comment: newComment },
    };

    const state = postsReducer(existingState, action);
    expect(state.posts[0].total_comments).toBe(2);
    expect(state.detailPost?.comments).toHaveLength(2);
    expect(state.detailPost?.total_comments).toBe(2);

    // Add comment to post without comments array, and detailPost has different ID
    const actionPost2 = {
      type: ActionType.POST_ADD_COMMENT,
      payload: { postId: "post-2", comment: newComment },
    };
    const statePost2 = postsReducer(existingState, actionPost2);
    expect(statePost2.posts[1].comments).toEqual([newComment]);
    expect(statePost2.detailPost?.comments).toHaveLength(1);

    // When detailPost is null
    const stateNoDetail = postsReducer(
      { ...existingState, detailPost: null },
      actionPost2
    );
    expect(stateNoDetail.detailPost).toBeNull();

    // Missing payload branches
    expect(
      postsReducer(existingState, {
        type: ActionType.POST_ADD_COMMENT,
        payload: {},
      })
    ).toEqual(existingState);

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_ADD_COMMENT,
        payload: { postId: "post-1" },
      })
    ).toEqual(existingState);

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_ADD_COMMENT,
        payload: { comment: newComment },
      })
    ).toEqual(existingState);
  });

  it("should handle POST_DELETE_COMMENT action including branch coverage", () => {
    const postWithoutComments: Post = {
      ...dummyPost2,
      comments: undefined as any,
    };

    const existingState = {
      posts: [dummyPost1, postWithoutComments],
      detailPost: dummyPost1,
      loading: false,
    };

    const action = {
      type: ActionType.POST_DELETE_COMMENT,
      payload: { postId: "post-1", commentId: "comm-1" },
    };

    const state = postsReducer(existingState, action);
    expect(state.posts[0].total_comments).toBe(0);
    expect(state.detailPost?.comments).toHaveLength(0);
    expect(state.detailPost?.total_comments).toBe(0);

    // Delete comment on post without comments array, and detailPost has different ID
    const actionPost2 = {
      type: ActionType.POST_DELETE_COMMENT,
      payload: { postId: "post-2", commentId: "comm-x" },
    };
    const statePost2 = postsReducer(existingState, actionPost2);
    expect(statePost2.posts[1].comments).toEqual([]);
    expect(statePost2.detailPost?.comments).toHaveLength(1);

    // When detailPost is null
    const stateNoDetail = postsReducer(
      { ...existingState, detailPost: null },
      actionPost2
    );
    expect(stateNoDetail.detailPost).toBeNull();

    // Missing payload branches
    expect(
      postsReducer(existingState, {
        type: ActionType.POST_DELETE_COMMENT,
        payload: {},
      })
    ).toEqual(existingState);

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_DELETE_COMMENT,
        payload: { postId: "post-1" },
      })
    ).toEqual(existingState);

    expect(
      postsReducer(existingState, {
        type: ActionType.POST_DELETE_COMMENT,
        payload: { commentId: "comm-1" },
      })
    ).toEqual(existingState);
  });

  it("should handle POSTS_DELETE_ALL_MINE action", () => {
    const existingState = {
      posts: [dummyPost1, dummyPost2],
      detailPost: dummyPost1,
      loading: false,
    };

    const state = postsReducer(existingState, {
      type: ActionType.POSTS_DELETE_ALL_MINE,
    });

    expect(state.posts).toEqual([]);
    expect(state.detailPost).toBeNull();
  });
});
