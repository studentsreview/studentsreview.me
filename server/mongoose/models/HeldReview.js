const mongoose = require('mongoose');
const { composeWithMongoose }  = require('graphql-compose-mongoose');
const { Review } = require('./Review');
const sha256 = require('sha256');

const heldReviewSchema = new mongoose.Schema(Object.assign({}, Review.schema.obj, {
    remoteAddress: String,
    userAgent: String,
    recaptchaScore: Number
}));

heldReviewSchema.pre('validate', function (next) {
    this.timestamp = new Date();
    this._id = sha256(this.timestamp.toISOString().concat(this.text).concat(this.teacher));
    next();
});

const HeldReview = mongoose.model('HeldReview', heldReviewSchema, 'heldReviews');

const HeldReviewTC = composeWithMongoose(HeldReview);

module.exports = {
    HeldReview,
    HeldReviewTC
};
