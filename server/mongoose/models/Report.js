const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        index: true
    },
    reason: {
        type: String,
        enum: ['inappropriate', 'uninformative'],
        required: true
    },
    review: {
        type: String,
        ref: 'Review',
        required: true
    }
});

reportSchema.pre('validate', function (next) {
    this.timestamp = new Date();
    next();
});

module.exports = mongoose.model('Report', reportSchema, 'reports');
