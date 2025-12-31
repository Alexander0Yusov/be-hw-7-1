// @Schema({
//   _id: false,
// })
export class CommentatorInfo {
  // @Prop({ type: Types.ObjectId, required: false, default: null })
  userId: any; // Types.ObjectId | null;

  // @Prop({ type: String, required: false, default: null })
  userLogin: string | null;
}
