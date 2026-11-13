import mongoose from 'mongoose';

const communityPostSchema = new mongoose.Schema(
  {
    authorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Post author is required'],
      index: true,
    },
    scope: {
      type: String,
      enum: {
        values: ['city', 'global'],
        message: '{VALUE} is not a valid post scope',
      },
      default: 'city',
      index: true,
    },
    city: {
      type: String,
      trim: true,
      default: '',
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Post content cannot be empty'],
      trim: true,
      maxlength: [2000, 'Post content cannot exceed 2000 characters'],
    },
    media: {
      public_id: {
        type: String,
        default: '',
      },
      url: {
        type: String,
        default: '',
      },
    },
    tag: {
      type: String,
      enum: ['Lost Alert', 'Found Alert', 'General Discussion'],
      default: 'General Discussion',
      index: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        parentId: {
          type: mongoose.Schema.Types.ObjectId,
          default: null,
        },
        replyToUser: {
          type: String,
          default: '',
        },
        authorId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        authorName: {
          type: String,
          default: 'Community Member',
        },
        authorCity: {
          type: String,
          default: 'Pakistan',
        },
        authorAvatar: {
          type: String,
          default: '',
        },
        content: {
          type: String,
          required: true,
          trim: true,
        },
        likes: [
          {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    commentsCount: {
      type: Number,
      default: 0,
      min: [0, 'Comments count cannot be negative'],
    },
  },
  {
    timestamps: true,
  }
);

// High-frequency compound indexes for city-based feed & chronological browsing
communityPostSchema.index({ city: 1, scope: 1, createdAt: -1 });
communityPostSchema.index({ authorId: 1, createdAt: -1 });

export const CommunityPost = mongoose.model('CommunityPost', communityPostSchema);
