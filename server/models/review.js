const mongoose = require('mongoose');
const slugify = require('slugify');

const Class = require('./class');

const reviewSchema = new mongoose.Schema({
    teacher: {
        type: String,
        validate: v => new Promise((resolve, reject) => {
            Class
                .find({
                    Teacher: {
                        $eq: v
                    }
                })
                .limit(1)
                .then(res => resolve(!!res))
        })
    },
    teacherKey: {
        type: String,
        required: true
    },
    text: {
        type: String,
        minlength: 50
    },
    timestamp: {
        type: Date,
        required: true
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
    this.teacherKey = slugify(this.teacher);
    this.timestamp = new Date();
    next();
});

module.exports = mongoose.model('Review', reviewSchema, 'reviews');
