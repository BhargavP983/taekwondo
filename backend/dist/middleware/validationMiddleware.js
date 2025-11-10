"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = void 0;
const zod_1 = require("zod");
const errors_1 = require("../types/errors");
const validateRequest = (schemas) => {
    return async (req, res, next) => {
        try {
            const validData = {};
            if (schemas.body) {
                validData.body = await schemas.body.parseAsync(req.body);
            }
            if (schemas.query) {
                validData.query = await schemas.query.parseAsync(req.query);
            }
            if (schemas.params) {
                validData.params = await schemas.params.parseAsync(req.params);
            }
            // Update request with validated data
            if (validData.body)
                req.body = validData.body;
            if (validData.query)
                req.query = validData.query;
            if (validData.params)
                req.params = validData.params;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                next(new errors_1.ValidationError(error.issues.map((e) => e.message).join(', ')));
            }
            else {
                next(error);
            }
        }
    };
};
exports.validateRequest = validateRequest;
