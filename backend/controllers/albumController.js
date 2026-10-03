
const Album = require('../models/Album');
const Review = require('../models/Review');
const { aggregateRating, roundToOneDecimal } = require('../utils/aggregateRating');

const PAGE_SIZE = 12;

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const validateAlbumInput = ({ title, artistName, tracks }) => {
    if (!title || typeof title !== 'string' || !title.trim()) {
        return 'Album title is required';
    }
    if (!artistName || typeof artistName !== 'string' || !artistName.trim()) {
        return 'Artist name is required';
    }
    if (!Array.isArray(tracks) || tracks.length < 1) {
        return 'At least one track is required';
    }
    for (const track of tracks) {
        const trackNumber = Number(track.trackNumber);
        if (track.trackNumber === undefined || track.trackNumber === null || !Number.isInteger(trackNumber) || trackNumber < 1) {
            return 'Each track requires a positive integer track number';
        }
        if (!track.title || typeof track.title !== 'string' || !track.title.trim()) {
            return 'Each track requires a title';
        }
        if (track.durationSec !== undefined && track.durationSec !== null) {
            const durationSec = Number(track.durationSec);
            if (!Number.isInteger(durationSec) || durationSec < 0) {
                return 'Track duration must be a non-negative integer number of seconds';
            }
        }
    }
    return null;
};

const createAlbum = async (req, res) => {
    const { title, artistName, releaseYear, coverImageUrl, tracks } = req.body;

    console.log('createAlbum received tracks:', JSON.stringify(tracks));

    const validationError = validateAlbumInput({ title, artistName, tracks });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const album = await Album.create({ title, artistName, releaseYear, coverImageUrl, tracks });
        console.log('createAlbum saved tracks:', JSON.stringify(album.tracks));
        res.status(201).json(album);
    } catch (error) {
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};

const getAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }
        const { averageRating, reviewCount } = await aggregateRating(album._id);
        res.status(200).json({ ...album.toObject(), averageRating, reviewCount });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

const updateAlbum = async (req, res) => {
    const { title, artistName, releaseYear, coverImageUrl, tracks } = req.body;

    console.log('updateAlbum received tracks:', JSON.stringify(tracks));

    const validationError = validateAlbumInput({ title, artistName, tracks });
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }

    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        album.title = title;
        album.artistName = artistName;
        album.releaseYear = releaseYear;
        album.coverImageUrl = coverImageUrl;
        album.tracks = tracks;

        const updatedAlbum = await album.save();
        console.log('updateAlbum saved tracks:', JSON.stringify(updatedAlbum.tracks));
        res.status(200).json(updatedAlbum);
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        if (error.name === 'ValidationError') {
            return res.status(400).json({ message: error.message });
        }
        res.status(500).json({ message: error.message });
    }
};


const deleteAlbum = async (req, res) => {
    try {
        const album = await Album.findById(req.params.id);
        if (!album) {
            return res.status(404).json({ message: 'Album not found' });
        }

        await Review.deleteMany({ albumId: album._id });
        await album.deleteOne();

        res.status(200).json({ message: 'Album deleted' });
    } catch (error) {
        if (error.name === 'CastError') {
            return res.status(404).json({ message: 'Album not found' });
        }
        res.status(500).json({ message: error.message });
    }
};

const listAlbums = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';

        let filter = {};
        if (q) {
            const pattern = new RegExp(escapeRegex(q), 'i');
            filter = {
                $or: [
                    { title: pattern },
                    { artistName: pattern },
                    { 'tracks.title': pattern },
                ],
            };
        }

        const totalCount = await Album.countDocuments(filter);
        const albums = await Album.find(filter)
            .sort({ createdAt: -1 })
            .skip((page - 1) * PAGE_SIZE)
            .limit(PAGE_SIZE);

        const ratingsByAlbum = await Review.aggregate([
            { $match: { albumId: { $in: albums.map((album) => album._id) } } },
            { $group: { _id: '$albumId', sum: { $sum: '$stars' }, reviewCount: { $sum: 1 } } },
        ]);
        const ratingsByAlbumId = new Map(ratingsByAlbum.map((entry) => [entry._id.toString(), entry]));

        const albumsWithRatings = albums.map((album) => {
            const rating = ratingsByAlbumId.get(album._id.toString());
            return {
                ...album.toObject(),
                averageRating: rating ? roundToOneDecimal(rating.sum / rating.reviewCount) : null,
                reviewCount: rating ? rating.reviewCount : 0,
            };
        });

        res.status(200).json({
            albums: albumsWithRatings,
            page,
            pageSize: PAGE_SIZE,
            totalCount,
            totalPages: Math.ceil(totalCount / PAGE_SIZE),
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createAlbum, getAlbum, updateAlbum, deleteAlbum, listAlbums };
