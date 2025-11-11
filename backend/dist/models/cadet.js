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
exports.Cadet = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const cadetSchema = new mongoose_1.Schema({
    entryId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    gender: {
        type: String,
        enum: ['male', 'female', 'other'],
        required: true
    },
    weightCategory: {
        type: String,
        required: false,
        trim: true
    },
    name: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    dateOfBirth: {
        type: Date,
        required: true
    },
    age: {
        type: Number,
        required: true,
        min: 5,
        max: 50
    },
    weight: {
        type: Number,
        required: true,
        min: 10,
        max: 150
    },
    parentGuardianName: {
        type: String,
        trim: true
    },
    state: {
        type: String,
        required: true,
        trim: true,
        index: true
    },
    district: {
        type: String,
        trim: true,
        index: true,
        required: true
    },
    presentBeltGrade: {
        type: String,
        trim: true
    },
    tfiIdCardNo: {
        type: String,
        trim: true,
    },
    academicQualification: {
        type: String,
        trim: true
    },
    schoolName: {
        type: String,
        trim: true
    },
    formFileName: {
        type: String
    }
}, {
    timestamps: true // Automatically adds createdAt and updatedAt
});
// Indexes for faster searches
cadetSchema.index({ name: 1 });
cadetSchema.index({ createdAt: -1 });
// Ensure uniqueness only for non-empty TFI ID values (allow multiple blank strings)
cadetSchema.index({ tfiIdCardNo: 1 }, { unique: true, partialFilterExpression: { tfiIdCardNo: { $exists: true, $gt: '' } } });
exports.Cadet = mongoose_1.default.model('Cadet', cadetSchema);
