import {
    compile
} from '../../utils/schema';

export const ForgotPasswordSchema = compile({
    email: 'string',
    authCode: 'string',
    password: 'string',
    __options: {
        title: 'ForgotPasswordSchema',
        notRequired: ['email', 'authCode', 'password']
    }
});
