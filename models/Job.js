const { ref } = require('joi');
const monnoose = require('mongoose');

const jobSchema = new monnoose.Schema({
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
        type: monnoose.Types.ObjectId, // Refferance to User model
        ref: "User",
        require: [true, "Please provide an user "]
    }
}, {timestamps: true});

module.exports = monnoose.model('Job', jobSchema);