const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    company: {
        type: String,
        required: [true, 'Please provide company'],
        maxlength: 50,
    },
    position: {
        type: String,
        required: [true, 'Please provide position'],
        maxlength: 100,
    },
    status: {
        type: String,
        enum: ['interview', 'declined', 'pending'],
        default: 'pending',
    },
    createdBy: { 
        type: mongoose.Types.ObjectId, // Refferance to User model
        ref: "User",
        require: [true, "Please provide an user "]
    }
}, {timestamps: true});

module.exports = mongoose.model('Job', jobSchema);