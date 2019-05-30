const Class = require('../../models/class');

module.exports = (req, res, next) => {
    Class
        .find({}, { Semester: 1, _id: 0 })
        .distinct('Semester')
        .then(data => res.json({
            status: 200,
            data
        }))
        .catch(() => {
            const err = new Error('Unexpected server error.');
            err.status = 500;
            next(err);
        });
}
