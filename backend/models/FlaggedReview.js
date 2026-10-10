const mongoose = require('mongoose');

const flaggedReviewSchema = new mongoose.Schema(
    {
        reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review', required: true },
        flaggedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        reason: {
            type: String,
            required: true,
            enum: ['Rude', 'Spam', 'Unrelated to Music Album'],
        },
        status: { type: String, enum: ['pending', 'dismissed'], default: 'pending' },
    },
    { timestamps: true }
);

flaggedReviewSchema.index({ reviewId: 1, flaggedBy: 1 }, { unique: true });
flaggedReviewSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('FlaggedReview', flaggedReviewSchema);
