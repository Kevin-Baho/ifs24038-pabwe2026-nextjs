import { ActionType, AnyAction, PostsState } from "@/types/action";
import { Post } from "@/types";

export const initialPostsState: PostsState = {
  posts: [],
  detailPost: null,
  loading: false,
};

export function postsReducer(
  state: PostsState = initialPostsState,
  action: AnyAction = { type: "" }
): PostsState {
  switch (action.type) {
    case ActionType.POSTS_RECEIVE:
      return {
        ...state,
        posts: action.payload?.posts || [],
      };

    case ActionType.POST_DETAIL_RECEIVE:
      return {
        ...state,
        detailPost: action.payload?.post || null,
      };

    case ActionType.POST_CLEAR_DETAIL:
      return {
        ...state,
        detailPost: null,
      };

    case ActionType.POST_ADD:
      if (!action.payload?.post) return state;
      return {
        ...state,
        posts: [action.payload.post, ...state.posts],
      };

    case ActionType.POST_UPDATE: {
      if (!action.payload?.post) return state;
      const updatedPost = action.payload.post;
      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === updatedPost.id ? updatedPost : post
        ),
        detailPost:
          state.detailPost?.id === updatedPost.id
            ? updatedPost
            : state.detailPost,
      };
    }

    case ActionType.POST_DELETE: {
      if (!action.payload?.id) return state;
      const targetId = action.payload.id;
      return {
        ...state,
        posts: state.posts.filter((post) => post.id !== targetId),
        detailPost:
          state.detailPost?.id === targetId ? null : state.detailPost,
      };
    }

    case ActionType.POST_TOGGLE_LIKE: {
      if (!action.payload?.id) return state;
      const { id, isLiked, totalLikes } = action.payload;

      const updateLikeData = (post: Post): Post => {
        let count = post.total_likes;
        if (totalLikes !== undefined) {
          count = totalLikes;
        } else {
          count = isLiked ? post.total_likes + 1 : Math.max(0, post.total_likes - 1);
        }
        return {
          ...post,
          is_liked: isLiked,
          total_likes: count,
        };
      };

      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === id ? updateLikeData(post) : post
        ),
        detailPost:
          state.detailPost && state.detailPost.id === id
            ? updateLikeData(state.detailPost)
            : state.detailPost,
      };
    }

    case ActionType.POST_ADD_COMMENT: {
      if (!action.payload?.postId || !action.payload?.comment) return state;
      const { postId, comment } = action.payload;

      const updatePostWithComment = (post: Post): Post => ({
        ...post,
        total_comments: post.total_comments + 1,
        comments: [comment, ...(post.comments || [])],
      });

      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === postId ? updatePostWithComment(post) : post
        ),
        detailPost:
          state.detailPost && state.detailPost.id === postId
            ? updatePostWithComment(state.detailPost)
            : state.detailPost,
      };
    }

    case ActionType.POST_DELETE_COMMENT: {
      if (!action.payload?.postId || !action.payload?.commentId) return state;
      const { postId, commentId } = action.payload;

      const updatePostRemoveComment = (post: Post): Post => ({
        ...post,
        total_comments: Math.max(0, post.total_comments - 1),
        comments: (post.comments || []).filter((c) => c.id !== commentId),
      });

      return {
        ...state,
        posts: state.posts.map((post) =>
          post.id === postId ? updatePostRemoveComment(post) : post
        ),
        detailPost:
          state.detailPost && state.detailPost.id === postId
            ? updatePostRemoveComment(state.detailPost)
            : state.detailPost,
      };
    }

    case ActionType.POSTS_DELETE_ALL_MINE:
      return {
        ...state,
        posts: [],
        detailPost: null,
      };

    default:
      return state;
  }
}
