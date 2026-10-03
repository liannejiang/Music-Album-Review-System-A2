
const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
    trackNumber: { type: Number, required: true },
    title: { type: String, required: true },
    durationSec: { type: Number },
});

const albumSchema = new mongoose.Schema(
    {
        title: { type: String, required: true },
        artistName: { type: String, required: true },
        releaseYear: { type: Number },
        coverImageUrl: { type: String },
        tracks: {
            type: [trackSchema],
            validate: {
                validator: (tracks) => Array.isArray(tracks) && tracks.length >= 1,
                message: 'At least one track is required',
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Album', albumSchema);
