import mongoose from 'mongoose';
const { Schema } = mongoose;

const userSchema = new Schema({
  name: {type:String, required:true},
  surname: {type:String, required:true},
  email: {type:String, unique:true, required:true},
  password: {type:String},
  verify: String,
},{ versionKey: false })

export const User = mongoose.model('users', userSchema);
