
require('dotenv').config();

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Album = require('../models/Album');
const User = require('../models/User');
const Review = require('../models/Review');

// Demo accounts only — this password is deliberately public (documented in
// the README), not a committed secret. Real accounts always go through
// registration and get their own password.
const DEMO_PASSWORD = 'Demo1234';

const demoUsers = [
    { name: 'Brad', email: 'brad@example.com' },
    { name: 'Mika', email: 'mika@example.com' },
    { name: 'Henry', email: 'henry@example.com' },
    { name: 'Kenny', email: 'kenny@example.com' },
    { name: 'Laios', email: 'laios@example.com' },
    { name: 'Dio', email: 'dio@example.com' },
    { name: 'Giorno', email: 'giorno@example.com' },
    { name: 'Jolene', email: 'jolene@example.com' },
    { name: 'Josuke', email: 'josuke@example.com' },
];

const albums = [
    {
        title: 'Thriller',
        artistName: 'Michael Jackson',
        releaseYear: 1982,
        coverImageUrl: 'https://picsum.photos/seed/thriller-1982/500/500',
        tracks: [
            { trackNumber: 1, title: 'Wanna Be Startin\' Somethin\'', durationSec: 363 },
            { trackNumber: 2, title: 'Baby Be Mine', durationSec: 260 },
            { trackNumber: 3, title: 'The Girl Is Mine', durationSec: 242 },
            { trackNumber: 4, title: 'Thriller', durationSec: 357 },
            { trackNumber: 5, title: 'Beat It', durationSec: 258 },
            { trackNumber: 6, title: 'Billie Jean', durationSec: 294 },
            { trackNumber: 7, title: 'Human Nature', durationSec: 246 },
        ],
    },
    {
        title: 'Abbey Road',
        artistName: 'The Beatles',
        releaseYear: 1969,
        coverImageUrl: 'https://picsum.photos/seed/abbey-road-1969/500/500',
        tracks: [
            { trackNumber: 1, title: 'Come Together', durationSec: 259 },
            { trackNumber: 2, title: 'Something', durationSec: 183 },
            { trackNumber: 3, title: 'Maxwell\'s Silver Hammer', durationSec: 207 },
            { trackNumber: 4, title: 'Oh! Darling', durationSec: 207 },
            { trackNumber: 5, title: 'Here Comes the Sun', durationSec: 185 },
            { trackNumber: 6, title: 'Because', durationSec: 165 },
        ],
    },
    {
        title: 'Rumours',
        artistName: 'Fleetwood Mac',
        releaseYear: 1977,
        coverImageUrl: 'https://picsum.photos/seed/rumours-1977/500/500',
        tracks: [
            { trackNumber: 1, title: 'Second Hand News', durationSec: 163 },
            { trackNumber: 2, title: 'Dreams', durationSec: 257 },
            { trackNumber: 3, title: 'Never Going Back Again', durationSec: 132 },
            { trackNumber: 4, title: 'Don\'t Stop', durationSec: 191 },
            { trackNumber: 5, title: 'Go Your Own Way', durationSec: 218 },
            { trackNumber: 6, title: 'The Chain', durationSec: 268 },
        ],
    },
    {
        title: 'Back in Black',
        artistName: 'AC/DC',
        releaseYear: 1980,
        coverImageUrl: 'https://picsum.photos/seed/back-in-black-1980/500/500',
        tracks: [
            { trackNumber: 1, title: 'Hells Bells', durationSec: 312 },
            { trackNumber: 2, title: 'Shoot to Thrill', durationSec: 318 },
            { trackNumber: 3, title: 'Back in Black', durationSec: 255 },
            { trackNumber: 4, title: 'You Shook Me All Night Long', durationSec: 210 },
            { trackNumber: 5, title: 'Rock and Roll Ain\'t Noise Pollution', durationSec: 267 },
        ],
    },
    {
        title: 'The Dark Side of the Moon',
        artistName: 'Pink Floyd',
        releaseYear: 1973,
        coverImageUrl: 'https://picsum.photos/seed/dark-side-of-the-moon-1973/500/500',
        tracks: [
            { trackNumber: 1, title: 'Speak to Me', durationSec: 90 },
            { trackNumber: 2, title: 'Breathe', durationSec: 163 },
            { trackNumber: 3, title: 'Time', durationSec: 421 },
            { trackNumber: 4, title: 'The Great Gig in the Sky', durationSec: 276 },
            { trackNumber: 5, title: 'Money', durationSec: 382 },
            { trackNumber: 6, title: 'Us and Them', durationSec: 469 },
        ],
    },
    {
        title: 'Nevermind',
        artistName: 'Nirvana',
        releaseYear: 1991,
        coverImageUrl: 'https://picsum.photos/seed/nevermind-1991/500/500',
        tracks: [
            { trackNumber: 1, title: 'Smells Like Teen Spirit', durationSec: 301 },
            { trackNumber: 2, title: 'In Bloom', durationSec: 254 },
            { trackNumber: 3, title: 'Come as You Are', durationSec: 219 },
            { trackNumber: 4, title: 'Lithium', durationSec: 257 },
            { trackNumber: 5, title: 'Polly', durationSec: 177 },
        ],
    },
    {
        title: 'Hotel California',
        artistName: 'Eagles',
        releaseYear: 1976,
        // Deliberately no coverImageUrl — keeps the "No cover" fallback demonstrable.
        tracks: [
            { trackNumber: 1, title: 'Hotel California', durationSec: 391 },
            { trackNumber: 2, title: 'New Kid in Town', durationSec: 304 },
            { trackNumber: 3, title: 'Life in the Fast Lane', durationSec: 286 },
            { trackNumber: 4, title: 'Wasted Time', durationSec: 271 },
        ],
    },
    {
        title: 'Purple Rain',
        artistName: 'Prince',
        releaseYear: 1984,
        coverImageUrl: 'https://picsum.photos/seed/purple-rain-1984/500/500',
        tracks: [
            { trackNumber: 1, title: 'Let\'s Go Crazy', durationSec: 278 },
            { trackNumber: 2, title: 'Take Me with U', durationSec: 234 },
            { trackNumber: 3, title: 'The Beautiful Ones', durationSec: 315 },
            { trackNumber: 4, title: 'When Doves Cry', durationSec: 342 },
            { trackNumber: 5, title: 'Purple Rain', durationSec: 520 },
        ],
    },
    {
        title: '21',
        artistName: 'Adele',
        releaseYear: 2011,
        coverImageUrl: 'https://picsum.photos/seed/adele-21-2011/500/500',
        tracks: [
            { trackNumber: 1, title: 'Rolling in the Deep', durationSec: 228 },
            { trackNumber: 2, title: 'Rumour Has It', durationSec: 224 },
            { trackNumber: 3, title: 'Turning Tables', durationSec: 264 },
            { trackNumber: 4, title: 'Someone Like You', durationSec: 285 },
        ],
    },
    {
        title: 'Random Access Memories',
        artistName: 'Daft Punk',
        releaseYear: 2013,
        coverImageUrl: 'https://picsum.photos/seed/random-access-memories-2013/500/500',
        tracks: [
            { trackNumber: 1, title: 'Give Life Back to Music', durationSec: 274 },
            { trackNumber: 2, title: 'Get Lucky', durationSec: 369 },
            { trackNumber: 3, title: 'Within', durationSec: 229 },
            { trackNumber: 4, title: 'Instant Crush', durationSec: 337 },
            { trackNumber: 5, title: 'Doin\' It Right', durationSec: 253 },
        ],
    },
    // Deliberately left out of albumReviews below, so this is the one album
    // demonstrating the "No ratings yet" state.
    {
        title: 'In Rainbows',
        artistName: 'Radiohead',
        releaseYear: 2007,
        coverImageUrl: 'https://picsum.photos/seed/in-rainbows-2007/500/500',
        tracks: [
            { trackNumber: 1, title: '15 Step', durationSec: 237 },
            { trackNumber: 2, title: 'Bodysnatchers', durationSec: 243 },
            { trackNumber: 3, title: 'Nude', durationSec: 254 },
            { trackNumber: 4, title: 'Weird Fishes/Arpeggi', durationSec: 318 },
            { trackNumber: 5, title: 'Reckoner', durationSec: 291 },
        ],
    },
];

// Ratings deliberately vary in both count and value per album: In Rainbows
// gets none at all (the "No ratings yet" case), Abbey Road gets a single
// review, Thriller gets six averaging a non-round 4.3, and the rest fall
// in between — demonstrating FR-09's one-decimal rounding on more than
// just the one required example.
const albumReviews = {
    Thriller: [
        { user: 'Mika', stars: 5, comment: 'Still gets me dancing every time.' },
        { user: 'Henry', stars: 5, comment: 'A masterclass in pop production.' },
        { user: 'Kenny', stars: 4, comment: 'Billie Jean alone is worth it.' },
        { user: 'Brad', stars: 4, comment: 'Some filler but the hits are massive.' },
        { user: 'Laios', stars: 3, comment: 'Good, just not my personal favourite era.' },
        { user: 'Josuke', stars: 5, comment: 'Timeless. My parents played this on repeat.' },
    ],
    'Abbey Road': [
        { user: 'Dio', stars: 5, comment: 'Side two is one continuous piece of genius.' },
    ],
    Rumours: [
        { user: 'Giorno', stars: 4, comment: 'Dreams is the standout for me.' },
        { user: 'Jolene', stars: 5, comment: 'Every track could be a single.' },
    ],
    'Back in Black': [
        { user: 'Henry', stars: 4, comment: 'Riffs for days.' },
        { user: 'Kenny', stars: 5, comment: 'Angus never misses.' },
        { user: 'Brad', stars: 4, comment: 'Loud, simple, and it works.' },
    ],
    'The Dark Side of the Moon': [
        { user: 'Mika', stars: 5, comment: 'Headphones required.' },
        { user: 'Laios', stars: 4, comment: 'Money still sounds ahead of its time.' },
        { user: 'Dio', stars: 5, comment: 'The Great Gig in the Sky gives me chills.' },
        { user: 'Josuke', stars: 3, comment: 'Great production, a bit slow for my taste.' },
    ],
    Nevermind: [
        { user: 'Kenny', stars: 5, comment: 'Changed rock music overnight.' },
        { user: 'Giorno', stars: 4, comment: 'Raw and honest.' },
        { user: 'Jolene', stars: 4, comment: 'Come as You Are is underrated.' },
        { user: 'Laios', stars: 5, comment: "Still hits as hard as it did in '91." },
        { user: 'Henry', stars: 3, comment: 'Iconic but not my genre.' },
    ],
    'Hotel California': [
        { user: 'Brad', stars: 5, comment: 'That guitar solo earns the five stars alone.' },
        { user: 'Josuke', stars: 4, comment: 'A little long but beautifully arranged.' },
    ],
    'Purple Rain': [
        { user: 'Mika', stars: 5, comment: 'Prince at his absolute peak.' },
        { user: 'Jolene', stars: 5, comment: 'The title track is a masterpiece.' },
        { user: 'Giorno', stars: 4, comment: 'When Doves Cry is unlike anything else.' },
    ],
    21: [
        { user: 'Laios', stars: 5, comment: 'Someone Like You still wrecks me.' },
        { user: 'Kenny', stars: 4, comment: 'Powerhouse vocals throughout.' },
        { user: 'Dio', stars: 4, comment: 'Consistent from start to finish.' },
        { user: 'Henry', stars: 5, comment: 'Adele at her most powerful.' },
    ],
    'Random Access Memories': [
        { user: 'Brad', stars: 4, comment: 'Get Lucky is impossible not to dance to.' },
        { user: 'Josuke', stars: 5, comment: 'A love letter to disco done right.' },
    ],
};

const seedAlbums = async () => {
    await connectDB();

    let albumsCreated = 0;
    let albumsUpdated = 0;
    const albumIdByTitle = {};

    for (const album of albums) {
        const { coverImageUrl, ...rest } = album;
        // A plain object here would only ever ADD/overwrite fields, never
        // clear one that's absent from the seed data — so an album with no
        // coverImageUrl needs an explicit $unset, or a stale cover from an
        // earlier run would survive a rerun.
        const update = coverImageUrl !== undefined
            ? { $set: { ...rest, coverImageUrl } }
            : { $set: rest, $unset: { coverImageUrl: '' } };

        const result = await Album.findOneAndUpdate(
            { title: album.title, artistName: album.artistName },
            update,
            { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true, rawResult: true }
        );
        albumIdByTitle[album.title] = result.value._id;
        if (result.lastErrorObject?.updatedExisting) {
            albumsUpdated += 1;
        } else {
            albumsCreated += 1;
        }
    }

    let usersCreated = 0;
    const userIdByName = {};

    for (const demoUser of demoUsers) {
        let user = await User.findOne({ email: demoUser.email });
        if (!user) {
            // Goes through .save() so the schema's pre-save hook bcrypt-hashes
            // the password — a findOneAndUpdate upsert would bypass it.
            user = await User.create({
                name: demoUser.name,
                email: demoUser.email,
                password: DEMO_PASSWORD,
                role: 'user',
            });
            usersCreated += 1;
        }
        userIdByName[demoUser.name] = user._id;
    }

    let reviewsCreated = 0;
    let reviewsUpdated = 0;

    for (const [albumTitle, reviews] of Object.entries(albumReviews)) {
        const albumId = albumIdByTitle[albumTitle];
        for (const { user, stars, comment } of reviews) {
            const result = await Review.findOneAndUpdate(
                { userId: userIdByName[user], albumId },
                { userId: userIdByName[user], albumId, stars, comment },
                { upsert: true, new: true, setDefaultsOnInsert: true, runValidators: true, rawResult: true }
            );
            if (result.lastErrorObject?.updatedExisting) {
                reviewsUpdated += 1;
            } else {
                reviewsCreated += 1;
            }
        }
    }

    console.log(`Albums: ${albumsCreated} created, ${albumsUpdated} updated, ${albums.length} total.`);
    console.log(`Demo users: ${usersCreated} created, ${demoUsers.length - usersCreated} already existed.`);
    console.log(`Reviews: ${reviewsCreated} created, ${reviewsUpdated} updated.`);
    console.log(
        `Catalogue is populated and ready to verify at ${process.env.APP_URL || 'http://localhost:3000'} ` +
        '(swap in the EC2 deployment URL once MAR-20 is live).'
    );

    await mongoose.disconnect();
    process.exit(0);
};

seedAlbums().catch((error) => {
    console.error('Seeding failed:', error.message);
    process.exit(1);
});
