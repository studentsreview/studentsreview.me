const Review = require('../../models/review');

module.exports = (req, res, next) => {
    if (req.body) {
        const newReview = new Review({
            teacher: req.body.teacher,
            text: req.body.text,
            rating: req.body.rating
        });

        newReview
            .save()
            .then(() => res.json({
                status: 200
            }))
            .catch(err => {
                console.log(err);
                err = new Error('Schema validation failed.');
                err.status = 400;
                next(err);
            });
    } else {
        const err = new Error('No request body found.');
        err.status = 400;
        next(err);
    }
}
