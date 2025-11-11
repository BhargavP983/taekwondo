"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Poomsae = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const poomsaeSchema = new mongoose_1.Schema({
    entryId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    division: {
        type: String,
        enum: ['Under 30', 'Under 40', 'Under 50', 'Under 60', 'Under 65', 'Over 65', 'Over 30'],
        required: true
    },
    category: {
        type: String,
        enum: ['Individual', 'Pair', 'Group'],
        required: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female'],
        required: true
    },
    name: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    stateOrg: {
        type: String,
        required: true,
        trim: true
    },
    district: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
        required: true
    },
    weight: {
        type: Number,
        required: true
    },
    parentGuardianName: {
        type: String,
        trim: true
    },
    mobileNo: {
        type: String,
        required: true,
        trim: true,
        match: [/^[0-9]{10}$/, 'Please provide a valid 10-digit mobile number']
    },
    currentBeltGrade: {
        type: String,
        trim: true
    },
    tfiIdNo: {
        type: String,
        trim: true
    },
    danCertificateNo: {
        type: String,
        trim: true
    },
    academicQualification: {
        type: String,
        trim: true
    },
    nameOfCollege: {
        type: String,
        trim: true
    },
    nameOfBoardUniversity: {
        type: String,
        trim: true
    },
    formFileName: {
        type: String
    }
}, {
    timestamps: true
});
// Indexes
poomsaeSchema.index({ name: 1 });
poomsaeSchema.index({ division: 1 });
poomsaeSchema.index({ createdAt: -1 });
// Ensure uniqueness only for non-empty TFI ID values
poomsaeSchema.index({ tfiIdNo: 1 }, { unique: true, partialFilterExpression: { tfiIdNo: { $exists: true, $gt: '' } } });
exports.Poomsae = mongoose_1.default.model('Poomsae', poomsaeSchema);
