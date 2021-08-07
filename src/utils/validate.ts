import Joi from "joi";

export const validate = async (schema: Joi.Schema, value: any) => {
    try {
        await schema.validateAsync(value);
        return null;
    } catch (err) {
        if (Joi.isError(err)) {
            return (<Joi.ValidationError>err).details.map((detail) => ({message: detail.message, path: detail.path[0]}))
        } else return err;
    }
}