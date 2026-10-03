
const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        albumId: { type: mongoose.Schema.Types.ObjectId, ref: 'Album', required: true },
        stars: {
            type: Number,
            required: true,
            min: 1,
            max: 5,
            validate: {
                validator: Number.isInteger,
                message: 'Rating must be an integer between 1 and 5',
            },
        },
        comment: { type: String, maxlength: 250, default: '' },
    },
    { timestamps: true }
);

reviewSchema.index({ userId: 1, albumId: 1 }, { unique: true });

module.exports = mongoose.model('Review', reviewSchema);
