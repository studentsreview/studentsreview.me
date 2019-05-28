const mongoose = require('mongoose');

const Class = require('./class');

const reviewSchema = new mongoose.Schema({
    Teacher: {
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
    Text: {
        type: String,
        minlength: 100
    },
    Timestamp: {
        type: Date,
        required: true
    },
    Rating: {
        type: Number,
        min: 0,
        max: 5,
        required: true
    }
}, {
    versionKey: 'version'
});

module.exports = mongoose.model('Review', reviewSchema, 'reviews');
