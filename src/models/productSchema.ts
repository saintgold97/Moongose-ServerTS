import mongoose from 'mongoose';
const { Schema } = mongoose;

const productSchema = new Schema({
    brand:{type:String, required:true},
    model:{type:String, required:true},
    car_model_year:{type:Number, required:true},
    price:{type:Number, required:true},
},{ versionKey: false })

export const Product = mongoose.model('products', productSchema);