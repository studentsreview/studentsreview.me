const mongoose = require('mongoose');
const Course = require('./Course');
const sha256 = require('sha256');

const reviewSchema = new mongoose.Schema({
    _id: String,
    teacher: {
        type: String,
        validate: v => new Promise((resolve, reject) => {
            Course
                .find({
                    teacher: v,
                    semester: `${ ['Spring', 'Fall'][Math.floor((new Date().getMonth() / 12 * 2)) % 2] }${ new Date().getFullYear() }`
                })
                .limit(1)
                .then(res => resolve(res.length === 1))
                .catch(reject)
        })
    },
    text: {
        type: String,
        minlength: 50,
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

module.exports = mongoose.model('Review', reviewSchema, 'reviews');
