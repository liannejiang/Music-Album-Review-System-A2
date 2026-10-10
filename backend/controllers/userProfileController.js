const serializeProfile = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    university: user.university,
    address: user.address,
});

const createUserProfileController = (userProfileService) => {
    const getProfile = async (req, res) => {
        const requesterId = req.user.id;
        const targetUserId = req.params.userId || requesterId;
        try {
            const user = await userProfileService.getProfile(requesterId, targetUserId);
            res.status(200).json(serializeProfile(user));
        } catch (error) {
            res.status(error.statusCode || 500).json({
                message: error.statusCode ? error.message : 'Unable to retrieve account information',
            });
        }
    };

    return { getProfile };
};

module.exports = { createUserProfileController };
