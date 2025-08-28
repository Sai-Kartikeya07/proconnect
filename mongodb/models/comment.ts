import { IUser } from "@/types/user";
import mongoose, { Schema, Document, models, Model} from "mongoose";

export interface ICommentBase {
    user: IUser;
    text: string;
}

export interface IComment extends Document, ICommentBase {
    createdAt: Date;
    updatedAt: Date;
}

interface ICommentMethods {
    deleteComment(): Promise<void>;
}

interface ICommentStatics {
    deleteCommentById(commentId: string): Promise<void>;
}

export interface ICommentDocument extends IComment, ICommentMethods {}

export interface ICommentModel extends Model<ICommentDocument>, ICommentStatics {}

const CommentSchema = new Schema<ICommentDocument> ({
    user: {
        userId: {type: String, required: true},
        userImage: { type: String, required: true },
        firstName: {type: String, required: true},
        lastName: {type: String},
    },
    text: { type: String, required: true },
},
{
    timestamps: true,
}
);

CommentSchema.methods.deleteComment = async function () {
  try {
    await this.deleteOne();
  } catch (error) {
    console.log("error when deleting comment", error);
    throw error;
  }
};

CommentSchema.statics.deleteCommentById = async function (commentId: string) {
  try {
    const result = await this.findByIdAndDelete(commentId);
    if (!result) {
      throw new Error("Comment not found");
    }
  } catch (error) {
    console.log("error when deleting comment by id", error);
    throw error;
  }
};

export const Comment = (models.Comment as ICommentModel) || mongoose.model<ICommentDocument, ICommentModel>("Comment", CommentSchema);
