import mongoose, { Schema } from "mongoose";

const likeSchema = new Schema(
  {
    video: {
      type: Schema.Types.ObjectId,
      ref: "Video"
    },
    comment: {
      type: Schema.Types.ObjectId,
      ref: "Comment"
    },
    tweet: {
      type: Schema.Types.ObjectId,
      ref: "Tweet"
    },
    likedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

// A user can like only one of: video, comment, or tweet
likeSchema.pre("save", function(next) {
  const likedItems = [this.video, this.comment, this.tweet].filter(item => item != null);
  if (likedItems.length !== 1) {
    throw new Error("A like must reference exactly one item (video, comment, or tweet)");
  }
  next();
});

export const Like = mongoose.model("Like", likeSchema);
