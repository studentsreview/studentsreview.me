const Class = require('../../models/class');

module.exports = (req, res) => {
    Class
        .find({ Semester: req.params.semester }, { _id: 0 })
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
