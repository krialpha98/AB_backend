import mongoose from 'mongoose';

const UserWhitelistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
});

const UserWhitelist = mongoose.model('UserWhitelist', UserWhitelistSchema);
export default UserWhitelist;
