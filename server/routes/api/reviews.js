const Class = require('../../models/class');
const Review = require('../../models/review');

module.exports = (req, res, next) => {
    Review
        .find({ teacherKey: req.params.teacherKey }, { _id: 0 })
        .then(data => {
            if (data.length === 0) {
                Class
                    .find({ teacherKey: req.params.teacherKey })
                    .limit(1)
                    .then(hasClasses => {
                        if (hasClasses.length === 1) {
                            res.json({
                                status: 200,
                                data
                            });
                        } else {
                            const err = new Error('Requested resource not found.');
                            err.status = 404;
                            next(err);
                        }
                    })
                    .catch(() => {
                        const err = new Error('Unexpected server error.');
                        err.status = 500;
                        next(err);
                    });
            } else {
                res.json({
                    status: 200,
                    data
                });
            }
        })
        .catch(() => {
            const err = new Error('Unexpected server error.');
            err.status = 500;
            next(err);
        });
}
