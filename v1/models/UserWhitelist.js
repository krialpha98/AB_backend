import mongoose from 'mongoose';

const UserWhitelistSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
}, { collection: 'user_whitelist' }); // Explicitly define the collection name

const UserWhitelist = mongoose.model('UserWhitelist', UserWhitelistSchema);
export default UserWhitelist;
