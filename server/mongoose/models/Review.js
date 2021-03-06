const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');
const { Class } = require('./Class');
const sha256 = require('sha256');
const config = require('../../../config/site_config');

const reviewSchema = new mongoose.Schema({
    _id: String,
    teacher: {
        type: String,
        validate: v => new Promise((resolve, reject) => {
            Class
                .find({
                    teacher: v,
                    semester: `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`
                })
                .limit(1)
                .then(res => resolve(res.length === 1))
                .catch(reject)
        }),
        required: true
    },
    text: {
        type: String,
        minlength: config.reviews.minCharacters,
        maxlength: config.reviews.maxCharacters,
        required: true
    },
    timestamp: {
        type: Date,
        index: true
    },
    rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    }
}, {
    versionKey: 'version'
});

reviewSchema.pre('validate', function (next) {
    this.timestamp = new Date();
    this._id = sha256(this.timestamp.toISOString().concat(this.text).concat(this.teacher));
    next();
});

const Review = mongoose.model('Review', reviewSchema, 'reviews');

const ReviewTC = composeWithMongoose(Review, {
    resolvers: {
        findMany: {
            limit: {
                defaultValue: 100000
            }
        }
    }
});

ReviewTC.setResolver('findOne', ReviewTC
    .getResolver('findOne')
    .addFilterArg({
        name: 'hash',
        type: 'String',
        query: (rawQuery, value) => {
            rawQuery._id = new RegExp(`${ value }.{54}`);
        }
    })
);

module.exports = {
    Review,
    ReviewTC
};
