
const Review = require('../models/Review');

const roundToOneDecimal = (value) => Math.round(value * 10) / 10;

const aggregateRating = async (albumId) => {
    const reviews = await Review.find({ albumId }).select('stars');
    const reviewCount = reviews.length;

    if (reviewCount === 0) {
        return { averageRating: null, reviewCount: 0 };
    }

    const sum = reviews.reduce((total, review) => total + review.stars, 0);
    return { averageRating: roundToOneDecimal(sum / reviewCount), reviewCount };
};

module.exports = { aggregateRating, roundToOneDecimal };
