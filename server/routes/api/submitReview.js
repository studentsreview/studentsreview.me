const Review = require('../../models/review');

module.exports = (req, res) => {
    if (req.body) {
        const newReview = new Review({
            Teacher: req.body.teacher,
            Text: req.body.text,
            Rating: req.body.rating,
            Timestamp: new Date()
        });

        newReview
            .save(err => {
                if (err) {
                    res.send({
                        success: false
                    });
                } else {
                    res.send({
                        success: true
                    });
                }
            });
    } else {
        res.send({
            success: false
        });
    }
}
